import { ArrowBackIos, Close } from "@mui/icons-material";
import {
  Box,
  Container,
  Link,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";

import CommunityBar from "@/components/CandidateList/CommunityBar";
import DetailTabs from "@/components/CandidateList/DetailTabs";
import { DetectionsList } from "@/components/CandidateList/DetectionsList";
import LoadingSpinner from "@/components/LoadingSpinner";
import WavesurferPlayer from "@/components/PlayBar/WavesurferPlayer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useComputedPlaybackFields } from "@/hooks/beta/useComputedPlaybackFields";
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
  clipId,
}: {
  candidate: Candidate | null;
  durationString: string | undefined | null;
  onClose: () => void;
  isProcessing: boolean;
  audioUrl: string | undefined;
  clipId: string;
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
        <div style={{ margin: mdDown ? "0 24px" : 0 }}>
          <DetectionsList array={ascDetections} />
        </div>
      ),
    },
    { label: "Comments", value: "comments", content: <></> },
  ];

  return (
    <div style={{ minWidth: "33%" }}>
      <Container
        sx={{
          padding: "24px 0px !important",
        }}
      >
        <Box>
          {mdDown && (
            <Link
              href={"/beta/candidates"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                lineHeight: 1,
                color: "common.white",
                zIndex: 1,
                position: "relative",
              }}
            >
              <ArrowBackIos />
            </Link>
          )}
          <Box
            sx={{
              px: 3,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
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

              <Typography
                variant="body1"
                sx={{ lineHeight: 1.2, opacity: 0.75 }}
              >
                {timeAgoString} ago
                {" · "}
                {durationString}
                {" · "}
                Reports within {filters?.timeIncrement} min
              </Typography>
            </Box>
            {!mdDown && <Close onClick={onClose} />}
          </Box>
          <Stack gap={2} direction="column" sx={{ my: 3, px: 3 }}>
            <CommunityBar
              votes={0}
              downloadReady={!isProcessing}
              audioUrl={audioUrl}
              clipId={clipId}
            />
            {/* {mdDown && (
              <Button
                variant="outlined"
                sx={{ width: "100%" }}
                onClick={() => {
                  setMobileTab(0);
                  router.push("/beta");
                }}
              >
                Open map view
              </Button>
            )} */}
          </Stack>
          <Box className="main">
            <DetailTabs tabs={tabs} />
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export const CandidateDrawer = ({
  clipId,
  audioUrl,
  spectrogramUrl,
  isProcessing,
  error,
  totalDurationMs,
  droppedSeconds,
  candidate,
}: {
  clipId: string;
  audioUrl: string | undefined;
  spectrogramUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  totalDurationMs: string | null;
  droppedSeconds: number;
  candidate: Candidate | null;
}) => {
  const { setPlaybarExpanded } = useLayout();
  const { durationString } = useComputedPlaybackFields(candidate);

  const handleClose = () => {
    // setNowPlayingFeed(feed ?? null);
    // setNowPlayingCandidate(null);
    // autoPlayOnReady.current = false;
    setPlaybarExpanded(false);
  };

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
        clipId={clipId}
      />
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          className="wavesurfer-container"
          sx={{
            flex: 1,
          }}
        >
          <Box
            sx={{
              margin: "8px",
              height: "100%",
              maxWidth: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: isProcessing ? "center" : "flex-start",
            }}
          >
            {isProcessing ? (
              <Stack gap={3}>
                <LoadingSpinner />
                {"Building audio file..."}
              </Stack>
            ) : error ? (
              <p>Error: {error}</p>
            ) : audioUrl ? (
              <div style={{ width: "100%" }}>
                <WavesurferPlayer audioUrl={audioUrl} />
                {/* <div>{totalDurationMs} ms</div>
              {droppedSeconds > 0 && (
                <div>Dropped {droppedSeconds} seconds from stream reset</div>
              )} */}
              </div>
            ) : (
              <p>No audio available.</p>
            )}
          </Box>
        </Box>
        <Box
          className="html-audio-container"
          sx={{
            minHeight: "100px",
            display: "none",
          }}
        >
          <Box>
            {isProcessing ? (
              <p>Processing HTML player...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : audioUrl ? (
              <div>
                <audio controls src={audioUrl} key={clipId}></audio>
                <div>{totalDurationMs} ms</div>
                {droppedSeconds > 0 && (
                  <div>Dropped {droppedSeconds} seconds from stream reset</div>
                )}
              </div>
            ) : (
              <p>No audio available.</p>
            )}
          </Box>
        </Box>
        <Box
          className="drawer-actions"
          sx={{
            border: "1px solid blue",
            height: "100px",
            display: "none",
          }}
        >
          {/* <PlayBar /> */}
        </Box>
      </Box>
    </Stack>
  );
};
