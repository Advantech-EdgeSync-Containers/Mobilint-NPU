"use client";

import Grid2 from "@mui/material/Grid2";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { DialogType, QNA } from "./components/type";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Pretendard",
  },
});

export default function Home() {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tasksNum, setTasksNum] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");
  const [dialog, setDialog] = useState<DialogType>([]);
  const [models, setModels] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState<string>("");
  const [recentAnswer, setRecentAnswer] = useState<string | null>(null);
  const recentAnswerRef = useRef<string | null>(recentAnswer);
  const dialogRef = useRef<QNA[]>(dialog);
  const isReasoningModel = [
    "LGAI-EXAONE/EXAONE-Deep-2.4B",
  ].includes(currentModel);

  recentAnswerRef.current = recentAnswer;
  dialogRef.current = dialog;

  function onConnect() {
    setIsConnected(true);
    setTasksNum(0);
    setIsLoading(false);
    setIsAsking(false);
    setIsAnswering(false);
    setQuestion("");
    setDialog([]);
    setModels([]);
    setCurrentModel("");
    setRecentAnswer(null);
    socket.current?.emit("request_models");
  }

  function onDisconnect() {
    setIsConnected(false);
  }

  function onTasks(tasks: number) {
    setTasksNum(tasks);
  }

  function onStart() {
    console.log("start");
    setIsAnswering(true);
    setIsAsking(false);
  }

  function onToken(token: string) {
    setRecentAnswer((oldAnswer) => {
      if (oldAnswer == null)
        oldAnswer = token;
      else
        oldAnswer += token;

      return oldAnswer;
    });
  }

  function onEnd(isAborted: boolean) {
    console.log("end", isAborted);

    let newDialog = [...dialogRef.current];
    newDialog[newDialog.length - 1].answer = recentAnswerRef.current;

    setDialog(newDialog);
    setIsAnswering(false);
    setRecentAnswer(null);
  }

  function onModels(models: string[]) {
    console.log("models");
    setModels(models);
  }

  function onCurrentModel(model: string) {
    console.log("current_model");
    setCurrentModel(model);
    setIsLoading(false);
  }

  useEffect(() => {
    socket.current = io(`${window.location.protocol == 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:5000`);
    socket.current.on('connect', onConnect);
    socket.current.on('disconnect', onDisconnect);
    socket.current.on('tasks', onTasks);
    socket.current.on('start', onStart);
    socket.current.on('token', onToken);
    socket.current.on('end', onEnd);
    socket.current.on('models', onModels);
    socket.current.on('current_model', onCurrentModel);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.off('connect', onConnect);
        socket.current.off('disconnect', onDisconnect);
        socket.current.off('tasks', onTasks);
        socket.current.off('start', onStart);
        socket.current.off('token', onToken);
        socket.current.off('end', onEnd);
        socket.current.off('models', onModels);
        socket.current.off('current_model', onCurrentModel);
      }
    };
  }, []);

  function changeModel(model: string) {
    if (socket.current && isLoading == false) {
      setIsLoading(true);
      setDialog([]);
      setRecentAnswer(null);
      setCurrentModel(model);
      socket.current.emit("model", model);
    }
  }

  function ask(new_question: string) {
    if (socket.current && new_question != "") {
      setDialog((prevDialog) => {
        let newDialog = [...prevDialog];
        newDialog.push({ question: new_question, answer: null });
        return newDialog;
      });
      setIsAsking(true);
      setQuestion("");
      socket.current.emit("ask", new_question, currentModel);
    }
  }

  function abort() {
    if (socket.current) {
      socket.current.emit("abort");
      setIsAsking(false);
    }
  }

  function reset() {
    if (socket.current) {
      console.log("reset");
      setDialog([]);
      setRecentAnswer(null);
      socket.current.emit("reset");
    }
  }

  if (isConnected == false)
    return undefined;

  return (
    <ThemeProvider theme={theme}>
      <Grid2
        container
        justifyContent="center"
        alignItems="stretch"
        columnSpacing={"16px"}
        sx={{
          width: "100vw",
          height: "100vh",
          padding: "16px 24px",
          backgroundColor: "#153670",
        }}
      >
        <Grid2
          container
          alignItems="stretch"
          sx={{ width: "314px" }}
        >
          <Sidebar
            dialog={dialog}
            disabled={isLoading || isAnswering || isAsking}
            reset={reset}
            models={models}
            currentModel={currentModel}
            changeModel={changeModel}
          />
        </Grid2>
        <Grid2
          container
          size="grow"
          alignItems="stretch"
        >
          <Main
            isAnswering={isAnswering || isAsking}
            isReasoningModel={isReasoningModel}
            question={question}
            setQuestion={setQuestion}
            dialog={dialog}
            tasksNum={tasksNum}
            recentAnswer={recentAnswer}
            ask={ask}
            abort={abort}
          />
        </Grid2>
      </Grid2>
    </ThemeProvider>
  );
}
