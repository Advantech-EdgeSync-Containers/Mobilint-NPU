import { Grid2, IconButton } from "@mui/material";
import Image from "next/image";

export default function MobilintIncPanel({
  resetDisabled,
  onReset,
}: {
  resetDisabled: boolean,
  onReset: () => void,
}) {
  return (
    <Grid2
      container
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      padding={"18px 0px 10px 18px"}
    >
      <Image
        src="/mobilint_ci.svg"
        width={158}
        height={42}
        alt="Mobilint, Inc."
      />
      <IconButton
        aria-label="Start new conversation"
        onClick={(e) => onReset()}
        disabled={resetDisabled}
        sx={{
          padding: "10px",
          backgroundColor: "#0F2855 !important",
          borderRadius: "8px",
          marginTop: "6px",
          color: "white",
          ":hover": {
            color: "#FFFFFFB4",
          },
          ":pressed": {
            color: "white",
          },
        }}
      >
        <svg width="23" height="23" viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.0996 0C19.905 0 23 3.09504 23 6.90039V16.0996C23 19.905 19.905 23 16.0996 23H1.15039C0.845392 23 0.552581 22.8788 0.336914 22.6631C0.121247 22.4474 0 22.1546 0 21.8496V6.90039C0 3.09504 3.09504 0 6.90039 0H16.0996ZM6.90039 2.2998C4.36349 2.2998 2.2998 4.36349 2.2998 6.90039V20.7002H16.0996C18.6365 20.7002 20.7002 18.6365 20.7002 16.0996V6.90039C20.7002 4.36349 18.6365 2.2998 16.0996 2.2998H6.90039ZM12.6504 5.75V10.3496H17.25V12.6504H12.6504V17.25H10.3496V12.6504H5.75V10.3496H10.3496V5.75H12.6504Z" fill="currentColor"/>
        </svg>
      </IconButton>
    </Grid2>
  );
}