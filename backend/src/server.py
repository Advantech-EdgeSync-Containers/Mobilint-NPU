import os
import time
import logging
from flask import Flask, request
from flask_socketio import SocketIO, emit
from threading import Lock
from pipeline_handler import LLMHandler
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

load_dotenv()
is_production = os.getenv("PRODUCTION", "False") == "True"
logging.info(f"is production: {is_production}")

handler = LLMHandler()

tasks = []
task_lock = Lock()


def task_worker():
    logging.info("Task worker thread started.")
    while True:
        task = None
        with task_lock:
            if handler.is_available and tasks:
                task = tasks.pop(0)
        if task:
            sid = task["sid"]
            task_type = task["type"]
            task_value = task["value"]
            logging.info(f"Processing task for session: {sid}, type: {task_type}")
            if task_type == "LLM":
                run_llm_generation(sid, **task_value)
            with task_lock:
                socketio.emit("tasks", len(tasks), room=sid)
        else:
            time.sleep(0.1)


def run_llm_generation(sid: str, question: str, model_name: str):
    logging.info(f"Session: {sid}, Model: {model_name}, LLM executing...")
    is_aborted, answer = True, ""

    try:
        socketio.emit("current_model", model_name, room=sid)
        socketio.emit("start", room=sid)

        def forEachGeneratedToken(new_token: str):
            socketio.emit("token", new_token, room=sid)
            socketio.sleep(0)

        is_aborted, answer = handler.generate_response(sid, model_name, question, forEachGeneratedToken)

    finally:
        socketio.sleep(0)
        socketio.emit("end", is_aborted, room=sid)
        logging.info(f"Session: {sid}, LLM executed")


@socketio.on("connect")
def connect():
    logging.info(f"Session connected: {request.sid}")


@socketio.on("disconnect")
def disconnect():
    global tasks, task_lock
    logging.info(f"Session disconnected: {request.sid}")
    handler.abort_llm(request.sid)
    with task_lock:
        tasks = [task for task in tasks if task["sid"] != request.sid]
    handler.sessions.pop(request.sid, None)


@socketio.on("model")
def change_model(model_name):
    handler.reset_cache(request.sid)
    
    if is_production:
        emit("current_model", model_name, room=request.sid)
        return

    with task_lock:
        if not handler.is_available:  # todo: task_lock need?
            emit("error", {"message": "Handler is busy, cannot change model."}, room=request.sid)
            return
        handler.change_model(model_name)

    emit("current_model", model_name, room=request.sid)


@socketio.on("request_models")
def request_models():
    emit("models", handler.model_ids, room=request.sid)
    emit("current_model", handler.current_model_id, room=request.sid)


@socketio.on("ask")
def ask(question: str, model_name: str):
    sid = request.sid

    if not question or not model_name:
        emit("error", {"message": "Question or model_name is missing."}, room=sid)
        return

    logging.info(f"Session: {sid}, LLM task enqueued for model {model_name}.")

    with task_lock:
        tasks.append({"sid": sid, "type": "LLM", "value": {"question": question, "model_name": model_name}})
        socketio.emit("tasks", len(tasks), room=sid)


@socketio.on("abort")
def abort():
    global tasks, task_lock
    sid = request.sid
    logging.info(f"Session: {sid}, Abort signal received.")
    handler.abort_llm(sid)
    with task_lock:
        tasks = [task for task in tasks if task["sid"] != request.sid]


@socketio.on("reset")
def reset():
    sid = request.sid
    with task_lock:
        if handler.is_available:
            handler.reset_cache(sid)
            socketio.emit("reset_done", room=sid)
        else:
            socketio.emit("error", {"message": "Handler is busy, cannot reset now."}, room=sid)


socketio.start_background_task(target=task_worker)
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
