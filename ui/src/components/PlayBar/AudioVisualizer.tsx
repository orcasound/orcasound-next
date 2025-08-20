import { KeyboardArrowDown } from "@mui/icons-material";
import { Box, Button, Theme, useMediaQuery } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { Feed } from "@/graphql/generated";
import useFeedPresence from "@/hooks/useFeedPresence";
import { useTimestampFetcher } from "@/hooks/useTimestampFetcher";
import { colormapOptions, generateColorScale } from "@/utils/colorMaps";

import DetectionButton from "../CandidateList/DetectionButtonBeta";
import DetectionDialog from "../CandidateList/DetectionDialogBeta";
import SpectrogramCanvas from "./SpectrogramCanvas";
import WaveformCanvas from "./WaveformCanvas";

const getWaveformData = (analyser: AnalyserNode): Uint8Array | null => {
  if (!analyser) return null;

  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);
  return data;
};

const getFrequencyData = (analyser: AnalyserNode): Uint8Array | null => {
  if (!analyser) return null;

  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  return data;
};

function AudioVisualizer({
  showOscilloscope = false,
  feed,
}: {
  showOscilloscope?: boolean;
  feed?: Feed | null;
}) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const {
    analyserNodeRef,
    masterPlayerRef,
    masterPlayerStatus,
    nowPlayingFeed,
  } = useNowPlaying();

  const currentFeed = !feed ? nowPlayingFeed : feed;

  const { setPlaybarExpanded } = useLayout();

  const { timestamp } = useTimestampFetcher(
    currentFeed?.bucket,
    currentFeed?.nodeName,
  );

  const feedPresence = useFeedPresence(currentFeed?.slug);
  const listenerCount = feedPresence?.metas.length ?? 0;

  const [selectedMap, setSelectedMap] = useState("magma");
  const [selectedScale, setSelectedScale] = useState<"linear" | "log">("log");

  const colorMap = useMemo(
    () => generateColorScale(selectedMap),
    [selectedMap],
  );

  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const width = 1000;
  const heightSpectrogram = 500;
  const heightWaveform = 80;

  const isSilent = (data: Uint8Array) => data.every((val) => val === 0);

  useEffect(() => {
    const analyser = analyserNodeRef.current;
    const spectrogramCtx = spectrogramRef.current?.getContext("2d");
    const waveformCtx = waveformRef.current?.getContext("2d");
    if (!spectrogramCtx || !waveformCtx || !analyser) return;

    function drawFrequencyTicks(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.fillStyle = "#ccc";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";

      const numTicks = 5;
      for (let i = 0; i <= numTicks; i++) {
        const fraction = i / numTicks;
        const freq = fraction * 22050; // Assuming 44.1kHz sample rate

        const y =
          selectedScale === "log"
            ? heightSpectrogram -
              Math.log10(1 + 9 * fraction) * heightSpectrogram
            : heightSpectrogram - fraction * heightSpectrogram;

        ctx.fillText(`${Math.round(freq)} Hz`, 40, y);
      }

      ctx.restore();
    }

    const draw = () => {
      const freqData = getFrequencyData(analyser);
      const waveData = getWaveformData(analyser);

      const audioActive =
        freqData && waveData && !isSilent(freqData) && !isSilent(waveData);

      // const currentAudioTime = getCurrentTime ? getCurrentTime() : 0;
      // const lastAudioTime = lastAudioTimeRef.current;
      // const deltaTime = Math.max(currentAudioTime - lastAudioTime, 0.001); // prevent divide by 0
      // lastAudioTimeRef.current = currentAudioTime;

      // const pixelsPerSecond = 1 / deltaTime;

      if (!audioActive) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const freqLen = freqData.length;

      // === SPECTROGRAM ===
      const imageDataSpec = spectrogramCtx.getImageData(
        1,
        0,
        width - 1,
        heightSpectrogram,
      );
      spectrogramCtx.putImageData(imageDataSpec, 0, 0);
      spectrogramCtx.clearRect(width - 1, 0, 1, heightSpectrogram);

      // drawFrequencyTicks(spectrogramCtx);
      // drawTimeTicks(spectrogramCtx, pixelsPerSecond);

      for (let y = 0; y < heightSpectrogram; y++) {
        let index = 0;

        if (selectedScale === "log") {
          const norm = y / heightSpectrogram;
          const logIndex = (Math.pow(10, norm * 1) - 1) / 9;
          index = logIndex * (freqLen - 1);
        } else {
          const norm = y / heightSpectrogram;
          index = norm * (freqLen - 1);
        }

        const i0 = Math.floor(index);
        const i1 = Math.min(i0 + 1, freqLen - 1);
        const t = index - i0;

        const interpolated = freqData[i0] * (1 - t) + freqData[i1] * t;

        const color = colorMap[Math.round(interpolated)];
        const drawY = heightSpectrogram - 1 - y;

        spectrogramCtx.fillStyle = color;
        spectrogramCtx.fillRect(width - 1, drawY, 1, 1);
      }

      // === WAVEFORM ===
      const imageDataWave = waveformCtx.getImageData(
        1,
        0,
        width - 1,
        heightWaveform,
      );
      waveformCtx.putImageData(imageDataWave, 0, 0);
      waveformCtx.clearRect(width - 1, 0, 1, heightWaveform);

      waveformCtx.beginPath();
      for (let i = 0; i < waveData.length; i++) {
        const v = waveData[i] / 255.0;
        const y = heightWaveform - v * heightWaveform;
        const x = width - 1;
        if (i === 0) {
          waveformCtx.moveTo(x, y);
        } else {
          waveformCtx.lineTo(x, y);
        }
      }

      waveformCtx.strokeStyle = "#00f";
      waveformCtx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    colorMap,
    selectedScale,
    analyserNodeRef,
    // getCurrentTime,
  ]);

  return (
    <div
      className={`audio-visualizer ${currentFeed?.slug}`}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        maxHeight: mdDown ? "400px" : "none",
      }}
    >
      <Box
        className="live-spectrogram-controls"
        sx={{
          minHeight: "36px",
          display: "flex",
          // hiding this for now
          // display: "none",
          alignItems: "center",
          gap: "8px",
          paddingX: "8px",
          borderBottom: "1px solid rgba(255,255,255,.25)",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
            justifyContent: "flex-start",
          }}
        >
          <label>
            Color scheme:
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
            >
              {colormapOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Scale:
            <select
              value={selectedScale}
              onChange={(e) =>
                setSelectedScale(e.target.value as "linear" | "log")
              }
            >
              <option key={1} value={"linear"}>
                Linear
              </option>
              <option key={2} value={"log"}>
                Logarithmic
              </option>
            </select>
          </label>
        </div>
        {!mdDown && (
          <Button
            size="small"
            endIcon={<KeyboardArrowDown />}
            sx={{
              whiteSpace: "nowrap",
            }}
            onClick={() => {
              setPlaybarExpanded(false);
            }}
          >
            Close visualizer
          </Button>
        )}
      </Box>
      <Box className="live-visualizations">
        <canvas
          ref={waveformRef}
          width={width}
          height={heightWaveform}
          style={{ width: "100%" }}
        />
        <canvas
          ref={spectrogramRef}
          width={width}
          height={heightSpectrogram}
          style={{ width: "100%", flex: 1 }}
        />
      </Box>

      {showOscilloscope && (
        <>
          <WaveformCanvas analyser={analyserNodeRef.current} />
          <SpectrogramCanvas analyser={analyserNodeRef.current} />
        </>
      )}
      {!mdDown && (
        <div
          className="detection-button-container"
          style={{
            height: "150px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "24px",
          }}
        >
          <div
            className="detection-button"
            style={{ width: "66%", height: "35%" }}
          >
            {(masterPlayerStatus === "playing" ||
              masterPlayerStatus === "loading") &&
              currentFeed && (
                <DetectionDialog
                  isPlaying={masterPlayerStatus === "playing"}
                  feed={currentFeed}
                  timestamp={timestamp}
                  getPlayerTime={() => masterPlayerRef.current?.currentTime()}
                  listenerCount={listenerCount}
                >
                  <DetectionButton />
                </DetectionDialog>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioVisualizer;
