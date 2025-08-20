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
import { analytics } from "@/utils/analytics";

import { timeRangeSelect } from "../CandidateList/CandidateListFilters";
import DetailTabs from "../CandidateList/DetailTabs";
import { DetectionsList } from "../CandidateList/DetectionsList";
import { HydrophoneHost } from "../CandidateList/HydrophoneHost";
import { HydrophonesStack } from "../CandidateList/HydrophonesStack";
import ReportsBarChart from "../CandidateList/ReportsBarChart";
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

// // dynamically import VideoJS to speed up initial page load
// const VideoJS = dynamic(() => import("@/components/Player/VideoJS"));

type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

export default function LivePlayer({
  feed,
  showListView = false,
}: {
  feed: Feed | null;
  showListView?: boolean;
}) {
  const {
    masterPlayerRef,
    masterPlayerStatus,
    audioContextRef,
    analyserNodeRef,
    setMasterPlayerStatus,
    setNowPlayingFeed,
    setNowPlayingCandidate,
  } = useNowPlaying();
  const { autoPlayOnReady, filteredData } = useData();
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const playerRef = useRef<VideoJSPlayer | null>(null);
  const {
    playbarExpanded,
    setPlaybarExpanded,
    setDrawerContent,
    setDrawerSide,
  } = useLayout();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { filters } = useData();
  const selectedTimeRange = timeRangeSelect.find(
    (el) => el.value === filters.timeRange,
  );

  const { timestamp, hlsURI } = useTimestampFetcher(
    feed?.bucket,
    feed?.nodeName,
  );

  const feedPresence = useFeedPresence(feed?.slug);
  const listenerCount = feedPresence?.metas.length ?? 0;

  const playerOptions = useMemo(
    () => ({
      poster: feed?.imageUrl,
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
      sources: feed?.nodeName
        ? [
            {
              // If hlsURI isn't set, use a dummy URI to trigger an error
              // The dummy URI doesn't actually exist, it should return 404
              // This is the only way to get videojs to throw an error, otherwise
              // it just won't initialize (if src is undefined/null/empty))
              src: hlsURI ?? `${feed?.nodeName}/404`,
              type: "application/x-mpegurl",
            },
          ]
        : [],
    }),
    [hlsURI, feed?.nodeName, feed?.imageUrl],
  );

  const updateMediaSession = useCallback(
    (player: VideoJSPlayer) => {
      if (feed?.nodeName) {
        setMediaSessionAPI(feed, player);
      }
    },
    [feed],
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

        if (feed?.slug) analytics.stream.started(feed.slug);
      });
      player.on("pause", () => {
        setPlayerStatus("paused");
        setMasterPlayerStatus("paused");
        if (feed?.slug) analytics.stream.paused(feed.slug);
      });
      player.on("waiting", () => {
        setPlayerStatus("loading");
        setMasterPlayerStatus("loading");
      });
      player.on("error", () => {
        setPlayerStatus("error");
        setMasterPlayerStatus("error");
        if (feed?.slug) analytics.stream.error(feed.slug);
      });
    },
    [
      feed?.slug,
      masterPlayerRef,
      setMasterPlayerStatus,
      autoPlayOnReady,
      analyserNodeRef,
      audioContextRef,
    ],
  );

  const handlePlayPauseClick = async () => {
    const player = playerRef.current;
    masterPlayerRef.current = player;

    if (playerStatus !== "playing" && !mdDown) {
      setPlaybarExpanded(true);
      setNowPlayingCandidate(null);
      setNowPlayingFeed(feed);
      setDrawerSide("right");
      setDrawerContent(<AudioVisualizer />);
    }

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
        if (feed?.slug) analytics.stream.userPaused(feed.slug);
      } else {
        await player.play();
        if (feed?.slug) analytics.stream.userStarted(feed.slug);
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
  }, [hlsURI, feed?.nodeName, setMasterPlayerStatus]);

  useEffect(() => {
    console.log("playerStatus: " + playerStatus);
    console.log("masterPlayerStatus: " + masterPlayerStatus);
  }, [playerStatus, masterPlayerStatus]);

  const descDetections = filteredData
    .filter((d) => d.hydrophone === feed?.name)
    .sort(
      (a, b) =>
        Date.parse(b.timestamp.toString()) - Date.parse(a.timestamp.toString()),
    );

  const reportsContent = (
    <>
      <Stack
        sx={{
          mb: "70px",
          alignItems: "center",
        }}
      >
        <ReportsBarChart
          showLegend={false}
          showYAxis={false}
          showXAxis={false}
          feed={feed ?? null}
        />
        <DetectionsList array={descDetections} />
      </Stack>
    </>
  );

  const aboutContent = feed?.introHtml && (
    <>
      <Box
        sx={{
          my: 1,
        }}
      >
        <HydrophoneHost feedSlug={feed.slug} />
      </Box>
      <div
        className="intro"
        dangerouslySetInnerHTML={{ __html: feed?.introHtml }}
      />
    </>
  );

  const tabs = [
    {
      label: selectedTimeRange?.label,
      value: "reports",
      content: reportsContent,
    },
    {
      label: "About",
      value: "about",
      content: aboutContent,
    },
    { label: "Images", value: "images", content: <></> },
  ];

  const playPause = (
    <Box
      sx={{
        width: 64,
        height: 64,
      }}
      onClick={() => feed && handlePlayPauseClick()}
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
      <Box display="none" id="video-js">
        <VideoJS
          options={playerOptions}
          onReady={handleReady}
          key={timestamp}
        />
      </Box>
      {showListView && (
        <Box className="player-list">
          <HydrophonesStack handlePlayPauseClick={handlePlayPauseClick} />
        </Box>
      )}
      {!showListView && (
        <Box className="individual-player">
          <div
            className="player-base-container"
            style={{
              position: mdDown ? "fixed" : "relative",
              width: "100%",
              zIndex: 1000,
            }}
          >
            <PlayerBase
              key={feed?.id}
              type="feed"
              playerOptions={playerOptions}
              handleReady={handleReady}
              playerStatus={playerStatus}
              feed={feed ?? null}
              playerRef={playerRef}
              handlePlayPauseClickFeed={handlePlayPauseClick}
              image={feed?.imageUrl?.toString()}
              timestamp={timestamp}
              listenerCount={listenerCount}
              playerTitle={feed?.name}
              playerSubtitle={""}
              setAudioVisualizerOpen={setAudioVisualizerOpen}
            />
          </div>

          {mdDown && playbarExpanded && (
            <>
              {audioVisualizerOpen && (
                <div style={{ marginTop: "calc(68px + 1rem)" }}>
                  <AudioVisualizer />
                </div>
              )}

              <Box
                sx={{
                  mt: audioVisualizerOpen ? "1rem" : "calc(68px + 1rem)", // 68px is the height of PlayerBase which is fixed
                  mb: "70px",
                }}
              >
                <DetailTabs tabs={tabs} />
              </Box>

              {playerStatus === "playing" && (
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
            </>
          )}
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
