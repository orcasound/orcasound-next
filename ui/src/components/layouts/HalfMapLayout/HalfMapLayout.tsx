import { Box, Button, Theme, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useRef } from "react";

import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import { HydrophonesStack } from "@/components/CandidateList/HydrophonesStack";
import HeaderNew from "@/components/HeaderNew";
import { useLayout } from "@/context/LayoutContext";

import { MasterDataLayout } from "../MasterDataLayout";
import { DesktopDrawer } from "./DesktopDrawer";
import { FeedDetail } from "./FeedDetail";
import { MapWrapper } from "./MapWrapper";
import { MobileBottomNav } from "./MobileBottomNav";
import MobileDrawer from "./MobileDrawer";
import { SideList } from "./SideList";

const routes = [
  { label: "Hydrophones", href: "/beta" },
  { label: "Explore", href: "/beta/explore" },
  { label: "Take Action", href: "/beta/action" },
];

const tabButtonSx = {
  padding: "7px 16px",
  margin: "0 8px",
  minWidth: 0,
  minHeight: "unset",
  lineHeight: 1.2,
  borderRadius: "4px",
  textTransform: "uppercase",
  color: "inherit",
  "&:hover": {
    color: "primary.main",
    backgroundColor: "rgba(255,255,255,.10)",
  },
};

const activeButtonSx = {
  backgroundColor: "rgba(255,255,255,.15)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,.18)",
  },
};

function NavTabs({ mdDown }: { mdDown?: boolean }) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <Box
      role="navigation"
      aria-label="Main navigation"
      display="flex"
      justifyContent={mdDown ? "center" : "start"}
    >
      {routes.map(({ label, href }) => {
        const isActive = currentPath === href;
        return (
          <Button
            key={href}
            sx={{ ...tabButtonSx, ...(isActive ? activeButtonSx : {}) }}
            onClick={() => router.push(href)}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  );
}

type HalfMapLayoutProps = {
  leftSlot?: React.ReactNode;
  drawer?: React.ReactNode;
  children?: React.ReactNode;
};

export function HalfMapLayout({
  leftSlot,
  drawer,
  children,
}: HalfMapLayoutProps) {
  const router = useRouter();
  const { setDrawerSide, drawerContent } = useLayout();

  const isHome = router.asPath === routes[0].href;
  const isExplore = router.asPath === routes[1].href;
  const isAction = router.asPath === routes[2].href;

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const masterPlayerTimeRef = useRef(0);

  useEffect(() => {
    if (!router) return;
    if (router.query.candidateId) {
      setDrawerSide("left");
    } else {
      setDrawerSide("right");
    }
  }, [setDrawerSide]);

  return (
    <>
      <Box
        sx={{
          // use `dvh` for dynamic viewport height to handle mobile browser weirdness
          // but fallback to `vh` for browsers that don't support `dvh`
          // `&` is a workaround because sx prop can't have identical keys
          // "&": {
          //   height: "100dvh",
          // },
          // height: "100vh",
          // paddingBottom: mdDown ? "155px" : "86px",
          // paddingTop: "60px", // added this due to making header position: fixed
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0, // important for mobile scrolling
        }}
      >
        <HeaderNew tabs={<NavTabs />} />

        {/* children are only used in this layout so individual pages can run logic on load */}
        {children}

        <Box
          component="main"
          sx={{
            display: "flex",
            flexFlow: mdDown ? "column" : "row",
            flex: 1,
            position: "relative",
            overflowY: mdDown ? "scroll" : "hidden",
          }}
        >
          {/* // desktop view */}
          {!mdDown && (
            <SideList position="left">
              {router.query.feedSlug ? <FeedDetail /> : <HydrophonesStack />}
            </SideList>
          )}
          <Box
            className="center-column"
            sx={{
              display: "flex",
              flexGrow: 1,
              position: "relative",
            }}
          >
            {isExplore ? <CandidatesStack /> : <MapWrapper />}
          </Box>
          {!mdDown && (
            <SideList position="right">
              <CandidatesStack showChart={true} />
            </SideList>
          )}
          {/* // mobile view */}
        </Box>

        {mdDown && <MobileDrawer masterPlayerTimeRef={masterPlayerTimeRef} />}
        {mdDown && <MobileBottomNav />}
        {!mdDown && <DesktopDrawer>{drawerContent}</DesktopDrawer>}
      </Box>
    </>
  );
}

export function getHalfMapLayout(page: ReactElement) {
  return (
    <MasterDataLayout>
      <HalfMapLayout>{page}</HalfMapLayout>
    </MasterDataLayout>
  );
}
