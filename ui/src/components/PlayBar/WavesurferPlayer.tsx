import { PauseCircle, PlayCircle } from "@mui/icons-material";
import { Theme, useMediaQuery } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";

type WaveformPlayerProps = {
  audioUrl: string;
};

// local, lib-agnostic types for runtime narrowing (no shims)
type RegionOptions = {
  id?: string;
  start: number;
  end: number;
  color?: string;
  drag?: boolean;
  resize?: boolean;
  content?: string; // inline label if supported
};
type Region = RegionOptions & { remove(): void };
type RegionsAPI = {
  addRegion(opts: RegionOptions): Region;
  getRegions(): Region[];
  clearRegions(): void;
  enableDragSelection(opts?: { slop?: number; color?: string } | boolean): void;
  on(evt: "region-clicked", cb: (region: Region, e: MouseEvent) => void): void;
  on(
    evt: "region-created" | "region-updated" | "region-removed",
    cb: (region: Region) => void,
  ): void;
  destroy?: () => void;
  name?: string;
};
function assertRegions(api: unknown): asserts api is RegionsAPI {
  const o = api as Record<string, unknown> | null;
  if (
    !o ||
    typeof o.addRegion !== "function" ||
    typeof o.getRegions !== "function" ||
    typeof o.clearRegions !== "function" ||
    typeof o.enableDragSelection !== "function" ||
    typeof o.on !== "function"
  ) {
    throw new Error("Regions plugin API not detected");
  }
}

export default function WavesurferPlayer({ audioUrl }: WaveformPlayerProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const spectrogramRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsAPI | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!waveformRef.current || !spectrogramRef.current || !timelineRef.current)
      return;

    if (!waveSurferRef.current) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#999",
        progressColor: "#fff",
        cursorColor: "#333",
        height: mdDown ? 40 : 80,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        url: audioUrl, // initial load only
        plugins: [
          Spectrogram.create({
            container: spectrogramRef.current,
            labels: true,
            height: mdDown ? 300 : 600,
            scale: "linear",
            fftSamples: 1024,
          }),
          Timeline.create({ container: timelineRef.current }),
        ],
      });

      // IMPORTANT: create() with NO args (matches their typings)
      const pluginInstanceUnknown = ws.registerPlugin(RegionsPlugin.create());
      assertRegions(pluginInstanceUnknown);
      const regions = (regionsRef.current = pluginInstanceUnknown);

      // Enable drag-to-create here (typed on our side, runtime supports object or boolean)
      regions.enableDragSelection({ slop: 5 });

      regions.on("region-clicked", (region, e) => {
        e.stopPropagation();
        ws.setTime(region.start);
      });

      ws.on("ready", () => {
        setIsReady(true);
        // demo region (NO `data:` key)
        const dur = ws.getDuration();
        if (dur > 0) {
          regions.addRegion({
            start: Math.max(0, dur * 0.25 - 2),
            end: Math.max(0.01, dur * 0.25 + 2),
            color: "rgba(46, 204, 113, 0.25)",
            content: "", // optional inline label if CSS supports it
          });
        }
      });
      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      ws.on("error", (err) => console.error("Wavesurfer error:", err));

      waveSurferRef.current = ws;

      return () => {
        try {
          regionsRef.current?.destroy?.();
          ws.destroy();
        } catch {
          // ignore
        }
        waveSurferRef.current = null;
        regionsRef.current = null;
        setIsReady(false);
      };
    }

    // load new url
    setIsReady(false);
    waveSurferRef.current
      ?.load(audioUrl)
      .catch((e) => console.error("Error loading new audio:", e));
  }, [audioUrl, mdDown]);

  const calculateZoomLimits = useCallback(() => {
    const ws = waveSurferRef.current;
    const el = waveformRef.current;
    if (!ws || !el) return { minZoom: 0, maxZoom: 0 };
    const duration = ws.getDuration();
    const containerPx = el.offsetWidth;
    if (duration > 0 && containerPx > 0) {
      const minZoom = containerPx / duration;
      const maxZoom = 200;
      return { minZoom, maxZoom };
    }
    return { minZoom: 0, maxZoom: 0 };
  }, []);

  useEffect(() => {
    if (isReady && waveSurferRef.current && containerWidth !== null) {
      const { minZoom } = calculateZoomLimits();
      if (minZoom > 0) setZoomLevel(minZoom);
    }
  }, [isReady, calculateZoomLimits, containerWidth]);

  useEffect(() => {
    if (waveSurferRef.current && isReady && zoomLevel > 0) {
      requestAnimationFrame(() => waveSurferRef.current?.zoom(zoomLevel));
    }
  }, [zoomLevel, isReady]);

  useEffect(() => {
    const handleResize = () => {
      if (waveformRef.current)
        setContainerWidth(waveformRef.current.offsetWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePlayPause = () => {
    const ws = waveSurferRef.current;
    if (!ws) return;
    ws.playPause();
    setIsPlaying(ws.isPlaying());
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(parseFloat(e.target.value));
  };

  const { minZoom, maxZoom } = calculateZoomLimits();

  return (
    <div>
      <div ref={timelineRef} id="timeline-container" />
      <div ref={waveformRef} id="waveform-container" />
      <div ref={spectrogramRef} id="spectrogram-container" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "16px",
          alignItems: "center",
        }}
      >
        {isPlaying ? (
          <PauseCircle
            sx={{ height: 64, width: 64, zIndex: 1, position: "relative" }}
            onClick={handlePlayPause}
          />
        ) : (
          <PlayCircle
            sx={{ height: 64, width: 64, zIndex: 1, position: "relative" }}
            onClick={handlePlayPause}
          />
        )}
        <div style={{ width: 280 }}>
          <input
            type="range"
            min={minZoom || 0}
            max={maxZoom || 100}
            step={0.5}
            value={zoomLevel || 0}
            onChange={handleZoomChange}
            disabled={!isReady}
            style={{ width: "100%" }}
          />
          <div>Zoom: {zoomLevel.toFixed(2)} px/sec</div>
          {containerWidth && zoomLevel > 0 && (
            <div>Window: {(containerWidth / zoomLevel).toFixed(2)} sec</div>
          )}
        </div>
      </div>
    </div>
  );
}
