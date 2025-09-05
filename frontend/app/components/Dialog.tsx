import { Grid2, Typography } from "@mui/material";
import { Fragment, MutableRefObject, useEffect, useRef } from "react";
import Answer from "./Answer";
import { QNA } from "./type";

export default function Dialog({
  dialog,
  tasksNum,
  isAnswering,
  isReasoningModel,
  recentAnswer,
  scrollGridRef,
}: {
  dialog: QNA[],
  tasksNum: number,
  isAnswering: boolean,
  isReasoningModel: boolean,
  recentAnswer: string | null,
  scrollGridRef: MutableRefObject<HTMLDivElement | null>,
}) {
  const bottomDivRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomDivRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" })
  }

  useEffect(() => {
    if (scrollGridRef.current != null) {
      const diff = scrollGridRef.current.scrollHeight - scrollGridRef.current.offsetHeight - scrollGridRef.current.scrollTop;
      if (-100 < diff && diff < 100)
        scrollToBottom();
    }
  }, [recentAnswer])

  useEffect(() => {
    scrollToBottom();
  }, [dialog.length])

  return (
    <Fragment>
      {dialog.map((qna, index) =>
        <Fragment key={`${index}`}>
          <Grid2 container justifyContent="flex-end">
            <Typography
              sx={{
                backgroundColor: "#F1F6FC",
                padding: "15px 20px",
                borderRadius: "20px",
                fontWeight: "regular",
                fontSize: "16px",
                lineHeight: "25px",
                letterSpacing: "-1%",
                color: "#303843",
                maxWidth: "500px",
              }}
            >
              {qna.question}
            </Typography>
          </Grid2>
          {!(isAnswering == true && index == dialog.length - 1) &&
            <Answer answer={qna.answer} tasksNum={tasksNum} isAnswering={false} isReasoningModel={isReasoningModel} />
          }
        </Fragment>
      )}
      {isAnswering &&
        <Answer answer={recentAnswer} tasksNum={tasksNum} isAnswering={isAnswering} isReasoningModel={isReasoningModel} />
      }
      <div ref={bottomDivRef}></div>
    </Fragment>
  );
}