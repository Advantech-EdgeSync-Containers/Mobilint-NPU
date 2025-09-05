import logging
import torch
import os
import re
from time import time
from transformers import TextIteratorStreamer, DynamicCache
from typing import Optional, Callable, Dict, Any
from threading import Thread, Event
from mblt_model_zoo.transformers import AutoTokenizer, AutoModelForCausalLM
from mblt_model_zoo.transformers.utils import MobilintCache

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


class StopOnSignalTextIteratorStreamer(TextIteratorStreamer):
    def __init__(self, tokenizer, stop_event, **kwargs):
        super().__init__(tokenizer, **kwargs)
        self.stop_event = stop_event

    def put(self, value):
        if self.stop_event.is_set():
            self.end_of_stream = True
            raise StopIteration()
        super().put(value)


class LLMHandler:
    def __init__(self):
        self.is_available = True
        logging.info(f"[LLMHandler] Initializing...")
        
        self.system_text = None
        self.initial_cache_ready = False
        
        self._load_txt_files()
        self._select_device_and_models()
        
        if self.is_npu:
            self.models = {}
            self.tokenizers = {}
            self.initial_caches = {}
            
            for model_id in self.model_ids:
                self._preload_model(model_id)
            
            self.initial_cache_ready = True

        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.current_model_id = self.model_ids[0] if self.model_ids else ""
        self.current_cache_session_id = None

        if self.current_model_id:
            if self.is_npu:
                default_model = self.models[self.current_model_id]
                default_model.mxq_model.launch(default_model.acc)
            else:
                self.tokenizer = AutoTokenizer.from_pretrained(self.current_model_id, trust_remote_code=True)
                self.model = AutoModelForCausalLM.from_pretrained(self.current_model_id, trust_remote_code=True)
            
            logging.info(f"[LLMHandler] Activating default model: {self.current_model_id}")

        logging.info(f"[LLMHandler] >>> Initialized with {len(self.model_ids)} models <<<")
    
    def _select_device_and_models(self) -> str:
        gpu_available = torch.cuda.is_available()
        npu_available = os.path.exists("/dev/aries0")

        logging.info(f'[DEVICE] GPU: {"O" if gpu_available else "X"}, NPU: {"O" if npu_available else "X"}')
        
        if gpu_available == False and npu_available == False:
            raise SystemError("No AI Accelerator Found!")
        
        self.model_ids = [line.strip() for line in open("src/models.txt", "r")]

        self.is_npu = False
        if npu_available:
            self.is_npu = True
        
    def _get_model_id(self, model_id: str):
        if self.is_npu:
            return re.sub(r"^[^/]+", "mobilint", model_id)
        else:
            return model_id
            
    def _load_txt_files(self):
        before = self.system_text
        self.system_text = open("src/system.txt", "r").read()
        self.inter_prompt_text = open("src/inter-prompt.txt").read()
        self.base_conversation = [{"role": "system", "content": self.system_text}] if self.system_text != "" else []
        
        if before != self.system_text:
            self.initial_cache_ready = False

    def _get_or_create_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self.sessions:
            logging.info(f"[LLMHandler] Creating new session context for: {session_id}")
            self._load_txt_files()
            self.sessions[session_id] = {
                "conversation": self.base_conversation.copy(),
                "past_key_values": None if self.is_npu else DynamicCache(),
                "abort_flag": Event(),
                "stop_event": Event(),
            }
        return self.sessions[session_id]

    def _preload_model(self, model_id: str):
        if self.is_npu == False:
            logging.error(f"[LLMHandler] _preload_model is called when is_npu is False!")
            return
        
        start = time()
        logging.info(f"[LLMHandler] Preloading model: {model_id}")
        converted_model_id = self._get_model_id(model_id)
        tokenizer = AutoTokenizer.from_pretrained(converted_model_id)
        model = AutoModelForCausalLM.from_pretrained(converted_model_id)
        
        self.models[model_id] = model
        self.tokenizers[model_id] = tokenizer
        
        if len(self.base_conversation) > 0:
            prompt = tokenizer.apply_chat_template(self.base_conversation, tokenize=False, add_generation_prompt=False)
            inputs = tokenizer(prompt, return_tensors="pt")
            past_key_values = MobilintCache(model.mxq_model)
            
            model.generate(
                **inputs,
                max_new_tokens=1,
                use_cache=True,
                past_key_values=past_key_values,
                pad_token_id=tokenizer.eos_token_id,
            )
            
            self.initial_caches[model_id] = {
                "buffer": model.mxq_model.dump_cache_memory(),
                "size": past_key_values.get_seq_length()
            }
        else:
            self.initial_caches[model_id] = None
            
        model.mxq_model.dispose()
        logging.info(f"[{model_id}] Preload completed in {time() - start:.2f} sec")

    def change_model(self, new_model_id: str, force: bool = False):
        self.is_available = False
        if self.current_model_id == new_model_id and not force:
            self.is_available = True
            return

        logging.info(f"[LLMHandler] Changing model to {new_model_id}")
        old_model_id = self.current_model_id
        if old_model_id:
            if self.is_npu:
                if old_model_id in self.models:
                    self.models[old_model_id].mxq_model.dispose()
            else:
                del self.tokenizer
                del self.model

        if self.is_npu:
            self.models[new_model_id].mxq_model.launch(self.models[new_model_id].acc)
        else:
            self.tokenizer = AutoTokenizer.from_pretrained(new_model_id, trust_remote_code=True)
            self.model = AutoModelForCausalLM.from_pretrained(new_model_id, trust_remote_code=True)
            
        self.current_model_id = new_model_id
        self.current_cache_session_id = None
        self.is_available = True

    def reset_cache(self, session_id: str):
        logging.info(f"[LLMHandler] Reset cache for session: {session_id}")
        
        self._load_txt_files()
        session = self._get_or_create_session(session_id)
        session["conversation"] = self.base_conversation.copy()
        if self.is_npu:
            session["past_key_values"] = None
            if self.current_cache_session_id == session_id:
                self.current_cache_session_id = None
        else:
            session["past_key_values"] = DynamicCache()

    def abort_llm(self, session_id: str):
        if session_id in self.sessions:
            logging.info(f"[LLMHandler] Abort signal set for session: {session_id}")
            self.sessions[session_id]["abort_flag"].set()

    def generate_response(
        self, session_id: str, model_name: str, prompt: str, forEachGeneratedToken: Optional[Callable[[str], None]] = None
    ) -> tuple[bool, str]:
        self.is_available = False

        session = self._get_or_create_session(session_id)
        
        needs_change_model = model_name != self.current_model_id
        needs_load_cache = needs_change_model or self.current_cache_session_id != session_id
        
        if needs_change_model:
            self.change_model(model_name)
            
        if self.is_npu:
            model = self.models[model_name]
            tokenizer = self.tokenizers[model_name]
        else:
            model = self.model
            tokenizer = self.tokenizer
        
        if self.is_npu:
            past_key_values = MobilintCache(model.mxq_model)
            if session["past_key_values"] is None:
                if self.initial_cache_ready:
                    session["past_key_values"] = self.initial_caches[model_name]
                else:
                    session["past_key_values"] = None
            
            if session["past_key_values"]:
                past_key_values.layers[0]._seen_tokens = session["past_key_values"]["size"]
                if needs_load_cache:
                    model.mxq_model.load_cache_memory(session["past_key_values"]["buffer"])
        else:
            past_key_values = session["past_key_values"]
        
        abort_flag = session["abort_flag"]
        stop_event = session["stop_event"]

        answer = ""
        is_aborted = False

        try:
            abort_flag.clear()
            stop_event.clear()

            user_prompt = session["conversation"] + [{"role": "user", "content": prompt}]
            inter_prompt_disabled = [
                "LGAI-EXAONE/EXAONE-Deep-2.4B",
                "CohereLabs/c4ai-command-r7b-12-2024"
            ]
            if self.inter_prompt_text != "" and model_name not in inter_prompt_disabled:
                user_prompt += [{"role": "system", "content": self.inter_prompt_text}]

            prompt_text = tokenizer.apply_chat_template(user_prompt, tokenize=False, add_generation_prompt=True)
            inputs = tokenizer(prompt_text, return_tensors="pt")
            streamer = StopOnSignalTextIteratorStreamer(
                tokenizer,
                stop_event,
                skip_prompt=True,
                skip_special_tokens=True,
                temperature=0.6,
                no_repeat_ngram_size=2,
            )

            def generation_wrapper(**kwargs):
                try:
                    model.generate(**kwargs, pad_token_id=tokenizer.eos_token_id)
                except StopIteration:
                    pass
                except Exception as e:
                    logging.error(f"Exception in generation thread: {e}", exc_info=True)
                    streamer.end()

            generation_kwargs = dict(
                **inputs,
                streamer=streamer,
                max_length=past_key_values.get_max_cache_shape() if self.is_npu else 4096,
                past_key_values=past_key_values,
                use_cache=True,
            )
            thread = Thread(target=generation_wrapper, kwargs=generation_kwargs)
            thread.start()

            for new_token in streamer:
                if abort_flag.is_set():
                    stop_event.set()
                    break
                answer += new_token
                if forEachGeneratedToken:
                    forEachGeneratedToken(new_token)

            thread.join()
            is_aborted = abort_flag.is_set()
            session["conversation"] = user_prompt + [{"role": "assistant", "content": answer}]
            
            if self.is_npu:
                session["past_key_values"] = {
                    "buffer": model.mxq_model.dump_cache_memory(),
                    "size": past_key_values.get_seq_length()
                }

            return is_aborted, answer

        except Exception as e:
            logging.error(f"Error while generating response: {e}", exc_info=True)
            return True, answer

        finally:
            self.is_available = True
