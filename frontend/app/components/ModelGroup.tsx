import { Grid2, Typography } from "@mui/material";
import { Fragment } from "react";
import ModelButton from "./ModelButton";

export default function ModelGroup({
  group,
  models,
  currentModel,
  changeModel,
  disabled,
}: {
  group: string,
  models: string[],
  currentModel: string,
  changeModel: (model: string) => void,
  disabled: boolean,
}) {
  return (
    <Fragment>
      <Typography
        sx={{
          fontWeight: "600",
          fontSize: "16px",
          lineHeight: "130%",
          letterSpacing: "-1%",
          color: "#FAFAFA",
          marginLeft: "16px",
          marginBottom: "15px",
        }}
      >
        {group}
      </Typography>
      <Grid2
        container
        rowSpacing={"5px"}
      >
      {models.map((model) =>
        <ModelButton
          key={model}
          model={model}
          currentModel={currentModel}
          changeModel={changeModel}
          disabled={disabled}
        />
      )}
      </Grid2>
    </Fragment>
  );
}