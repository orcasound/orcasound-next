import { ErrorOutline, PauseCircle, PlayCircle } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
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
  const { autoPlayOnReady } = useData();
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const playerRef = useRef<VideoJSPlayer | null>(null);
  const { setPlaybarExpanded } = useLayout();

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
    if (playerStatus !== "playing") setPlaybarExpanded(true);

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

  return (
    <div
      className="live-player-container"
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: "1rem",
      }}
    >
      <div
        className="live-player"
        style={{ display: "flex", gap: "16px", marginLeft: "4px" }}
      >
        {playPause}
        {/* {!active || masterPlayerStatus !== "playing" ? playIcon : pauseIcon} */}
        <Stack
          className="live-player-text"
          sx={{
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "20px" }}>Listen Live</Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            {currentFeed &&
              `${listenerCount} listener${listenerCount > 1 ? "s" : ""}`}
          </Typography>
        </Stack>
      </div>

      {/* <div className="detection-button" style={{ maxWidth: "50%" }}>
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
      </div> */}
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

      {/* <div style={{ display: "none" }}>
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
          playerTitle={playerText}
          playerSubtitle={""}
        />
      </div> */}
    </div>
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
