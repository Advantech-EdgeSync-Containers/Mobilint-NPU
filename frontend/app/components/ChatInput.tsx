import { FormControl, Input, IconButton, Grid2 } from "@mui/material";
import { RefObject } from "react";

export default function ChatInput({
  inputDisabled,
  value,
  onChange,
  inputRef,
  buttonIcon,
  onButtonPressed,
}: {
  inputDisabled: boolean,
  value: string,
  onChange: (value: string) => void,
  inputRef: RefObject<HTMLInputElement | null>,
  buttonIcon: React.ReactNode,
  onButtonPressed: () => void,
}) {
  return (
    <FormControl
      fullWidth
      variant="standard"
      sx={{
        backgroundColor: "transparent !important",
        borderRadius: "20px",
        border: "1px solid #D1D1D1",
        padding: "20px",
        ":hover": {
          border: "1px solid #006BEF",
        },
        ":focus-within": {
          border: "1px solid #006BEF",
        },
      }}
    >
      <Grid2
        container
        direction="column"
        rowSpacing="10px"
      >
        <Input
          id="chat"
          ref={inputRef}
          disabled={inputDisabled}
          placeholder="Get creative with Mobilint LLM"
          value={value}
          onChange={e => onChange(e.target.value)}
          disableUnderline
          multiline
          maxRows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !inputDisabled && !e.shiftKey) {
              e.preventDefault();
              onButtonPressed();
            }
          }}

          sx={{
            padding: 0,
            alignSelf: "stretch",

            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "150%",
            letterSpacing: "0%",
            verticalAlign: "middle",
            backgroundColor: "transparent !important",
            
            color: "#000000",
            "& ::placeholder": {
              color: "#6E6E6E",
            },
            "& .Mui-disabled::placeholder": {
              color: "#6E6E6E",
              opacity: 1,
              WebkitTextFillColor: "#6E6E6E",
            },
          }}

          inputProps={{
            maxLength: 500,
          }}
        />
        <Grid2
          container
          justifyContent={"flex-end"}
          alignItems={"flex-end"}
        >
          <IconButton
            onClick={() => onButtonPressed()}
            sx={{
              width: "45px",
              height: "45px",
              alignSelf: "flex-end",
              backgroundColor: value != "" ? "#006BEF !important" : "#B8B8B8 !important",
              ":hover": {
                backgroundColor: "#006BEF !important",
              }
            }}
          >
            {buttonIcon}
          </IconButton>
        </Grid2>
      </Grid2>
    </FormControl>
  );
}