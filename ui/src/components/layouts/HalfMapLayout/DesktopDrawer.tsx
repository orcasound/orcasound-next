import { Box, Theme, useMediaQuery } from "@mui/material";
import { ReactNode } from "react";

import { useLayout } from "@/context/LayoutContext";

export const DesktopDrawer = ({ children }: { children: ReactNode }) => {
  const { playbarExpanded, headerHeight, drawerSide } = useLayout();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <Box
      className="desktop-drawer"
      sx={{
        px: 0,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflowY: "auto",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        // borderRight: "1px solid rgba(255,255,255,.5)",
        height:
          mdDown && playbarExpanded
            ? `calc(100vh)` // height calc gets complex on mobile due to browser bar
            : playbarExpanded
              ? `calc(100vh - ${headerHeight})`
              : 0,
        width: "75%",
        marginLeft: drawerSide === "right" ? "25%" : 0,
        backgroundColor: "background.default",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: "height .33s ease",
      }}
    >
      {playbarExpanded && children}
    </Box>
  );
};
