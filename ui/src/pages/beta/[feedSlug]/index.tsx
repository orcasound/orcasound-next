import { PauseCircle, PlayCircle } from "@mui/icons-material";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import HydrophoneDetailTabs from "@/components/CandidateList/HydrophoneDetailTabs";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import Link from "@/components/Link";
import PlayBar from "@/components/PlayBar/PlayBar";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { Feed } from "@/graphql/generated";

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

  const {
    setNowPlayingCandidate,
    setNowPlayingFeed,
    nowPlayingFeed,
    masterPlayerRef,
    masterPlayerStatus,
  } = useNowPlaying();

  const { setPlaybarExpanded } = useLayout();

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

  const active = feed?.id === nowPlayingFeed?.id;

  const handlePlay = (feed: Feed) => {
    setNowPlayingFeed(feed);
    setNowPlayingCandidate(null);
    if (masterPlayerRef.current !== null) masterPlayerRef.current.play();
    setPlaybarExpanded(true);
  };

  const playIcon = (
    <PlayCircle
      sx={{ height: 64, width: 64, zIndex: 1, position: "relative" }}
      onClick={() => {
        console.log("clicked");
        if (feed) handlePlay(feed);
      }}
    />
  );
  const handlePause = () => {
    masterPlayerRef?.current?.pause();
    setPlaybarExpanded(false);
  };

  const pauseIcon = (
    <PauseCircle
      sx={{ height: 64, width: 64, zIndex: 1, position: "relative" }}
      onClick={() => {
        handlePause();
      }}
    />
  );

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
        {!active || masterPlayerStatus !== "playing" ? playIcon : pauseIcon}
        <Stack>
          <Typography sx={{ fontSize: "20px" }}>Listen Live</Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            0 listeners
          </Typography>
        </Stack>
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
  return <PlayBar />;
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
