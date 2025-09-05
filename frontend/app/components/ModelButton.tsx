import { Button } from "@mui/material";
import Image from "next/image";

export default function ModelButton({
  model,
  currentModel,
  changeModel,
  disabled,
}: {
  model: string,
  currentModel: string,
  changeModel: (model: string) => void,
  disabled: boolean,
}) {
  return (
    <Button
      fullWidth
      disableRipple
      disabled={disabled}
      onClick={(e) => changeModel(model)}
      sx={{
        padding: "9px 15px",
        textTransform: "none",
        justifyContent: "flex-start",
        alignItems: "center",
        fontWeight: "regular",
        fontSize: "16px",
        lineHeight: "130%",
        letterSpacing: "-1%",
        color: "#FAFAFA !important",
        backgroundColor: currentModel == model ? "#FAFAFA40" : undefined,
        borderRadius: "10px",
        ":hover": {
          backgroundColor: currentModel == model ? "#FAFAFA40" : "#FAFAFA19",
        }
      }}
    >
      <span
        style={{
          padding: "5px",
          height: "28px",
          backgroundColor: "#FAFAFA",
          borderRadius: "14px",
          marginRight: "15px",
        }}
      >
        <Image
          src="/model.svg"
          width={18}
          height={18}
          alt="Model Icon"
        />
      </span>
      <span style={{marginTop: "3px", textAlign: "left"}}>{model.split("/")[1]}</span>
    </Button>
  );
}