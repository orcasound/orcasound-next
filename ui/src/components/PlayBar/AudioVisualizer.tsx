import { KeyboardArrowDown } from "@mui/icons-material";
import { Box, Button, Theme, useMediaQuery } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { Feed } from "@/graphql/generated";
import { useTimestampFetcher } from "@/hooks/useTimestampFetcher";
import { colormapOptions, generateColorScale } from "@/utils/colorMaps";

import SpectrogramCanvas from "./SpectrogramCanvas";
import WaveformCanvas from "./WaveformCanvas";

export default function AudioVisualizer({
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

  const [selectedMap, setSelectedMap] = useState("magma");
  const [selectedScale, setSelectedScale] = useState<"linear" | "log">("log");
  const colorMap = useMemo(
    () => generateColorScale(selectedMap),
    [selectedMap],
  );

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Dynamic canvas sizing (CSS px and DPR-adjusted backing store)
  const [dims, setDims] = useState<{
    widthCss: number;
    specCss: number;
    waveCss: number;
    dpr: number;
  }>({ widthCss: 0, specCss: 0, waveCss: 0, dpr: 1 });

  // Fixed waveform height (in CSS px); spectrogram fills the rest
  const WAVEFORM_CSS = 80;

  // Keep canvases sized to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const widthCss = Math.max(1, Math.floor(rect.width));
      const totalHeightCss = Math.max(1, Math.floor(rect.height));
      const waveCss = WAVEFORM_CSS;
      const specCss = Math.max(1, totalHeightCss - waveCss);
      setDims({ widthCss, specCss, waveCss, dpr });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Apply sizes to canvases (attributes and CSS)
  useEffect(() => {
    const spec = spectrogramRef.current;
    const wave = waveformRef.current;
    if (!spec || !wave) return;

    const { widthCss, specCss, waveCss, dpr } = dims;
    if (widthCss === 0 || specCss === 0 || waveCss === 0) return;

    // Spectrogram canvas
    spec.width = Math.max(1, Math.floor(widthCss * dpr));
    spec.height = Math.max(1, Math.floor(specCss * dpr));
    spec.style.width = `${widthCss}px`;
    spec.style.height = `${specCss}px`;

    // Waveform canvas
    wave.width = Math.max(1, Math.floor(widthCss * dpr));
    wave.height = Math.max(1, Math.floor(waveCss * dpr));
    wave.style.width = `${widthCss}px`;
    wave.style.height = `${waveCss}px`;
  }, [dims]);

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

  const isSilent = (data: Uint8Array) => data.every((val) => val === 0);

  // Draw loop
  useEffect(() => {
    const analyser = analyserNodeRef.current;
    const specCanvas = spectrogramRef.current;
    const waveCanvas = waveformRef.current;
    if (!analyser || !specCanvas || !waveCanvas) return;

    const specCtx = specCanvas.getContext("2d");
    const waveCtx = waveCanvas.getContext("2d");
    if (!specCtx || !waveCtx) return;

    const draw = () => {
      const width = specCanvas.width; // device pixels
      const heightSpectrogram = specCanvas.height; // device pixels
      const heightWaveform = waveCanvas.height; // device pixels
      if (width < 2 || heightSpectrogram < 2 || heightWaveform < 2) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const freqData = getFrequencyData(analyser);
      const waveData = getWaveformData(analyser);

      const audioActive =
        !!freqData && !!waveData && !isSilent(freqData) && !isSilent(waveData);

      if (!audioActive || !freqData || !waveData) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const freqLen = freqData.length;

      // === SPECTROGRAM === (scroll left by copying prior pixels)
      const imageDataSpec = specCtx.getImageData(
        1,
        0,
        width - 1,
        heightSpectrogram,
      );
      specCtx.putImageData(imageDataSpec, 0, 0);
      specCtx.clearRect(width - 1, 0, 1, heightSpectrogram);

      for (let y = 0; y < heightSpectrogram; y++) {
        let index = 0;
        if (selectedScale === "log") {
          const norm = y / heightSpectrogram;
          const logIndex = (Math.pow(10, norm) - 1) / 9; // ~log mapping
          index = logIndex * (freqLen - 1);
        } else {
          const norm = y / heightSpectrogram;
          index = norm * (freqLen - 1);
        }

        const i0 = Math.floor(index);
        const i1 = Math.min(i0 + 1, freqLen - 1);
        const t = index - i0;
        const interpolated = freqData[i0] * (1 - t) + freqData[i1] * t;

        const color =
          colorMap[Math.max(0, Math.min(255, Math.round(interpolated)))];
        const drawY = heightSpectrogram - 1 - y;

        specCtx.fillStyle = color;
        specCtx.fillRect(width - 1, drawY, 1, 1);
      }

      // === WAVEFORM === (scroll left)
      const imageDataWave = waveCtx.getImageData(
        1,
        0,
        width - 1,
        heightWaveform,
      );
      waveCtx.putImageData(imageDataWave, 0, 0);
      waveCtx.clearRect(width - 1, 0, 1, heightWaveform);

      waveCtx.beginPath();
      for (let i = 0; i < waveData.length; i++) {
        const v = waveData[i] / 255.0;
        const y = heightWaveform - v * heightWaveform;
        const x = width - 1;
        if (i === 0) waveCtx.moveTo(x, y);
        else waveCtx.lineTo(x, y);
      }
      waveCtx.strokeStyle = "#00f";
      waveCtx.lineWidth = 1;
      waveCtx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [colorMap, selectedScale, analyserNodeRef, dims]);

  return (
    <div
      className={`audio-visualizer ${currentFeed?.slug}`}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0, // allow children to flex properly
      }}
    >
      <Box
        className="live-spectrogram-controls"
        sx={{
          minHeight: "36px",
          display: mdDown ? "none" : "flex",
          alignItems: "center",
          gap: "8px",
          px: "8px",
          borderBottom: "1px solid rgba(255,255,255,.25)",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "16px", width: "100%" }}>
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
              <option value="linear">Linear</option>
              <option value="log">Logarithmic</option>
            </select>
          </label>
        </div>

        {!mdDown && (
          <Button
            size="small"
            endIcon={<KeyboardArrowDown />}
            sx={{ whiteSpace: "nowrap" }}
            onClick={() => setPlaybarExpanded(false)}
          >
            Close visualizer
          </Button>
        )}
      </Box>

      {/* Canvases container must flex and have minHeight:0 */}
      <Box
        ref={containerRef}
        className="live-visualizations"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <canvas ref={waveformRef} />
        <canvas ref={spectrogramRef} style={{ flex: 1 }} />
      </Box>

      {showOscilloscope && (
        <>
          <WaveformCanvas analyser={analyserNodeRef.current} />
          <SpectrogramCanvas analyser={analyserNodeRef.current} />
        </>
      )}
    </div>
  );
}
