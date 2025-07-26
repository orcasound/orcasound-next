import React, { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";

type WaveformPlayerProps = {
  audioUrl: string;
};

export default function WaveformPlayer({ audioUrl }: WaveformPlayerProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [zoomLevel, setZoomLevel] = useState<number>(0); // pixels per second

  const [baseZoom, setBaseZoom] = useState<number>(0); // fully zoomed out
  const [maxZoom, setMaxZoom] = useState<number>(0); // fully zoomed in
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const lastSecondsInWindowRef = useRef<number | null>(null);

  const spectrogramRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const calculateZoomLimits = useCallback(() => {
    const duration = waveSurferRef.current?.getDuration() ?? 0;
    if (duration > 0) {
      const minZoom = duration; // fully zoomed out = all seconds visible
      const maxZoom = 1; // fully zoomed in = 1 second visible
      setBaseZoom(minZoom);
      setMaxZoom(maxZoom);
      return { minZoom, maxZoom };
    }
    return { minZoom: 0, maxZoom: 0 };
  }, []);

  useEffect(() => {
    if (
      !audioUrl ||
      !waveformRef.current ||
      !spectrogramRef.current ||
      !timelineRef.current
    )
      return;

    waveSurferRef.current?.destroy();

    const waveSurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#999",
      progressColor: "#fff",
      cursorColor: "#333",
      height: 80,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      url: audioUrl,
      plugins: [
        Spectrogram.create({
          container: spectrogramRef.current,
          labels: true,
          height: 400,
          scale: "linear",
          fftSamples: 1024,
        }),
        Timeline.create({
          container: timelineRef.current,
        }),
      ],
    });

    waveSurferRef.current = waveSurfer;

    waveSurfer.on("ready", () => {
      setIsReady(true);
      setIsPlaying(false);
      const { minZoom, maxZoom } = calculateZoomLimits();
      setZoomLevel(minZoom); // start fully zoomed out
      waveSurfer.zoom(minZoom);
      if (containerRef.current) {
        const containerW = containerRef.current.offsetWidth;
        setContainerWidth(containerW);
        const seconds = containerW / minZoom;
        lastSecondsInWindowRef.current = seconds;
      }

      // timeline scroll sync
      const waveformScrollDiv = document
        .querySelector("#waveform div")
        ?.shadowRoot?.querySelector(".scroll") as HTMLDivElement;

      if (waveformScrollDiv) {
        containerRef.current = waveformScrollDiv;
        waveformScrollDiv.addEventListener("scroll", () => {
          const scrollX = waveformScrollDiv.scrollLeft;
          const tickContainer = document.querySelector(
            "#timeline div[part='timeline']",
          ) as HTMLElement | null;

          if (tickContainer) {
            tickContainer.style.overflow = "visible";
            tickContainer.style.transform = `translateX(${-scrollX}px)`;
          }
        });
      }
    });

    waveSurfer.on("finish", () => setIsPlaying(false));

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
      setIsReady(false);
    };
  }, [audioUrl, calculateZoomLimits]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const { minZoom, maxZoom } = calculateZoomLimits();
      setBaseZoom(minZoom);
      setMaxZoom(maxZoom);

      if (containerRef.current && lastSecondsInWindowRef.current) {
        const containerW = containerRef.current.offsetWidth;
        const newZoom = containerW / lastSecondsInWindowRef.current;
        const clampedZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
        setZoomLevel(clampedZoom);
        waveSurferRef.current?.zoom(clampedZoom);
        setContainerWidth(containerW);
      }
    });

    if (waveformRef.current && isReady) {
      observer.observe(waveformRef.current);
    }

    return () => observer.disconnect();
  }, [calculateZoomLimits, isReady]);

  // update containerWidth
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (waveSurferRef.current && isReady && zoomLevel > 0) {
      requestAnimationFrame(() => {
        waveSurferRef.current?.zoom(zoomLevel);
      });
    }
  }, [zoomLevel, isReady]);

  const togglePlay = () => {
    waveSurferRef.current?.playPause();
    setIsPlaying((prev) => !prev);
  };

  const setZoomPercent = (percent: number) => {
    const secondsInWindow = baseZoom - percent * (baseZoom - maxZoom); // e.g. 160 → 1
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newZoom = containerWidth / secondsInWindow; // pixels per second
      setZoomLevel(newZoom);
      lastSecondsInWindowRef.current = secondsInWindow;
    }
  };

  const zoomPercent =
    maxZoom < baseZoom && zoomLevel > 0 && containerRef.current
      ? (baseZoom - containerRef.current.offsetWidth / zoomLevel) /
        (baseZoom - maxZoom)
      : 0;

  return (
    <div className="waveform-player" style={{ width: "100%" }}>
      <div ref={timelineRef} id="timeline" />
      <div ref={spectrogramRef} id="spectrogram" />
      <div ref={waveformRef} id="waveform" />

      <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>

      <label style={{ marginTop: "12px", display: "block" }}>
        Zoom: {zoomLevel.toFixed(2)} px/sec
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={zoomPercent}
          onChange={(e) => {
            const percent = parseFloat(e.target.value);
            setZoomPercent(percent);
          }}
          style={{ width: "100%", marginTop: "4px" }}
          disabled={!isReady}
        />
      </label>

      <div>Current zoom: {zoomLevel.toFixed(2)} px/sec</div>

      {containerWidth && zoomLevel > 0 && (
        <div>
          Seconds in window: {(containerWidth / zoomLevel).toFixed(2)} sec
        </div>
      )}
      <div>Fully zoomed out (base): {baseZoom.toFixed(0)} sec</div>
      <div>Fully zoomed in (max): {maxZoom.toFixed(0)} sec</div>
    </div>
  );
}
