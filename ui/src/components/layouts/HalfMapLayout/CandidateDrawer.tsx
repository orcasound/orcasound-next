// CandidateDrawer.tsx — use numeric tab index (stable), switch to 1 after save,
// and reset the unsaved selector back to the start so it’s draggable again.

import { ExpandLess, GraphicEq } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  TextField,
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
  useRef,
  useState,
} from "react";

import CommunityBar from "@/components/CandidateList/CommunityBar";
import DetailTabs, { Tab } from "@/components/CandidateList/DetailTabs";
import { DetectionsList } from "@/components/CandidateList/DetectionsList";
import PlayBar from "@/components/PlayBar/PlayBar";
import WavesurferPlayer, {
  Annotation,
} from "@/components/PlayBar/WavesurferPlayer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { useComputedPlaybackFields } from "@/hooks/beta/useComputedPlaybackFields";
import useConcatenatedAudio from "@/hooks/beta/useConcatenatedAudio";
import darkTheme from "@/styles/darkTheme";
import { Candidate } from "@/types/DataTypes";
import formatDuration from "@/utils/masterDataHelpers";
import { formatTimestamp } from "@/utils/time";

const DetailColumn = ({
  candidate,
  durationString,
  onClose,
  isProcessing,
  audioUrl,
  clipId,
  error,
  buildRequested,
  setBuildRequested,
  waveSurferContainer,
  onToggleAnnotation,
  tabs,
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
  annotations: Annotation[];
  activeAnnotationId: string | null;
  onToggleAnnotation: (id: string) => void;
  tabs: Tab[] | undefined;
}) => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const currentTimeSeconds = new Date().getTime() / 1000;
  const timestampSeconds =
    new Date(candidate?.startTimestamp ?? "").getTime() / 1000;
  const timeAgoString = formatDuration(timestampSeconds, currentTimeSeconds);

  return (
    <Container
      className="detail-column"
      sx={{
        padding: "24px 0px !important",
        width: mdDown ? "100%" : "33%",
        maxWidth: mdDown ? "100%" : "33%",
        minWidth: mdDown ? "100%" : "33%",
        background: darkTheme.palette.background.default,
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
          <Box sx={{ width: "100%" }}>
            <Stack
              direction="row"
              sx={{
                alignItems: "flex-start",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="h5" sx={{ lineHeight: 1, my: ".5rem" }}>
                {candidate && formatTimestamp(candidate.startTimestamp)}
              </Typography>
              <Box
                className="playbar-expand-button"
                sx={{
                  minWidth: "40px",
                  minHeight: "40px",
                  backgroundColor: "rgba(255,255,255,.25)",
                  borderRadius: "10px",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  cursor: "pointer",
                }}
                onClick={onClose}
              >
                <ExpandLess
                  sx={{
                    transform: useLayout().playbarExpanded
                      ? "rotate(180deg)"
                      : "none",
                  }}
                />
              </Box>
            </Stack>
            <Typography
              variant="h6"
              sx={{ lineHeight: 1.2, opacity: 0.75, mb: "4px" }}
            >
              {candidate && candidate.hydrophone}
            </Typography>

            <Typography variant="body1" sx={{ lineHeight: 1.2, opacity: 0.75 }}>
              {timeAgoString} ago · {durationString} · Reports within{" "}
              {useData().filters?.timeIncrement} min
            </Typography>
          </Box>
        </Box>
        <Stack
          gap={4}
          direction="column"
          sx={{ my: 3, px: 3, alignItems: !mdDown ? "flex-start" : "unset" }}
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
                <span>Error: {error}</span>
              ) : (
                <>
                  <CircularProgress size={20} />
                  <span>Generating audio url...</span>
                </>
              )}
            </Button>
          )}
          {mdDown && waveSurferContainer}
          {mdDown && !audioUrl && <PlayBar key={`mobile-${candidate?.id}`} />}
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

  const { setPlaybarExpanded, headerHeight } = useLayout();
  const { durationString } = useComputedPlaybackFields(candidate);
  const router = useRouter();
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const { feeds } = useData();
  const feed = feeds.find((f) => f.id === candidate?.feedId);
  const feedId = candidate?.feedId ?? "";
  const startTimeString = candidate?.startTimestamp || "";
  const endTimeString = candidate?.endTimestamp || "";

  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();

  const detections = useMemo(
    () =>
      candidate?.array
        .slice()
        .sort(
          (a, b) =>
            Date.parse(a.timestamp.toString()) -
            Date.parse(b.timestamp.toString()),
        ) ?? [],
    [candidate],
  );

  // --- Annotation state ---
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
    null,
  );

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: "Detections",
        value: "detections",
        content: candidate && (
          <>{detections && <DetectionsList array={detections} />}</>
        ),
      },
      {
        label: "Annotations",
        value: "annotations",
        content: candidate && (
          <List sx={{ px: 3, width: "100%" }}>
            {annotations?.map((a, index) => (
              <ListItemButton
                key={index}
                sx={{
                  px: 0,
                  borderTop:
                    index !== 0 ? "1px solid rgba(255,255,255,.25)" : "none",
                }}
              >
                <ListItemText
                  className="list-item-text"
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        mb: ".25em",
                      }}
                    >
                      Orcasound User
                    </Box>
                  }
                  secondary={
                    <>
                      <span style={{ color: "#fff" }}>
                        {`${a.start.toFixed(1)}s - ${a.end.toFixed(1)}s`}
                      </span>
                      {a.text && a.text.length > 0 && <> · {a.text}</>}
                    </>
                  }
                />
                <ListItemAvatar sx={{ display: "flex", opacity: "0.9" }}>
                  <Box sx={{ padding: "0 8px" }} />
                  <Box sx={{ padding: "0 8px" }} />
                </ListItemAvatar>
              </ListItemButton>
            ))}
          </List>
        ),
      },
    ],
    [candidate, detections, annotations],
  );

  useEffect(() => {
    setNowPlayingCandidate(candidate);
    setNowPlayingFeed(null);
  }, [setNowPlayingCandidate, setNowPlayingFeed, candidate]);

  const [buildRequested, setBuildRequested] = useState<boolean>(false);

  const { audioBlob, isProcessing, error, totalDurationMs, droppedSeconds } =
    useConcatenatedAudio({
      feedId,
      startTime: startTimeString,
      endTime: endTimeString,
      enabled: buildRequested && !!startTimeString && !!endTimeString,
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
      if (url) URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  useEffect(() => {
    setAudioUrl(undefined);
  }, [router.asPath]);

  const handleClose = () => {
    setPlaybarExpanded(false);
    if (mdDown || !router.query.feedSlug) setNowPlayingCandidate(null);
    if (mdDown && router.query.feedSlug && feed) setNowPlayingFeed(feed);
  };

  // --- Sizing: 60/40 split of the body column ---
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [playerHeight, setPlayerHeight] = useState<number>(320);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const total = Math.floor(entry.contentRect.height);
      if (total > 0) setPlayerHeight(Math.max(220, Math.floor(total * 0.6)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // --- Unsaved 30s region controls (preserved UI) ---
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const [currentRegion, setCurrentRegion] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // --- CLAP suggestions (stub) ---
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");
  const [customText, setCustomText] = useState<string>("");

  const requestSuggestions = async () => {
    if (!currentRegion || !audioUrl) return;
    const s = [
      "S04 call, likely J pod",
      "Echolocation clicks, distant",
      "Whistle-like call with vessel noise",
    ];
    setSuggestions(s);
    if (s.length > 0) setSelectedSuggestion(s[0]);
  };

  // Controlled DetailTabs index here (0 = Detections, 1 = Annotations)
  const [activeTab, setActiveTab] = useState<Tab | undefined>(
    tabs ? tabs[0] : undefined,
  );

  // Save button handler: use currentRegion + caption to append to state
  const saveAnnotation = () => {
    if (!currentRegion) return;
    const text = (selectedSuggestion || customText).trim();
    if (!text) return;
    const id = `ann-${Date.now()}`;
    setAnnotations((prev) => [
      ...prev,
      { id, start: currentRegion.start, end: currentRegion.end, text },
    ]);
    setSuggestions([]);
    setSelectedSuggestion("");
    setCustomText("");

    // Switch to Annotations tab (index 1) and reset the unsaved selector back to start
    setActiveTab(tabs[1]);
  };

  const onToggleAnnotation = (id: string) => {
    setActiveAnnotationId((prev) => (prev === id ? null : id));
  };

  const waveSurferContainer = audioUrl && (
    <Box
      className="wavesurfer-container"
      sx={{
        width: "100%",
        height: `${playerHeight}px`,
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <div style={{ width: "100%" }}>
          <WavesurferPlayer
            audioUrl={audioUrl}
            detections={detections}
            startTimestamp={candidate?.startTimestamp}
            desiredHeightPx={playerHeight}
            annotations={annotations}
            onUnsavedRegionChange={(region) => setCurrentRegion(region)}
          />
          <div style={{ display: "none" }}>{totalDurationMs} ms</div>
          {droppedSeconds > 0 && (
            <div> Dropped {droppedSeconds} seconds from stream reset</div>
          )}
        </div>
      </Box>
    </Box>
  );

  return (
    <Stack direction="row" sx={{ width: "100%", flex: 1 }}>
      <DetailColumn
        candidate={candidate}
        durationString={durationString}
        onClose={() => {
          setPlaybarExpanded(false);
          if (mdDown || !router.query.feedSlug) {
            setNowPlayingCandidate(null);
          }
          if (mdDown && router.query.feedSlug && feed) {
            setNowPlayingFeed(feed);
          }
        }}
        isProcessing={isProcessing}
        audioUrl={audioUrl}
        audioBlob={audioBlob}
        clipId={startTimeString}
        error={error}
        buildRequested={buildRequested}
        setBuildRequested={setBuildRequested}
        waveSurferContainer={
          audioUrl ? (
            <Box sx={{ width: "100%" }}>
              <Typography variant="overline" sx={{ opacity: 0.6 }}>
                Clip ready
              </Typography>
            </Box>
          ) : null
        }
        annotations={annotations}
        activeAnnotationId={activeAnnotationId}
        onToggleAnnotation={onToggleAnnotation}
        tabs={tabs}
      />

      <Box
        className="body-column"
        ref={bodyRef}
        sx={{
          height: `calc(100dvh - ${headerHeight}px)`,
          minHeight: 0,
          flex: 1,
          display: mdDown ? "none" : "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "accent1.main",
          overflow: "hidden",
          gap: 2,
          p: 2,
          boxSizing: "border-box",
        }}
      >
        {/* TOP: Player (60%) */}
        <Box
          sx={{
            width: "100%",
            height: `${playerHeight}px`,
            flex: "0 0 auto",
            minHeight: 0,
          }}
        >
          {audioUrl ? (
            waveSurferContainer
          ) : (
            <Box
              sx={{
                height: `${playerHeight}px`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                px: 2,
                mt: 32,
              }}
            >
              <PlayBar key={`desktop-${candidate?.id}`} />
            </Box>
          )}
        </Box>

        {/* BOTTOM: CLAP captioning panel (only when audioBlob exists) */}
        <Box
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            display: audioBlob ? "flex" : "none",
            flexDirection: "column",
            gap: 1.5,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Contribute an annotation</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showSelector}
                  onChange={(e) => setShowSelector(e.target.checked)}
                />
              }
              label="Show 30s selector"
            />
          </Stack>

          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Region:{" "}
            {currentRegion
              ? `${currentRegion.start.toFixed(1)}s – ${currentRegion.end.toFixed(1)}s`
              : "toggle the selector and drag to choose a segment"}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            gap={2}
            sx={{ flexWrap: "wrap", mb: 2 }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={requestSuggestions}
              disabled={!audioUrl || !currentRegion || isProcessing}
              sx={{ maxWidth: "fit-content" }}
            >
              Suggest with CLAP
            </Button>
            {suggestions.map((s) => (
              <Chip
                key={s}
                label={s}
                clickable
                onClick={() => setSelectedSuggestion(s)}
                color={selectedSuggestion === s ? "success" : "default"}
                variant={selectedSuggestion === s ? "filled" : "outlined"}
                sx={{ m: "0 !important" }}
              />
            ))}
          </Stack>

          <TextField
            multiline
            minRows={3}
            label="Edit or write your caption"
            value={selectedSuggestion || customText}
            onChange={(e) => {
              if (selectedSuggestion) setSelectedSuggestion("");
              setCustomText(e.target.value);
            }}
          />

          <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              onClick={saveAnnotation}
              disabled={!currentRegion || (!selectedSuggestion && !customText)}
            >
              Save annotation
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setSuggestions([]);
                setSelectedSuggestion("");
                setCustomText("");
              }}
            >
              Clear
            </Button>
            {!audioUrl && (
              <Typography variant="body2" sx={{ opacity: 0.6, ml: 1 }}>
                (Load audio to enable suggestions)
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};
