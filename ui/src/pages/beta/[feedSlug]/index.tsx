import { Box, Paper, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import HydrophoneDetailTabs from "@/components/CandidateList/HydrophoneDetailTabs";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import Link from "@/components/Link";
import AudioVisualizer from "@/components/PlayBar/AudioVisualizer";
import LivePlayer from "@/components/PlayBar/LivePlayer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";

const hosts = [
  {
    hydrophone: "orcasound-lab",
    name: "Beam Reach",
    link: "http://www.beamreach.blue/",
  },
  {
    hydrophone: "north-sjc",
    name: "Orca Behavior Institute",
    link: "https://www.orcabehaviorinstitute.org/",
  },
  {
    hydrophone: "sunset-bay",
    name: "Beach Camp at Sunset Bay",
    link: "https://www.sunsetbaywharf.com/",
  },
  {
    hydrophone: "port-townsend",
    name: "Port Townsend Marine Science Center",
    link: "http://www.ptmsc.org/",
  },
  {
    hydrophone: "bush-point",
    name: "Orca Network",
    link: "https://orcanetwork.org/",
  },
];

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
    <HydrophoneDetailTabs showTabs={false}>
      <CandidatesStack feed={feed} showChart={true}></CandidatesStack>
    </HydrophoneDetailTabs>
  );
};

const RightDetail = () => {
  const router = useRouter();
  const { feedSlug } = router.query;
  // const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { setNowPlayingCandidate, setNowPlayingFeed, nowPlayingFeed } =
    useNowPlaying();

  const { feeds, autoPlayOnReady } = useData();
  const feed = feeds.find((feed) => feed.slug === feedSlug);
  const host = hosts.find((host) => feedSlug === host.hydrophone);
  // load the feed into nowPlaying on page load
  useEffect(() => {
    if (feed) {
      setNowPlayingFeed(feed);
      setNowPlayingCandidate(null);
      autoPlayOnReady.current = false;
    }
  }, [feed, setNowPlayingCandidate, setNowPlayingFeed, autoPlayOnReady]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          p: 3,
          pb: 2,
          ml: -1,
          gap: 2,
        }}
      >
        {nowPlayingFeed && <LivePlayer currentFeed={nowPlayingFeed} />}
      </Box>
      <HydrophoneDetailTabs showHeading={false}>
        <Box sx={{ p: 3 }}>
          {host && (
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "accent1.main",
                p: 2,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                Hosted by <strong>{host.name}</strong>
                <br />
                <Link href={host.link} target="_blank" rel="noopener">
                  Learn more or donate
                </Link>{" "}
                to support their work.
              </Typography>
            </Paper>
          )}
          {feed?.introHtml ? (
            <div
              className="intro"
              dangerouslySetInnerHTML={{ __html: feed?.introHtml }}
            />
          ) : (
            JSON.stringify(feed, null, 2)
          )}
        </Box>
      </HydrophoneDetailTabs>
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
        leftSlot={<LeftDetail />}
        centerSlot={<CenterDetail />}
        rightSlot={<RightDetail />}
      />
    </MasterDataLayout>
  );
};

export default HydrophonePage;
