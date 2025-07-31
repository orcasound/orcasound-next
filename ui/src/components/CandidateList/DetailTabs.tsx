import { ArrowBackIos } from "@mui/icons-material";
import {
  Box,
  Paper,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import darkTheme from "@/styles/darkTheme";

import LivePlayer from "../PlayBar/LivePlayer";

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

type Tab = {
  title: string;
  slug: string;
};

const DetailTabs = ({
  children,
  tabs,
  drawer = false,
  showHeading = true,
  showTabs = true,
}: {
  children: ReactNode;
  tabs?: Tab[];
  drawer?: boolean;
  showHeading?: boolean;
  showTabs?: boolean;
}) => {
  const router = useRouter();
  const { feedSlug } = router.query;
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  // const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const theme = useTheme();
  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();
  const { setPlaybarExpanded } = useLayout();
  const { feeds } = useData();

  const feed = feeds.find((feed) => feed.slug === feedSlug);
  const host = hosts.find((host) => feedSlug === host.hydrophone);

  // const isCandidateDetail =
  //   !!router.query.feedSlug && !!router.query.candidateId;

  const href =
    // isCandidateDetail
    //   ? `/beta/candidates/${feed?.slug}/${router.query.candidateId}`
    //   :
    `/beta`;

  const route = router.route.split("/");
  const tabPage = route[route.length - 1];
  const isIndexPage = route[route.length - 1] === "[feedSlug]";
  const isCandidatePage = route[route.length - 1] === "[candidateId]";

  const { nowPlayingFeed } = useNowPlaying();

  const tabRow = (tabs: Tab[]) => (
    <Stack
      direction="row"
      gap="40px"
      sx={{
        borderBottom: "1px solid rgba(255,255,255,.33)",
        px: 3,
      }}
    >
      {tabs.map((tab, index) => {
        const active = index === 0;
        return (
          <Link
            key={tab.title}
            href={tab.slug}
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
            {tab.title}
          </Link>
        );
      })}
    </Stack>
  );

  return (
    <div>
      <Head>Report {feedSlug} | Orcasound </Head>
      {showHeading && (
        <Box
          sx={{
            position: "relative",
            // marginTop: 5,
            marginBottom: "2px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
            background: `center / cover no-repeat url(${feed?.imageUrl})`,
            px: 3,
            py: 2,
            minHeight: smDown ? " 160px" : "260px",
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
          {!drawer ? (
            <Link
              href={smDown ? "#" : href}
              onClick={(e) => {
                if (smDown) {
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
                gap: "8px",
                textDecoration: "none",
                lineHeight: 1,
                color: theme.palette.common.white,
                zIndex: 1,
                position: "relative",
              }}
            >
              <ArrowBackIos />
            </Link>
          ) : (
            <Box></Box>
          )}
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
      )}
      <Box
        sx={{
          m: 2,
        }}
      >
        {nowPlayingFeed && <LivePlayer currentFeed={nowPlayingFeed} />}
      </Box>
      {host && (
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "accent1.main",
            p: 2,
            mx: 2,
            my: 1,
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
      {showTabs && tabs && tabRow(tabs)}
      <Box>{children}</Box>
    </div>
  );
};

export default DetailTabs;
