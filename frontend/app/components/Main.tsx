import { Grid2, FormControl, Select, MenuItem, Typography, IconButton, CircularProgress } from "@mui/material";
import ChatInput from "./ChatInput";
import { useEffect, useRef } from "react";
import { DialogType } from "./type";
import Dialog from "./Dialog";
import Greetings from "./Greetings";
import { Stop, ArrowUpward } from "@mui/icons-material";

export default function Main({
  isAnswering,
  isReasoningModel,
  question,
  setQuestion,
  dialog,
  tasksNum,
  recentAnswer,
  ask,
  abort,
}: {
  isAnswering: boolean,
  isReasoningModel: boolean,
  question: string,
  setQuestion: (question: string) => void,
  dialog: DialogType,
  tasksNum: number,
  recentAnswer: string | null,
  ask: (question: string) => void,
  abort: () => void,
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollGridRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (isAnswering == false)
      inputRef.current?.focus();
  }, [isAnswering, inputRef.current]);
  
  return (
    <Grid2
      container
      direction="column"
      alignItems="center"
      size="grow"
      rowSpacing={"60px"}
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        padding: "30px 41px 35px 41px",
      }}
    >
      <Typography
        sx={{
          alignSelf: "flex-start",
          fontWeight: "600",
          fontSize: "24px",
          lineHeight: "130%",
          letterSpacing: "-2%",
          color: "#2F3A49",
          verticalAlign: "middle",
        }}
      >
        MLA100 LLM Demo
      </Typography>
      <Grid2
        container
        size="grow"
        direction="column"
        wrap="nowrap"
        justifyContent={dialog.length == 0 ? "center" : undefined}
        alignItems="stretch"
        sx={{
          width: "100%",
          maxWidth: "880px",
          overflowY: "scroll",
        }}
        ref={scrollGridRef}
      >
        {dialog.length == 0 ?
          <Greetings /> :
          <Dialog
            dialog={dialog}
            tasksNum={tasksNum}
            isAnswering={isAnswering}
            isReasoningModel={isReasoningModel}
            recentAnswer={recentAnswer}
            scrollGridRef={scrollGridRef}
          />
        }
      </Grid2>
      <Grid2 sx={{
        width: "100%",
        maxWidth: "880px",
      }}>
        <ChatInput
          inputDisabled={isAnswering}
          value={question}
          onChange={setQuestion}
          inputRef={inputRef}
          buttonIcon={
            isAnswering ?
              <Stop sx={{ color: "white" }} /> :
              <ArrowUpward sx={{ color: "white" }} />
          }
          onButtonPressed={() => isAnswering ? abort() : ask(question)}
        />
      </Grid2>
    </Grid2>
  );
}