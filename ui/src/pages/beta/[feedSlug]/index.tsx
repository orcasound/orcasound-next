import { Theme, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo } from "react";

import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import AudioVisualizer from "@/components/PlayBar/AudioVisualizer";
import LivePlayer from "@/components/PlayBar/LivePlayer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";

function HydrophonePage() {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();
  const {
    setPlaybarExpanded,
    setDrawerContent,
    setDrawerSide,
    activeMobileTab,
  } = useLayout();
  const { feeds } = useData();
  const router = useRouter();
  const feed = useMemo(() => {
    return feeds.find((f) => f.slug === router.query.feedSlug);
  }, [feeds, router.query.feedSlug]);

  useEffect(() => {
    if (!feed) return;
    setNowPlayingFeed(feed);
    setNowPlayingCandidate(null);
  }, [feed, setNowPlayingCandidate, setNowPlayingFeed]);

  useEffect(() => {
    setDrawerSide("right");
    setDrawerContent(
      mdDown ? <LivePlayer feed={feed ?? null} /> : <AudioVisualizer />,
    );
    if (mdDown && activeMobileTab?.value !== "map") setPlaybarExpanded(true);
  }, [feed, setDrawerContent, setDrawerSide, setPlaybarExpanded, mdDown]);

  // useEffect(() => {
  //   setPlaybarExpanded(false);
  // }, [setPlaybarExpanded]);

  return <></>;
}

HydrophonePage.getLayout = function getLayout(page: ReactNode) {
  return (
    <MasterDataLayout>
      <HalfMapLayout>{page}</HalfMapLayout>
    </MasterDataLayout>
  );
};

export default HydrophonePage;
