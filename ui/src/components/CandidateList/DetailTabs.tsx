import { Box, Stack, Theme, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";

import darkTheme from "@/styles/darkTheme";

export type Tab = {
  label: string | undefined;
  value: string | undefined;
  content: React.ReactNode;
};

const DetailTabs = ({
  tabs,
  showTabs = true,
  stickyTabs = false,
  spaceBetween = false,
}: {
  tabs: Tab[] | undefined;
  showTabs?: boolean;
  stickyTabs?: boolean;
  spaceBetween?: boolean;
}) => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [activeTab, setActiveTab] = useState<Tab | undefined>(tabs?.[0]);

  // needs an extra useEffect to set default
  useEffect(() => {
    if (tabs?.length) setActiveTab(tabs[0]);
  }, [setActiveTab, tabs]);

  const handleTabClick = (e: React.MouseEvent<HTMLElement>) => {
    const newTab = tabs?.find((t) => t.value === e.currentTarget.dataset.value);
    setActiveTab(newTab);
  };

  const tabRow = (tabs: Tab[]) => (
    <Stack
      direction="row"
      gap="40px"
      sx={{
        borderBottom: "1px solid rgba(255,255,255,.33)",
        px: 3,
        ...(stickyTabs && {
          position: "sticky",
          top: 0,
          backgroundColor: darkTheme.palette.background.default,
          zIndex: 1000,
        }),
        ...(spaceBetween && {
          justifyContent: "space-between",
        }),
      }}
    >
      {tabs.map((tab) => {
        const active = tab.value === activeTab?.value;
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
        overflow: !mdDown ? "hidden" : "unset",
      }}
    >
      {showTabs && tabs && tabRow(tabs)}
      <Box
        className="tab-content"
        sx={{ flex: 1, px: 0, pt: 1, overflow: !mdDown ? "auto" : "unset" }}
      >
        {activeTab?.content}
      </Box>
    </div>
  );
};

export default DetailTabs;
