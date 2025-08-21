import { Box, Stack } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import darkTheme from "@/styles/darkTheme";

type MobileTab = {
  label: string | undefined;
  value: string | undefined;
  content: React.ReactNode;
};

const MobileTabs = ({ tabs }: { tabs: MobileTab[] }) => {
  const router = useRouter();
  const { feedSlug } = router.query;
  const { activeMobileTab, setActiveMobileTab } = useLayout();

  // const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { nowPlayingFeed } = useNowPlaying();

  // needs an extra useEffect to set default
  useEffect(() => {
    if (tabs.length && !activeMobileTab) setActiveMobileTab(tabs[0]);
  }, [setActiveMobileTab, tabs]);

  const handleTabClick = (e: React.MouseEvent<HTMLElement>) => {
    const newTab =
      tabs.find((t) => t.value === e.currentTarget.dataset.value) ?? null;
    setActiveMobileTab(newTab);
  };

  const tabRow = (tabs: MobileTab[]) => (
    <Stack
      direction="row"
      gap="40px"
      sx={{
        borderBottom: "1px solid rgba(255,255,255,.33)",
        px: 4,
        position: "sticky",
        top: 0,
        backgroundColor: darkTheme.palette.background.default,
        zIndex: 1000,
        justifyContent: "space-between",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.value === activeMobileTab?.value;
        return (
          <Box
            key={tab.label}
            data-value={tab.value}
            onClick={handleTabClick}
            style={{
              color: active
                ? darkTheme.palette.text.primary
                : darkTheme.palette.text.secondary,
              textDecoration: "none",
              height: "100%",
              padding: "16px 0",
              whiteSpace: "nowrap",
              borderBottom: active
                ? "1px solid " + darkTheme.palette.accent3.main
                : "none",
            }}
          >
            {tab.label}
          </Box>
        );
      })}
    </Stack>
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {tabs && tabRow(tabs)}
      <Box className="tab-content" sx={{ flex: 1, px: 0, pt: 1 }}>
        {activeMobileTab?.content}
      </Box>
    </div>
  );
};

export default MobileTabs;
