import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import DetailTabs from "@/components/CandidateList/DetailTabs";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import AudioVisualizer from "@/components/PlayBar/AudioVisualizer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";

function HydrophonePage() {
  const { setPlaybarExpanded } = useLayout();
  setPlaybarExpanded(false);
  return null;
}

const LeftDetail = () => {
  const { query } = useRouter();
  const feedSlug = query.feedSlug as string;
  const { feeds } = useData();
  const feed = feeds.find((f) => f.slug === feedSlug);

  return (
    <DetailTabs showTabs={false}>
      <CandidatesStack feed={feed} showChart={true}></CandidatesStack>
    </DetailTabs>
  );
};

export const FeedRightDetail = () => {
  const router = useRouter();
  const { feedSlug } = router.query;
  // const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { setNowPlayingCandidate, setNowPlayingFeed, nowPlayingFeed } =
    useNowPlaying();

  const { feeds, autoPlayOnReady } = useData();
  const feed = feeds.find((feed) => feed.slug === feedSlug);
  // load the feed into nowPlaying on page load
  useEffect(() => {
    if (feed) {
      setNowPlayingFeed(feed);
      setNowPlayingCandidate(null);
      autoPlayOnReady.current = false;
    }
  }, [feed, setNowPlayingCandidate, setNowPlayingFeed, autoPlayOnReady]);

  const tabs = [
    { title: "About", slug: "" },
    { title: "Images", slug: "#" },
  ];

  return (
    <>
      <DetailTabs showHeading={true} tabs={tabs}>
        <Box sx={{ px: 3, py: 1 }}>
          {feed?.introHtml ? (
            <div
              className="intro"
              dangerouslySetInnerHTML={{ __html: feed?.introHtml }}
            />
          ) : (
            JSON.stringify(feed, null, 2)
          )}
        </Box>
      </DetailTabs>
    </>
  );
};

const CenterDetail = () => {
  const { nowPlayingFeed } = useNowPlaying();

  return <AudioVisualizer key={nowPlayingFeed?.slug} />;
};

HydrophonePage.getLayout = function getLayout() {
  return (
    <MasterDataLayout>
      <HalfMapLayout
        // leftSlot={<CandidatesStack />}
        centerSlot={<CenterDetail />}
        rightSlot={<FeedRightDetail />}
      />
    </MasterDataLayout>
  );
};

export default HydrophonePage;
