import "videojs-offset";

import { ExpandLess } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Stack,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import dynamic from "next/dynamic";
import { MutableRefObject, ReactNode, SetStateAction, useMemo } from "react";

import PlayBarPlayPauseButton from "@/components/PlayBar/CandidatePlayPauseButton";
import { type PlayerStatus } from "@/components/Player/Player";
import { VideoJSOptions } from "@/components/Player/VideoJS";
import { type VideoJSPlayer } from "@/components/Player/VideoJS";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
// import { useData } from "@/context/DataContext";
import { Feed } from "@/graphql/generated";

// import DetectionButton from "../CandidateList/DetectionButtonBeta";
// import DetectionDialog from "../CandidateList/DetectionDialogBeta";
import Link from "../Link";
import DetectionButton from "../Player/DetectionButton";
import DetectionDialog from "../Player/DetectionDialog";
import PlayPauseButton from "../Player/PlayPauseButton";
import { PlaybarSlider } from "./PlaybarSlider";

// dynamically import VideoJS to speed up initial page load
const VideoJS = dynamic(() => import("@/components/Player/VideoJS"));

type PlayerBaseProps = {
  // required for either Candidate or Feed
  type: "candidate" | "feed";
  playerOptions: VideoJSOptions;
  handleReady: (player: VideoJSPlayer) => void;
  playerStatus: PlayerStatus;
  // setPlayerStatus: React.Dispatch<SetStateAction<PlayerStatus>>;
  feed: Feed | null;
  playerRef: MutableRefObject<VideoJSPlayer | null>;
  handlePlayPauseClickCandidate?: () => void;
  handlePlayPauseClickFeed?: () => Promise<void>;
  image?: string | undefined;
  playerTitle: string | undefined; // change this to player title
  playerSubtitle: string | undefined; // change this to player subtitle
  setAudioVisualizerOpen?: React.Dispatch<SetStateAction<boolean>>;

  // Feed only
  timestamp?: number | undefined;
  listenerCount?: number;
  onAudioPlay?: (() => void) | undefined;

  // Candidate only
  startOffset?: number;
  endOffset?: number;
  duration?: string | undefined;
  marks?: { label: string | ReactNode; value: number }[] | undefined;
  playerTime?: number;
};

export function PlayerBase({
  type,
  playerOptions,
  handleReady,
  playerStatus,
  feed,
  playerRef,
  handlePlayPauseClickCandidate,
  handlePlayPauseClickFeed,
  listenerCount = 0,
  startOffset = 0,
  endOffset = 0,
  image = "",
  playerTitle = "",
  playerSubtitle = "",
  duration = "",
  marks,
  playerTime = 0,
  timestamp,
  setAudioVisualizerOpen,
}: PlayerBaseProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { nowPlayingCandidate, nowPlayingFeed } = useNowPlaying();
  const { feeds, filteredData } = useData();
  const { playbarExpanded, setPlaybarExpanded } = useLayout();

  const detectionsThisFeed = filteredData.filter(
    (d) => d.hydrophone === nowPlayingFeed?.name,
  ).length;

  const feedSlug = useMemo(() => {
    if (nowPlayingCandidate) {
      const feed =
        feeds.find((f) => f.id === nowPlayingCandidate.feedId) ?? null;
      return feed ? feed.slug : "";
    } else if (nowPlayingFeed) {
      return nowPlayingFeed.slug;
    } else {
      return "";
    }
  }, [nowPlayingCandidate, nowPlayingFeed, feeds]);

  const candidateId = useMemo(() => {
    if (nowPlayingCandidate) {
      return nowPlayingCandidate.id;
    } else {
      return "";
    }
  }, [nowPlayingCandidate]);

  const href =
    candidateId.length > 0
      ? `/beta/${feedSlug}/${candidateId}`
      : `/beta/${feedSlug}/candidates`;

  const slider = (
    <PlaybarSlider
      marks={marks}
      playerRef={playerRef}
      playerTime={playerTime}
      startOffset={startOffset}
      endOffset={endOffset}
    />
  );

  const playerState =
    `${!mdDown ? "desktop" : "mobile"}${mdDown && playbarExpanded ? "Expanded" : ""}` as keyof typeof appBarStyles;

  const appBarStyles = {
    desktop: {
      height: "100%",
      borderRadius: "8px",
      border: "none",
      background: "transparent",
      p: 0,
    },
    mobile: {
      height: "100%",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,.5)",
      background: "base.main",
      pt: "6px",
    },
    mobileExpanded: {
      height: "auto",
      borderRadius: 0,
      border: "none",
      background: "black",
      pt: "16px",
    },
  };

  return (
    <AppBar
      position="relative"
      className="player-base"
      color="base"
      sx={{
        top: "auto",
        padding: "6px 0",
        alignItems: "center",
        display: "flex",
        ...appBarStyles[playerState],
      }}
    >
      <Toolbar
        className="toolbar"
        sx={{
          width: "100%",
          px: mdDown ? "1rem !important" : "0 !important",
        }}
      >
        <Stack spacing={1} sx={{ width: "100%" }}>
          <Box
            sx={(theme) => ({
              minHeight: mdDown ? 0 : theme.spacing(10),
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              px: 0,
              position: "relative",
              // className: "candidate-card-player",
              // Keep player above the sliding drawer
              zIndex: theme.zIndex.drawer + 1,
              width: "100%",
              // flexFlow: mdDown ? "row-reverse" : "row",
              gap: mdDown ? 2 : 3,
              marginRight: mdDown ? 0 : "2rem",
            })}
          >
            <Box display="none" id="video-js">
              <VideoJS
                options={playerOptions}
                onReady={handleReady}
                key={`${startOffset}-${endOffset}`}
              />
            </Box>
            <Box ml={0} id="play-pause-button">
              {handlePlayPauseClickCandidate && (
                <PlayBarPlayPauseButton
                  playerStatus={playerStatus}
                  onClick={handlePlayPauseClickCandidate}
                  disabled={!feed}
                />
              )}
              {handlePlayPauseClickFeed && (
                <PlayPauseButton
                  playerStatus={playerStatus}
                  onClick={handlePlayPauseClickFeed}
                  disabled={!feed}
                />
              )}
            </Box>
            <Link
              href={href}
              sx={{
                textDecoration: "none",
                flex: 1,
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <Stack
                direction="row"
                width="100%"
                spacing={mdDown ? 2 : 3}
                sx={{ overflow: "hidden" }}
              >
                <Box
                  sx={{
                    backgroundImage: `url(${image})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    minWidth: mdDown ? "40px" : "60px",
                    width: mdDown ? "40px" : "60px",
                    height: mdDown ? "40px" : "60px",
                    borderRadius: "4px",
                    // hiding the image box for now
                    display: "none",
                  }}
                ></Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    justifyContent: "center",
                    marginLeft: "0 !important",
                  }}
                >
                  <Typography
                    component="h2"
                    sx={{
                      whiteSpace: "nowrap",
                      fontSize: mdDown ? "14px" : "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: mdDown ? "bold" : 500,
                        fontSize: mdDown ? "inherit" : "20px",
                      }}
                    >
                      {mdDown ? playerTitle : "Listen Live"}
                    </span>
                    <br />
                    {playerSubtitle && playerSubtitle}
                    {type === "feed" &&
                      `${listenerCount} listener${listenerCount !== 1 ? "s" : ""}`}
                    {type === "candidate" && " · " + duration}
                  </Typography>
                  {/* {!mdDown && nowPlayingFeed && (
                      <Typography sx={{ color: "text.secondary" }}>
                        {
                          timeRangeSelect.find(
                            (el) => el.value === filters.timeRange,
                          )?.label
                        }
                        {" – "}
                        {reportCount[feed.id].shortCountString}
                      </Typography>
                    )} */}
                  {/* {!mdDown && nowPlayingCandidate && slider} */}
                </Box>
              </Stack>
            </Link>
          </Box>
          {mdDown && nowPlayingCandidate && slider}
        </Stack>
        {(playerStatus === "playing" || playerStatus === "loading") &&
          feed &&
          nowPlayingFeed &&
          mdDown && (
            <DetectionDialog
              isPlaying={playerStatus === "playing"}
              feed={feed}
              timestamp={timestamp}
              getPlayerTime={() => playerRef.current?.currentTime()}
              listenerCount={listenerCount}
            >
              <DetectionButton />
            </DetectionDialog>
          )}
        {/* {playerStatus !== "playing" &&
            playerStatus !== "loading" &&
            nowPlayingFeed && <DetectionButton disabled={true} />} */}
        <Box
          sx={{
            minWidth: "40px",
            minHeight: "40px",
            backgroundColor: "rgba(255,255,255,.25)",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => {
            setPlaybarExpanded(!playbarExpanded);
          }}
        >
          <ExpandLess
            sx={{ transform: playbarExpanded ? "rotate(180deg)" : "none" }}
            onClick={() => {
              if (playbarExpanded && setAudioVisualizerOpen)
                setAudioVisualizerOpen(true);
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
