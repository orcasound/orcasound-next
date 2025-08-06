import {
  ErrorOutline,
  GraphicEq,
  PauseCircle,
  PlayCircle,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Theme,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import VideoJS, { type VideoJSPlayer } from "@/components/Player/VideoJS";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import type { Feed } from "@/graphql/generated";
import useFeedPresence from "@/hooks/useFeedPresence";
import { useTimestampFetcher } from "@/hooks/useTimestampFetcher";
import fin512 from "@/public/photos/fin-512x512.png";
import darkTheme from "@/styles/darkTheme";
import { analytics } from "@/utils/analytics";

import { DetectionsList } from "../CandidateList/DetectionsList";
import ReportsBarChart from "../CandidateList/ReportsBarChart";
import Link from "../Link";
import AudioVisualizer from "./AudioVisualizer";
import { PlayerBase } from "./PlayerBase";

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

// // dynamically import VideoJS to speed up initial page load
// const VideoJS = dynamic(() => import("@/components/Player/VideoJS"));

type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

export default function LivePlayer({
  currentFeed,
}: {
  currentFeed: Feed;

  // Pick<
  //   Feed,
  //   | "id"
  //   | "slug"
  //   | "nodeName"
  //   | "name"
  //   | "latLng"
  //   | "imageUrl"
  //   | "thumbUrl"
  //   | "bucket"
  // >;
}) {
  const {
    masterPlayerRef,
    masterPlayerStatus,
    audioContextRef,
    analyserNodeRef,
    setMasterPlayerStatus,
    setNowPlayingCandidate,
    setNowPlayingFeed,
  } = useNowPlaying();
  const { autoPlayOnReady, filteredData } = useData();
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const playerRef = useRef<VideoJSPlayer | null>(null);
  const { playbarExpanded, setPlaybarExpanded } = useLayout();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const host = hosts.find((host) => currentFeed.slug === host.hydrophone);

  const { timestamp, hlsURI } = useTimestampFetcher(
    currentFeed?.bucket,
    currentFeed?.nodeName,
  );

  const feedPresence = useFeedPresence(currentFeed?.slug);
  const listenerCount = feedPresence?.metas.length ?? 0;

  const playerOptions = useMemo(
    () => ({
      poster: currentFeed?.imageUrl,
      // autoplay: true,
      flash: {
        hls: {
          overrideNative: true,
        },
      },
      html5: {
        hls: {
          overrideNative: true,
        },
      },
      sources: currentFeed?.nodeName
        ? [
            {
              // If hlsURI isn't set, use a dummy URI to trigger an error
              // The dummy URI doesn't actually exist, it should return 404
              // This is the only way to get videojs to throw an error, otherwise
              // it just won't initialize (if src is undefined/null/empty))
              src: hlsURI ?? `${currentFeed?.nodeName}/404`,
              type: "application/x-mpegurl",
            },
          ]
        : [],
    }),
    [hlsURI, currentFeed?.nodeName, currentFeed?.imageUrl],
  );

  const updateMediaSession = useCallback(
    (player: VideoJSPlayer) => {
      if (currentFeed?.nodeName) {
        setMediaSessionAPI(currentFeed, player);
      }
    },
    [currentFeed],
  );

  useEffect(() => {
    if (playerRef.current) {
      updateMediaSession(playerRef.current);
    }
  }, [playerRef, updateMediaSession]);

  const handleReady = useCallback(
    (player: VideoJSPlayer) => {
      playerRef.current = player;
      masterPlayerRef.current = player;
      const el = masterPlayerRef.current?.el(); // from video.js
      const videoEl = el?.querySelector("video") as HTMLMediaElement | null;

      if (!videoEl) return;

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.warn("Failed to close previous AudioContext", e);
        }
      }
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(videoEl);
      const analyser = audioCtx.createAnalyser();

      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      audioContextRef.current = audioCtx;
      analyserNodeRef.current = analyser;

      if (autoPlayOnReady.current) {
        player.play();
      }

      player.on("playing", () => {
        setPlayerStatus("playing");
        setMasterPlayerStatus("playing");
        autoPlayOnReady.current = true;
        setAudioVisualizerOpen(true);

        if (currentFeed?.slug) analytics.stream.started(currentFeed.slug);
      });
      player.on("pause", () => {
        setPlayerStatus("paused");
        setMasterPlayerStatus("paused");
        if (currentFeed?.slug) analytics.stream.paused(currentFeed.slug);
      });
      player.on("waiting", () => {
        setPlayerStatus("loading");
        setMasterPlayerStatus("loading");
      });
      player.on("error", () => {
        setPlayerStatus("error");
        setMasterPlayerStatus("error");
        if (currentFeed?.slug) analytics.stream.error(currentFeed.slug);
      });
    },
    [
      currentFeed?.slug,
      masterPlayerRef,
      setMasterPlayerStatus,
      autoPlayOnReady,
      analyserNodeRef,
      audioContextRef,
    ],
  );

  const handlePlayPauseClick = async () => {
    const player = playerRef.current;

    setNowPlayingFeed(currentFeed);
    setNowPlayingCandidate(null);
    if (playerStatus !== "playing" && !mdDown) setPlaybarExpanded(true);

    if (playerStatus === "error") {
      setPlayerStatus("idle");
      setMasterPlayerStatus("idle");
      return;
    }

    if (!player) {
      setPlayerStatus("error");
      setMasterPlayerStatus("error");
      return;
    }

    try {
      if (playerStatus === "loading" || playerStatus === "playing") {
        await player.pause();
        if (currentFeed?.slug) analytics.stream.userPaused(currentFeed.slug);
      } else {
        await player.play();
        if (currentFeed?.slug) analytics.stream.userStarted(currentFeed.slug);
      }
    } catch (e) {
      console.error(e);
      // AbortError is thrown if pause() is called while play() is still loading (e.g. if segments are 404ing)
      // It's not important, so don't show this error to the user
      if (e instanceof DOMException && e.name === "AbortError") return;
      setPlayerStatus("error");
      setMasterPlayerStatus("error");
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && hlsURI) {
      console.log(`New stream instance: ${hlsURI}`);
    }

    return () => {
      setPlayerStatus("idle");
      setMasterPlayerStatus("idle");
    };
  }, [hlsURI, currentFeed?.nodeName, setMasterPlayerStatus]);

  useEffect(() => {
    console.log("playerStatus: " + playerStatus);
    console.log("masterPlayerStatus: " + masterPlayerStatus);
  }, [playerStatus, masterPlayerStatus]);

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

  const playPause = (
    <Box
      sx={{
        width: 64,
        height: 64,
      }}
      onClick={() => currentFeed && handlePlayPauseClick()}
    >
      {playerStatus === "error" ? (
        <Tooltip title="Failed to load" placement="right">
          <ErrorOutline className="icon" sx={{ width: 64, height: 64 }} />
        </Tooltip>
      ) : playerStatus === "loading" ? (
        <CircularProgress
          sx={{ color: "base.contrastText", width: 64, height: 64 }}
        />
      ) : playerStatus === "playing" ? (
        <PauseCircle
          className="icon"
          sx={{
            width: 64,
            height: 64,
          }}
        />
      ) : (
        <PlayCircle
          className="icon"
          sx={{
            width: 64,
            height: 64,
          }}
        />
      )}
    </Box>
  );

  const [audioVisualizerOpen, setAudioVisualizerOpen] = useState(false);

  return (
    <Box
      className="live-player"
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
      }}
    >
      {/* {mdDown && (
        <div className="detection-button" style={{ maxWidth: "50%" }}>
          {(playerStatus === "playing" || playerStatus === "loading") &&
            currentFeed && (
              <DetectionDialog
                isPlaying={playerStatus === "playing"}
                feed={currentFeed}
                timestamp={timestamp}
                getPlayerTime={() => playerRef.current?.currentTime()}
                listenerCount={listenerCount}
              >
                <DetectionButton />
              </DetectionDialog>
            )}
        </div>
      )} */}
      {/* {playerStatus !== "playing" && playerStatus !== "loading" && (
          <DetectionButton disabled={true} />
        )} */}

      {/* <Button variant="outlined">Share</Button>
        <Button variant="outlined">notifications</Button> */}
      <Box display="none" id="video-js">
        <VideoJS
          options={playerOptions}
          onReady={handleReady}
          key={timestamp}
        />
      </Box>

      {mdDown && (
        <div style={{ position: "fixed", width: "100%", zIndex: 1000 }}>
          <PlayerBase
            key={currentFeed.id}
            type="feed"
            playerOptions={playerOptions}
            handleReady={handleReady}
            playerStatus={playerStatus}
            feed={currentFeed}
            playerRef={playerRef}
            handlePlayPauseClickFeed={handlePlayPauseClick}
            image={currentFeed.imageUrl?.toString()}
            timestamp={timestamp}
            listenerCount={listenerCount}
            playerTitle={currentFeed.name}
            playerSubtitle={""}
            setAudioVisualizerOpen={setAudioVisualizerOpen}
          />
        </div>
      )}
      {playbarExpanded && audioVisualizerOpen && (
        <div style={{ marginTop: "calc(68px + 1rem)" }}>
          <AudioVisualizer />
        </div>
      )}
      {playbarExpanded && (
        <>
          <div
            style={{
              marginTop: audioVisualizerOpen ? "1rem" : "calc(68px + 1rem)", // 68px is the height of PlayerBase which is fixed
            }}
          >
            {tabRow([
              { title: "Reports", slug: "#" },
              { title: "About", slug: "#" },
              { title: "Updates", slug: "#" },
            ])}
          </div>
          <Stack
            sx={{
              minHeight: "150px",
              mx: 3,
              pt: 1,
              alignItems: "center",
              mb: 1,
              color: "rgba(255,255,255,.75)",
            }}
          >
            <ReportsBarChart
              showLegend={false}
              showYAxis={false}
              showXAxis={false}
              feed={currentFeed}
            />
            Last 7 days
          </Stack>
          <DetectionsList
            array={filteredData.filter(
              (d) => d.hydrophone === currentFeed.name,
            )}
          />
          <Box className="spacer-70px" sx={{ minHeight: "70px" }}></Box>
        </>
      )}
      {playbarExpanded && playerStatus === "playing" && (
        <Box
          className="fixed-detection-button-container"
          sx={{
            width: "100%",
            height: "70px",
            background: "black",
            position: "fixed",
            bottom: 0,
            py: 1.5,
            px: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            sx={{
              width: "100%",
              height: "100%",
              background: "white",
              color: "black",
              borderRadius: "100px",
            }}
          >
            <GraphicEq sx={{ color: "black", mr: ".5rem" }} />
            Report sound
          </Button>
        </Box>
      )}
    </Box>
  );
}

const setMediaSessionAPI = (
  feed: Pick<Feed, "name" | "imageUrl" | "thumbUrl">,
  player: VideoJSPlayer,
) => {
  if ("mediaSession" in navigator && feed) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: feed.name,
      artist: "Orcasound",
      artwork: [
        {
          src: feed.thumbUrl || fin512.src,
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      player.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      player.pause();
    });
  }
};
