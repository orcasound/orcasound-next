import { GraphicEq } from "@mui/icons-material";
import { Box, Fab, Theme, useMediaQuery } from "@mui/material";

export default function DetectionButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <Fab
      variant="extended"
      size="large"
      color="primary"
      id="detection-button"
      sx={{
        width: "100%",
        height: "100%",
        maxWidth: "none",
        minWidth: "unset",
        whiteSpace: "nowrap",
        px: "16px",
        boxShadow: "none",
        // style to look like outlined button
        backgroundColor: disabled ? "transparent" : "primary.main",
        border: disabled ? "1px solid rgba(255,255,255,.25)" : "none",
        color: disabled ? "rgba(255,255,255,.5)" : "base.main",
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: disabled ? "transparent" : "primary.main",
          cursor: disabled ? "default" : "pointer",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <GraphicEq
          sx={{
            mr: smDown ? 0 : 1,
            color: disabled ? "rgba(255,255,255,.5)" : "base.main",
          }}
        />
        {!smDown && "Report sound"}
      </Box>
    </Fab>
  );
}
