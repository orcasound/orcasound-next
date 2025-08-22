import { ArrowBackIos } from "@mui/icons-material";
import { Box, Theme, Typography, useMediaQuery } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

import DetailTabs from "@/components/CandidateList/DetailTabs";
import { DetectionsList } from "@/components/CandidateList/DetectionsList";
import { HydrophoneHost } from "@/components/CandidateList/HydrophoneHost";
import LivePlayer from "@/components/PlayBar/LivePlayer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import theme from "@/styles/theme";

export const FeedDetail = () => {
  const router = useRouter();
  const { feedSlug } = router.query;
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { filteredData } = useData();
  const { setPlaybarExpanded } = useLayout();

  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();

  const { feeds } = useData();
  const feed = feeds.find((feed) => feed.slug === feedSlug) ?? null;
  const detectionsThisFeed = filteredData.filter((d) => d.feedId === feed?.id);

  // load the feed into nowPlaying on page load
  useEffect(() => {
    if (feed) {
      setNowPlayingFeed(feed);
      setNowPlayingCandidate(null);
    }
  }, [feed, setNowPlayingCandidate, setNowPlayingFeed]);

  const tabs = [
    {
      label: "About",
      value: "about",
      content: feed?.introHtml ? (
        <Box sx={{ px: 3, pt: 1 }}>
          <Box
            sx={{
              mx: -1,
            }}
          >
            <HydrophoneHost feedSlug={feedSlug?.toString()} />
          </Box>
          <div
            className="intro"
            dangerouslySetInnerHTML={{ __html: feed?.introHtml }}
          />
        </Box>
      ) : (
        JSON.stringify(feed, null, 2)
      ),
    },
    {
      label: "Reports",
      value: "reports",
      content: <DetectionsList array={detectionsThisFeed} />,
    },

    { label: "Status", value: "status", content: <></> },
  ];

  return (
    <>
      <Box
        sx={{
          position: "relative",
          marginBottom: "2px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          background: `center / cover no-repeat url(${feed?.imageUrl})`,
          px: 3,
          py: 2,
          minHeight: mdDown ? " 160px" : "260px",
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.33), rgba(0,0,0,0))",
            zIndex: 0,
          }}
        />
        <Link
          href={mdDown ? "#" : "/"}
          onClick={(e) => {
            if (mdDown) {
              e.preventDefault();
              router.back();
            }
            setNowPlayingFeed(null);
            setNowPlayingCandidate(null);
            setPlaybarExpanded(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            textDecoration: "none",
            lineHeight: 1,
            color: theme.palette.common.white,
            zIndex: 1,
            position: "relative",
            backgroundColor: "rgba(0,0,0,.75)",
            padding: "6px 14px 6px 12px",
            borderRadius: "8px",
            marginLeft: "-8px",
          }}
        >
          <ArrowBackIos
            sx={{
              fontSize: "20px",
            }}
          />
          All hydrophones
        </Link>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              zIndex: 1,
              lineHeight: 1.1,
              position: "relative",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {feed?.name}
          </Typography>
        </Box>
      </Box>
      <Box
        className="live-player-container"
        sx={{
          my: 2,
          mx: 3,
        }}
      >
        <LivePlayer feed={feed} key={router.asPath} />
      </Box>
      <DetailTabs tabs={tabs} />
    </>
  );
};
