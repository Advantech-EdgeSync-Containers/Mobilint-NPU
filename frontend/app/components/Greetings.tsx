import { Grid2, Typography } from "@mui/material";

export default function Greetings() {
  return (
    <Grid2 container justifyContent="center" direction="column" wrap="nowrap" marginBottom="60px">
      <Typography
        sx={{
          fontWeight: "bold",
          fontSize: "36px",
          lineHeight: "130%", 
          letterSpacing: "-2%",
          textAlign: "center",
          color: "#303843",
          marginBottom: "20px",
        }}
      >
        Create AI Chat at the Edge!
      </Typography>
      <Typography
        sx={{
          fontWeight: "regular",
          fontSize: "18px",
          lineHeight: "28px", 
          letterSpacing: "-1%",
          textAlign: "center",
          color: "#303843",
        }}
      >
        ARIES can run generate AI models in an edge environment.<br />
        Simply type your prompt to generate a chat entirely offline!
      </Typography>
    </Grid2>
  )
}