import { Pause, PlayArrow, PlayCircle } from "@mui/icons-material";
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
import { useEffect } from "react";

import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
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

  const { setPlaybarExpanded, setDrawerContent, setDrawerSide } = useLayout();

  const candidate = props.candidate;
  const active = candidate.id === nowPlayingCandidate?.id;
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { feeds } = useData();
  const feed = feeds.find(
    (feed) => feed.id === props.candidate.array[0].feedId,
  );

  const handleDrawerOpen = () => {
    if (!mdDown && masterPlayerStatus === "playing")
      masterPlayerRef?.current?.pause?.();
    setNowPlayingFeed(null);
    setNowPlayingCandidate(candidate);
    setPlaybarExpanded(true);
    setDrawerSide("left");
    setDrawerContent(
      <CandidateDrawer key={candidate.id} candidate={candidate} />,
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

  const handlePause = () => {
    const player = masterPlayerRef?.current;
    if (player && typeof player.pause === "function") {
      player.pause();
    }
  };

  const iconSize = "28px";

  const playIcon = (
    <PlayArrow
      sx={{
        height: iconSize,
        width: iconSize,
        cursor: "pointer",
      }}
    />
  );

  const playIconDisabled = (
    <PlayCircle
      sx={{
        opacity: 0.25,
        height: iconSize,
        width: iconSize,
      }}
    />
  );

  const pauseIcon = (
    <Pause
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
        backgroundColor: active ? "rgba(255,255,255,.125)" : "default",
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
            onClick={() => {
              handleDrawerOpen();
              sessionStorage.setItem("scrollBox", String(scrollBox?.scrollTop));
              sessionStorage.setItem("sideList", String(sideList?.scrollTop));
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
                  {candidate.hydrophone !== "out of range" && (
                    <Box
                      sx={{
                        backgroundImage: `url(${image})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        minWidth: "60px",
                        minHeight: "60px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        className="hydrophone-play-pause"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 100,
                          backgroundColor: "rgba(0,0,0,.66)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {duration > 0
                          ? !active
                            ? playIcon
                            : masterPlayerStatus !== "playing" &&
                                nowPlayingCandidate
                              ? playIcon
                              : pauseIcon
                          : candidate.hydrophone !== "out of range"
                            ? playIconDisabled
                            : null}
                      </div>
                    </Box>
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
            </Box>
            <Box
              // custom Link component based on NextLink, not MUI Link, is required here to persist layout and avoid page reset
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
