import { Box, Stack, Theme, useMediaQuery } from "@mui/material";
import React, { MutableRefObject } from "react";

import PlayBar from "@/components/PlayBar/PlayBar";
import { useLayout } from "@/context/LayoutContext";

export default function MobileDrawer({
  masterPlayerTimeRef,
}: {
  masterPlayerTimeRef: MutableRefObject<number>;
}) {
  // const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { mobileMenuHeight, playbarExpanded } = useLayout();

  return (
    <Stack
      direction="column"
      className={"playbar-container-stack"}
      sx={{
        position: "absolute",
        bottom: playbarExpanded ? 0 : "2px",
        // `calc(${mobileMenuHeight} + 2px)`,
        top: playbarExpanded ? "0px" : "auto",
        // : `calc(100% - 72px - ${mobileMenuHeight})`, // 72px value comes from visual estimate
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: playbarExpanded ? "100%" : "calc(100% - .4rem)",
        ml: playbarExpanded ? 0 : 0,
        alignItems: "center",
        transition: "top .33s ease, bottom 0s linear",
        justifyContent: playbarExpanded ? "flex-start" : "flex-end",
        backgroundColor: playbarExpanded ? "rgba(0,0,0)" : "transparent",
        height: "70px",
        // overflowY: "scroll",
        // backdropFilter: "blur(10px)",
        // WebkitBackdropFilter: "blur(10px)",

        // maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        // WebkitMaskImage:
        //   "linear-gradient(to bottom, black 70%, transparent 100%)",
      }}
    >
      <Box
        className="playbar-container"
        sx={{
          width: mdDown ? "100%" : "46%",
          height: "100%",
          mb: mdDown ? "2px" : "2rem",
          // backgroundColor: "base.main",
          // overflow: "hidden",
          display: "flex",
        }}
      >
        <PlayBar masterPlayerTimeRef={masterPlayerTimeRef} />
      </Box>
    </Stack>
  );
}
