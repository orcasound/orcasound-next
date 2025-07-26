import { ArrowBackIos, Close } from "@mui/icons-material";
import {
  Box,
  Container,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import { DetectionsList } from "@/components/CandidateList/DetectionsList";
import HydrophoneDetailTabs from "@/components/CandidateList/HydrophoneDetailTabs";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import Link from "@/components/Link";
import WaveformPlayer from "@/components/PlayBar/WaveformPlayer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { Feed } from "@/graphql/generated";
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

function CandidatePage() {
  return null;
}

type DetectionsProps = {
  all: CombinedData[];
  human: HumanData[];
  ai: AIData[];
  sightings: Sighting[];
  hydrophone: string;
  startTime: string;
};

const RightDetail = ({
  candidate,
  feed,
  detections,
  durationString,
  onClose,
}: {
  candidate: Candidate | null;
  feed?: Feed;
  detections: DetectionsProps;
  durationString: string | undefined | null;
  onClose: () => void;
}) => {
  const { filters } = useData();
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const currentTimeSeconds = new Date().getTime() / 1000;
  const timestampSeconds =
    new Date(candidate?.startTimestamp ?? "").getTime() / 1000;
  const timeAgoString = formatDuration(timestampSeconds, currentTimeSeconds);
  if (!detections?.startTime) return null;

  return (
    <div>
      <Head>Report {candidate?.id} | Orcasound </Head>
      <Container
        maxWidth="xl"
        sx={{
          p: 2,
          pb: 14,
        }}
      >
        <Box>
          {" "}
          {smDown && (
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
              marginTop: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ lineHeight: 1, my: ".5rem" }}>
                {formatTimestamp(detections.startTime)}
              </Typography>

              <Typography
                variant="h6"
                sx={{ lineHeight: 1.2, opacity: 0.75, mb: "4px" }}
              >
                {detections.hydrophone}
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
            {!smDown && (
              <Link href={`/beta/${feed?.slug}`} onClick={onClose}>
                <Close />
              </Link>
            )}
          </Box>
          <Stack gap={2} direction="column" sx={{ my: 3 }}>
            {/* {smDown && (
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
            {candidate && <DetectionsList candidate={candidate} />}
          </Box>
        </Box>
      </Container>
    </div>
  );
};

const LeftDetail = ({ feed }: { feed: Feed | undefined }) => {
  return (
    <HydrophoneDetailTabs showTabs={false}>
      <CandidatesStack feed={feed} showChart={true}></CandidatesStack>
    </HydrophoneDetailTabs>
  );
};

const CenterDetail = ({
  clipId,
  audioUrl,
  spectrogramUrl,
  isProcessing,
  error,
  totalDurationMs,
  droppedSeconds,
}: {
  clipId: string;
  audioUrl: string | undefined;
  spectrogramUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  totalDurationMs: string | null;
  droppedSeconds: number;
}) => {
  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        className="drawer-controls"
        sx={{
          minHeight: "36px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingX: "8px",
          borderBottom: "1px solid rgba(255,255,255,.7)",
        }}
      >
        {audioUrl ? (
          <a href={audioUrl} download={`clip-${clipId}.mp3`}>
            Download MP3
          </a>
        ) : (
          "Processing mp3..."
        )}
        {spectrogramUrl && (
          <a href={spectrogramUrl} download={`spectrogram-${clipId}.png`}>
            Download spectrogram
          </a>
        )}
      </Box>
      <Box
        className="wavesurfer-container"
        sx={{
          flex: 1,
        }}
      >
        <Box>
          {isProcessing ? (
            <p>Processing waveform player...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : audioUrl ? (
            <div>
              <WaveformPlayer audioUrl={audioUrl} />
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
    </Stack>
  );
};

const CandidateLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { feeds, sortedCandidates, filteredData, autoPlayOnReady } = useData();
  const { setPlaybarExpanded } = useLayout();
  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();

  const { candidateId, feedSlug } = router.query;

  const feed = feeds.find((f) => f.slug === feedSlug) ?? undefined;
  const feedId = useMemo(() => {
    return feeds.find((f) => f.slug === feedSlug)?.id ?? "";
  }, [feeds, feedSlug]);
  const candidate = sortedCandidates.find((c) => c.id === candidateId) ?? null;
  const startEnd = useMemo(() => {
    return typeof candidateId === "string" ? candidateId?.split("_") : [];
  }, [candidateId]);
  const startTimeString = startEnd[0];
  const endTimeString = startEnd[startEnd.length - 1];
  const startTimeMs = new Date(startEnd[0]).getTime();
  const endTimeMs = new Date(startEnd[startEnd.length - 1]).getTime();

  const { durationString } = useComputedPlaybackFields(candidate);

  const [detections, setDetections] = useState<DetectionsProps>({
    all: [],
    human: [],
    ai: [],
    sightings: [],
    hydrophone: "",
    startTime: "",
  });

  const [candidateIdState, setCandidateIdState] = useState<
    string | string[] | undefined
  >(undefined);

  const previousCandidateIdRef = useRef<string | string[] | undefined>();

  // necessary to ensure the next useEffect runs
  useEffect(() => {
    setCandidateIdState(candidateId);
  }, [candidateId, setCandidateIdState]);

  // Playbar open/close logic on route change
  useEffect(() => {
    // Don't do anything if there's no candidateId
    if (!candidateIdState) return;

    // Skip if same as previous
    if (previousCandidateIdRef.current === candidateIdState) return;

    // Save new value
    previousCandidateIdRef.current = candidateIdState;

    // Collapse then expand playbar
    setPlaybarExpanded(false);
    const timeout = setTimeout(() => {
      setPlaybarExpanded(true);
    }, 700);

    return () => clearTimeout(timeout);
  }, [candidateIdState, setPlaybarExpanded]);

  // Now Playing logic
  useEffect(() => {
    setNowPlayingCandidate(candidate);
    setNowPlayingFeed(null);
  }, [candidate, setNowPlayingCandidate, setNowPlayingFeed]);

  // Detections lookup
  useEffect(() => {
    const arr: CombinedData[] = [];
    filteredData.forEach((d) => {
      const time = new Date(d.timestamp.toString()).getTime();
      if (time >= startTimeMs && time <= endTimeMs && d.feedId === feed?.id) {
        arr.push(d);
      }
    });
    const sortedArr = arr.sort(
      (a, b) =>
        Date.parse(a.timestamp.toString()) - Date.parse(b.timestamp.toString()),
    );

    setDetections({
      all: sortedArr,
      human: sortedArr.filter((d) => d.type === "human"),
      ai: sortedArr.filter((d) => d.type === "ai"),
      sightings: sortedArr.filter((d) => d.type === "sightings"),
      hydrophone: sortedArr[0]?.hydrophone,
      startTime: new Date(startTimeString).toLocaleString(),
    });
  }, [filteredData, feed?.id, startTimeMs, endTimeMs, startTimeString]);

  const handleClose = () => {
    setNowPlayingFeed(feed ?? null);
    setNowPlayingCandidate(null);
    autoPlayOnReady.current = false;
    setPlaybarExpanded(false);
  };

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
    setAudioUrl(undefined);
  }, [router.asPath]);

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

  console.log("Rendering CandidateLayout");

  return (
    <HalfMapLayout
      leftSlot={<LeftDetail feed={feed} />}
      centerSlot={
        <CenterDetail
          clipId={startTimeString}
          audioUrl={audioUrl}
          spectrogramUrl={spectrogramUrl}
          isProcessing={isProcessing}
          error={error}
          totalDurationMs={totalDurationMs}
          droppedSeconds={droppedSeconds}
        />
      }
      rightSlot={
        <RightDetail
          candidate={candidate}
          feed={feed}
          detections={detections}
          durationString={durationString}
          onClose={handleClose}
        />
      }
    >
      {children}
    </HalfMapLayout>
  );
};

CandidatePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MasterDataLayout>
      <CandidateLayout>{page}</CandidateLayout>
    </MasterDataLayout>
  );
};

export default CandidatePage;
