import { Earbuds, Mic, Public } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";

export function MobileBottomNav() {
  const router = useRouter();
  const { mobileTab, setMobileTab } = useLayout();
  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();

  return (
    <BottomNavigation
      className="bottom-navigation"
      showLabels
      value={mobileTab}
      onChange={(_event, newMenuTab) => {
        setMobileTab(newMenuTab);
      }}
      sx={{
        minHeight: "69px",
        backgroundColor: "background.paper",
        "& .MuiBottomNavigationAction-root": {
          color: "text.secondary",
          "& .MuiSvgIcon-root": {
            color: "text.secondary",
          },
        },
        "& .Mui-selected": {
          color: "text.primary",
          "& .MuiSvgIcon-root": {
            color: "text.primary",
          },
        },
      }}
    >
      <BottomNavigationAction
        label="Listen live"
        icon={<Mic />}
        onClick={() => {
          router.push("/beta");
          setNowPlayingCandidate(null);
        }}
      />
      <BottomNavigationAction
        label="Explore bouts"
        icon={<Earbuds />}
        onClick={() => {
          router.push("/beta/explore");
          setNowPlayingFeed(null);
        }}
      />
      <BottomNavigationAction label="Take Action" icon={<Public />} />
    </BottomNavigation>
  );
}
