import { GraphicEq, KeyboardArrowDown } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/router";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import CommunityBar from "@/components/CandidateList/CommunityBar";
import DetailTabs from "@/components/CandidateList/DetailTabs";
import { DetectionsList } from "@/components/CandidateList/DetectionsList";
import PlayBar from "@/components/PlayBar/PlayBar";
import WavesurferPlayer from "@/components/PlayBar/WavesurferPlayer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { useComputedPlaybackFields } from "@/hooks/beta/useComputedPlaybackFields";
import useConcatenatedAudio from "@/hooks/beta/useConcatenatedAudio";
import {
  AIData,
  Candidate,
  CombinedData,
  HumanData,
  Sighting,
} from "@/types/DataTypes";
import formatDuration from "@/utils/masterDataHelpers";
import { formatTimestamp } from "@/utils/time";

export type DetectionsProps = {
  all: CombinedData[];
  human: HumanData[];
  ai: AIData[];
  sightings: Sighting[];
  hydrophone: string;
  startTime: string;
};

const DetailColumn = ({
  candidate,
  //   detections,
  durationString,
  onClose,
  isProcessing,
  audioUrl,
  audioBlob,
  clipId,
  error,
  buildRequested,
  setBuildRequested,
  waveSurferContainer,
}: {
  candidate: Candidate | null;
  durationString: string | undefined | null;
  onClose: () => void;
  isProcessing: boolean;
  audioUrl: string | undefined;
  audioBlob: Blob | null;
  clipId: string;
  error: string | null;
  buildRequested: boolean;
  setBuildRequested: Dispatch<SetStateAction<boolean>>;
  waveSurferContainer: ReactNode;
}) => {
  const { filters } = useData();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  if (!candidate) return null;

  const currentTimeSeconds = new Date().getTime() / 1000;
  const timestampSeconds =
    new Date(candidate.startTimestamp ?? "").getTime() / 1000;
  const timeAgoString = formatDuration(timestampSeconds, currentTimeSeconds);

  const ascDetections = candidate.array.sort(
    (a, b) =>
      Date.parse(a.timestamp.toString()) - Date.parse(b.timestamp.toString()),
  );

  const tabs = [
    {
      label: "Reports",
      value: "reports",
      content: candidate && (
        <>
          <DetectionsList array={ascDetections} />
        </>
      ),
    },
    { label: "Comments", value: "comments", content: <></> },
  ];

  return (
    <Container
      sx={{
        padding: "24px 0px !important",
        width: mdDown ? "100%" : "33%",
      }}
    >
      <Box>
        <Box
          sx={{
            px: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<KeyboardArrowDown />}
            sx={{
              whiteSpace: "nowrap",
              backgroundColor: "rgba(255,255,255,.2)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,.25)",
              },
            }}
            onClick={onClose}
          >
            Close player
          </Button>

          <Box>
            <Typography variant="h5" sx={{ lineHeight: 1, my: ".5rem" }}>
              {formatTimestamp(candidate.startTimestamp)}
            </Typography>

            <Typography
              variant="h6"
              sx={{ lineHeight: 1.2, opacity: 0.75, mb: "4px" }}
            >
              {candidate.hydrophone}
            </Typography>

            <Typography variant="body1" sx={{ lineHeight: 1.2, opacity: 0.75 }}>
              {timeAgoString} ago
              {" · "}
              {durationString}
              {" · "}
              Reports within {filters?.timeIncrement} min
            </Typography>
          </Box>
        </Box>
        <Stack
          gap={4}
          direction="column"
          sx={{ my: 3, px: 3, alignItems: "flex-start" }}
        >
          <CommunityBar
            votes={0}
            downloadReady={!!audioUrl}
            audioUrl={audioUrl}
            clipId={clipId}
          />
          {!audioUrl && (
            <Button
              variant="outlined"
              sx={{
                display: "flex",
                gap: ".75rem",
                background: "rgba(255,255,255,.15)",
              }}
              onClick={() => setBuildRequested(true)}
            >
              {!buildRequested ? (
                <>
                  <GraphicEq />
                  <span>Generate spectrogram view</span>
                </>
              ) : isProcessing ? (
                <>
                  <CircularProgress size={20} />
                  <span>Building mp3 file...</span>
                </>
              ) : error ? (
                <p>Error: {error}</p>
              ) : (
                <>
                  <CircularProgress size={20} />
                  <span>Generating audio url...</span>
                </>
              )}
            </Button>
          )}
          {mdDown && waveSurferContainer}

          {mdDown && !audioBlob && <PlayBar key={`mobile-${candidate?.id}`} />}
        </Stack>
        <Box className="main">
          <DetailTabs tabs={tabs} />
        </Box>
      </Box>
    </Container>
  );
};

export const CandidateDrawer = ({
  candidate,
}: {
  candidate: Candidate | null;
}) => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { setPlaybarExpanded } = useLayout();
  const { durationString } = useComputedPlaybackFields(candidate);
  const router = useRouter();
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const feedId = candidate?.feedId ?? "";
  const startEnd = useMemo(() => {
    return typeof candidate?.id === "string" ? candidate?.id?.split("_") : [];
  }, [candidate?.id]);
  const startTimeString = startEnd[0];
  const endTimeString = startEnd[startEnd.length - 1];
  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();

  useEffect(() => {
    setNowPlayingCandidate(candidate);
    setNowPlayingFeed(null);
  }, [setNowPlayingCandidate, setNowPlayingFeed]);

  const [buildRequested, setBuildRequested] = useState<boolean>(false);

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
    enabled: buildRequested,
  });

  useEffect(() => {
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
  }, [audioBlob]);

  useEffect(() => {
    setAudioUrl(undefined);
  }, [router.asPath]);

  const handleClose = () => {
    setPlaybarExpanded(false);
  };

  const waveSurferContainer = (
    <Box
      className="wavesurfer-container"
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {audioUrl && (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: isProcessing ? "center" : "flex-start",
          }}
        >
          <div style={{ width: "100%" }}>
            <WavesurferPlayer audioUrl={audioUrl} />
            <div style={{ display: "none" }}>{totalDurationMs} ms</div>
            {droppedSeconds > 0 && (
              <div>Dropped {droppedSeconds} seconds from stream reset</div>
            )}
          </div>
        </Box>
      )}
    </Box>
  );

  return (
    <Stack
      direction="row"
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <DetailColumn
        candidate={candidate}
        durationString={durationString}
        onClose={handleClose}
        isProcessing={isProcessing}
        audioUrl={audioUrl}
        audioBlob={audioBlob}
        clipId={startTimeString}
        error={error}
        buildRequested={buildRequested}
        setBuildRequested={setBuildRequested}
        waveSurferContainer={waveSurferContainer}
      />
      <Box
        className="body-column"
        sx={{
          height: "100%",
          width: "100%",
          display: mdDown ? "none" : "flex",
          flexDirection: "column",
          position: "relative",
          paddingBottom: "2rem",
        }}
      >
        {!mdDown && waveSurferContainer}
        {/* <Box
          className="html-audio-container"
          sx={{
            minHeight: "100px",
          }}
        >
          <Box>
            {isProcessing ? (
              <p>Processing HTML player...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : audioUrl ? (
              <div>
                <audio controls src={audioUrl} key={startTimeString}></audio>
                <div>{totalDurationMs} ms</div>
                {droppedSeconds > 0 && (
                  <div>Dropped {droppedSeconds} seconds from stream reset</div>
                )}
              </div>
            ) : (
              <p>No audio available.</p>
            )}
          </Box>
        </Box> */}
        {!audioBlob && (
          <Box
            className="candidate-playbar-container"
            sx={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",

              width: "calc(100% - 48px)",
              mx: "24px",
            }}
          >
            {!mdDown && <PlayBar key={`desktop-${candidate?.id}`} />}
          </Box>
        )}
      </Box>
    </Stack>
  );
};
