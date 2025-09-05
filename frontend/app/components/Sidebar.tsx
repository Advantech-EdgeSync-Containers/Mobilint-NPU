import { Grid2, Button, Typography } from "@mui/material";
import ContactUsButton from "./ContactUsButton";
import MobilintIncPanel from "./MobilintIncPanel";
import { DialogType } from "./type";
import ModelList from "./ModelList";

export default function Sidebar({
  dialog,
  reset,
  models,
  currentModel,
  changeModel,
  disabled,
}: {
  dialog: DialogType,
  reset: () => void,
  models: string[],
  currentModel: string,
  changeModel: (model: string) => void,
  disabled: boolean,
}){
  return (
    <Grid2
      container
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
    >
      <MobilintIncPanel onReset={reset} resetDisabled={disabled || dialog.length == 0} />
      <Typography
        sx={{
          marginTop: "58px",
          marginLeft: "15px",
          marginBottom: "30px",
          fontWeight: "600",
          fontSize: "16px",
          lineHeight: "130%",
          letterSpacing: "-1%",
          color: "#FAFAFA",
        }}
      >
        LLM Models
      </Typography>
      <Grid2
        container
        size="grow"
        direction="column"
        wrap="nowrap"
        justifyContent="stretch"
        alignItems="stretch"
        sx={{
          overflowY: "auto",
        }}
      >
        <ModelList
          models={models}
          currentModel={currentModel}
          changeModel={changeModel}
          disabled={disabled}
        />
      </Grid2>
      <ContactUsButton reset={reset} />
    </Grid2>
  );
}