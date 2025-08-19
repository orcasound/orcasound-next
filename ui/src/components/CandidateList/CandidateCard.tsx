import { PauseCircle, PlayCircle } from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import useConcatenatedAudio from "@/hooks/beta/useConcatenatedAudio";
import { Candidate, CombinedData } from "@/types/DataTypes";
import formatDuration from "@/utils/masterDataHelpers";
import { formatTimestamp } from "@/utils/time";

import { useComputedPlaybackFields } from "../../hooks/beta/useComputedPlaybackFields";
import { CandidateDrawer } from "../layouts/HalfMapLayout/CandidateDrawer";
import CommunityBar from "./CommunityBar";

const tagRegex = [
  "s[0-9]+",
  "srkw",
  "call",
  "whistle",
  "click",
  "j pod",
  "j-pod",
  "k pod",
  "k-pod",
  "l pod",
  "l-pod",
  "biggs",
  "bigg's",
];

export default function CandidateCard(props: { candidate: Candidate }) {
  const {
    nowPlayingCandidate,
    setNowPlayingCandidate,
    setNowPlayingFeed,
    masterPlayerRef,
    masterPlayerStatus,
  } = useNowPlaying();
  const router = useRouter();

  const { setPlaybarExpanded, setDrawerContent, setDrawerSide } = useLayout();

  const candidate = props.candidate;
  const active = candidate.id === nowPlayingCandidate?.id;
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { feeds, autoPlayOnReady } = useData();
  const feed = feeds.find(
    (feed) => feed.id === props.candidate.array[0].feedId,
  );
  const feedId = feed?.id ?? "";

  const startEnd = useMemo(() => {
    return typeof candidate.id === "string" ? candidate.id?.split("_") : [];
  }, [candidate.id]);
  const startTimeString = startEnd[0];
  const endTimeString = startEnd[startEnd.length - 1];

  const {
    audioBlob,
    spectrogramUrl,
    isProcessing,
    error,
    totalDurationMs,
    droppedSeconds,
  } = useConcatenatedAudio({
    feedId,
    startTime: startTimeString,
    endTime: endTimeString,
  });

  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!startTimeString || !endTimeString) return;

    let url: string | null = null;

    if (audioBlob) {
      url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } else {
      setAudioUrl(undefined);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [audioBlob, startTimeString, endTimeString]);

  const handleDrawerOpen = () => {
    setPlaybarExpanded(true);
    setDrawerSide("left");
    setDrawerContent(
      <CandidateDrawer
        clipId={startTimeString}
        audioUrl={audioUrl}
        spectrogramUrl={spectrogramUrl}
        isProcessing={isProcessing}
        error={error}
        totalDurationMs={totalDurationMs}
        droppedSeconds={droppedSeconds}
        candidate={candidate}
      />,
    );
  };

  const { duration, durationString } = useComputedPlaybackFields(
    props.candidate,
  );

  function extractHttpLinks(detectionArray: CombinedData[]): string[] {
    const urlRegex = /https?:\/\/\S+/g;
    const sightingsArray = detectionArray.filter((d) => d.type === "sightings");
    return sightingsArray.flatMap((detection) => {
      if (!detection.comments) return [];
      const matches = detection.comments.match(urlRegex);
      return matches || [];
    });
  }

  const imageLinks = extractHttpLinks(props.candidate.array);

  const image = feed ? feed.imageUrl : "";
  const { descriptions } = props.candidate;
  const tagArray = descriptions.match(new RegExp(tagRegex.join("|"), "gi"));
  const uniqueTags = [...new Set(tagArray)];
  const tagObject: { [key: string]: number | undefined } = {};

  uniqueTags.forEach((tag) => {
    const count = tagArray?.filter((el) => el === tag).length;
    tagObject[tag] = count;
  });

  const candidateTitle = formatTimestamp(candidate.startTimestamp);

  // if the card is rendered on feed detail, show candidateFeedHref
  // const feedDetailHref = `/beta/${feed?.slug}/candidates`;
  const feedDetailCandidateHref = `/beta/${feed?.slug}/${candidate.id}`;

  // if the card is rendered on browse all candidates, show candidateBrowseHref
  // const allCandidatesHref = `/beta/candidates`;
  // 6/5/25 -- abandoning the idea of a candidate detail next to all candidates browse, always goes to feed detail
  // const allCandidatesDetailHref = `/beta/candidates/${feed?.slug}/${candidate.id}`;

  const href = feedDetailCandidateHref;

  const handlePlay = (candidate: Candidate) => {
    autoPlayOnReady.current = true;
    setNowPlayingCandidate(candidate);
    setNowPlayingFeed(null);
    if (!mdDown) router.push(href);

    const player = masterPlayerRef?.current;
    if (player && player !== null && typeof player.play === "function") {
      player.play();
    }
  };

  const handlePause = () => {
    const player = masterPlayerRef?.current;
    if (player && typeof player.pause === "function") {
      player.pause();
    }
  };

  const iconSize = "40px";

  const playIcon = (
    <PlayCircle
      onClick={() => handlePlay(candidate)}
      sx={{
        height: iconSize,
        width: iconSize,
        cursor: "pointer",
        // marginRight: mdDown ? "-8px" : "-4px",
      }}
    />
  );

  const playIconDisabled = (
    <PlayCircle
      sx={{
        opacity: 0.25,
        height: iconSize,
        width: iconSize,
        // marginRight: mdDown ? "-8px" : "-4px",
      }}
    />
  );

  const pauseIcon = (
    <PauseCircle
      onClick={() => handlePause()}
      sx={{
        height: iconSize,
        width: iconSize,
        cursor: "pointer",
      }}
    />
  );

  const currentTimeSeconds = new Date().getTime() / 1000;
  const timestampSeconds = new Date(candidate.startTimestamp).getTime() / 1000;
  const timeAgoString = formatDuration(timestampSeconds, currentTimeSeconds);

  const scrollBox = document.querySelector(".mobile-view");
  const sideList = document.querySelector(".side-list");

  useEffect(() => {
    const scrollBoxY = sessionStorage.getItem("scrollBox");
    const sideListY = sessionStorage.getItem("sideList"); // revisit - not working on desktop for some reason

    if (scrollBoxY) {
      scrollBox?.scrollTo(0, parseInt(scrollBoxY));
      sessionStorage.removeItem("scrollBox");
    }
    if (sideListY) {
      sideList?.scrollTo(0, parseInt(sideListY));
      sessionStorage.removeItem("sideList");
    }
  }, [scrollBox, sideList]);

  return (
    <Card
      key={candidate.id}
      sx={{
        display: "flex",
        flexFlow: "row-reverse",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        // backgroundColor: active ? "rgba(255,255,255,.1)" : "default",
        // border: active ? "1px solid rgba(255,255,255,.25)" : "none",
        backgroundColor: active
          ? (theme) => "rgba(255,255,255,.125)"
          : "default",
        border: active
          ? "1px solid rgba(255,255,255,.25)"
          : "1px solid transparent",
      }}
    >
      <Stack sx={{ width: "100%" }}>
        <CardActionArea>
          <CardContent
            sx={{
              display: "flex",
              flexFlow: "column",
              gap: "16px",
              fontSize: mdDown ? "14px" : "1rem",
              padding: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                gap: "1rem",
              }}
            >
              <Box
                // custom Link component based on NextLink, not MUI Link, is required here to persist layout and avoid page reset
                onClick={() => {
                  // autoPlayOnReady.current = false;
                  handleDrawerOpen();
                  // setNowPlayingCandidate(candidate);
                  // setNowPlayingFeed(null);
                  sessionStorage.setItem(
                    "scrollBox",
                    String(scrollBox?.scrollTop),
                  );
                  sessionStorage.setItem(
                    "sideList",
                    String(sideList?.scrollTop),
                  );
                }}
                style={{
                  width: "100%",
                  color: "inherit",
                  textDecoration: "inherit",
                  padding: mdDown ? "12px" : "1rem",
                  paddingBottom: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  {candidate.hydrophone !== "Out of audible range" && (
                    <Box
                      sx={{
                        backgroundImage: `url(${image})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        minWidth: mdDown ? "40px" : "60px",
                        minHeight: mdDown ? "40px" : "60px",
                        borderRadius: "4px",
                      }}
                    ></Box>
                  )}

                  <Stack>
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "inherit",
                        // color: active ? (theme) => "antiquewhite" : "default",
                      }}
                    >
                      {candidateTitle}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: "inherit" }}>
                      {candidate.hydrophone}
                      {" · "}
                      {timeAgoString} ago
                      {candidate.hydrophone !== "Out of audible range" &&
                        ` · ${durationString}`}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
              <Box
                style={{
                  paddingTop: mdDown ? "8px" : "12px",
                  paddingRight: mdDown ? "8px" : "12px",
                }}
              >
                {duration > 0
                  ? !active
                    ? playIcon
                    : masterPlayerStatus !== "playing"
                      ? playIcon
                      : pauseIcon
                  : candidate.hydrophone !== "Out of audible range"
                    ? playIconDisabled
                    : null}
              </Box>
            </Box>
            <Box
              // custom Link component based on NextLink, not MUI Link, is required here to persist layout and avoid page reset
              onClick={() => {
                handleDrawerOpen();
              }}
              style={{
                width: "100%",
                color: "inherit",
                textDecoration: "inherit",
                padding: mdDown ? "12px" : "1rem",
                paddingTop: 0,
              }}
            >
              <Typography variant="body1" sx={{ fontSize: "inherit" }}>
                {candidate.clipCount}
                <span style={{ whiteSpace: "pre" }}>{"  "}</span>
                {candidate.descriptions ? (
                  <span style={{ color: "rgba(255,255,255,.75)" }}>
                    {candidate.descriptions}
                  </span>
                ) : (
                  <br />
                )}
              </Typography>

              {tagArray && (
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                    padding: "1rem 0 0",
                    flexWrap: "wrap",
                  }}
                >
                  {Object.entries(tagObject).map(([tag]) => (
                    <Chip
                      label={`${tag}`}
                      key={tag}
                      variant="filled"
                      sx={{
                        fontSize: "14px",
                      }}
                    />
                  ))}
                </Box>
              )}
              {imageLinks.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                    padding: "1rem 0",
                    flexWrap: "wrap",
                  }}
                >
                  {imageLinks.map((link) => (
                    <Box
                      key={link}
                      sx={{
                        height: "100px",
                        width: "100px",
                        backgroundImage: `url(${link})`,
                        backgroundSize: "cover",
                      }}
                    ></Box>
                  ))}
                </Box>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
        <div style={{ padding: mdDown ? "12px" : "1rem" }}>
          <CommunityBar votes={candidate.array.length} />
        </div>
      </Stack>
    </Card>
  );
}
