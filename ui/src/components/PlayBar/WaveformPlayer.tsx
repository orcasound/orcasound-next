import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";

type WaveformPlayerProps = {
  audioUrl: string;
};

export default function WaveformPlayer({ audioUrl }: WaveformPlayerProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const spectrogramRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const initialZoomLevel = 100;
  const [zoomLevel, setZoomLevel] = useState(initialZoomLevel); // Default pixelsPerSecond

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
      waveSurfer.zoom(initialZoomLevel);
      setIsPlaying(false);

      const waveformScrollDiv = document
        .querySelector("#waveform div")
        ?.shadowRoot?.querySelector(".scroll");

      if (waveformScrollDiv) {
        waveformScrollDiv.addEventListener("scroll", () => {
          const scrollX = waveformScrollDiv.scrollLeft;
          const tickContainer = document.querySelector(
            "#timeline div[part='timeline']",
          ) as HTMLElement | null;

          if (tickContainer) {
            tickContainer.style.overflow = "visible";
            tickContainer.style.transform = `translateX(${-scrollX}px)`;
          } else {
            console.warn("tickContainer not found during scroll");
          }
        });
      }
    });
    waveSurfer.on("finish", () => setIsPlaying(false));

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
      setIsPlaying((prev) => !prev);
    }
  };

  const zoomIn = () => {
    const newZoom = zoomLevel + 50;
    waveSurferRef.current?.zoom(newZoom);
    setZoomLevel(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(0, zoomLevel - 50);
    waveSurferRef.current?.zoom(newZoom);
    setZoomLevel(newZoom);
  };

  return (
    <div className="waveform-player" style={{ width: "100%" }}>
      <div ref={timelineRef} id="timeline" />
      <div ref={spectrogramRef} id="spectrogram" />
      <div ref={waveformRef} id="waveform" />
      <button
        onClick={togglePlay}
        style={{
          marginTop: "12px",
          padding: "8px 12px",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button
        onClick={zoomIn}
        style={{
          marginTop: "12px",
          marginLeft: "8px",
          padding: "8px 12px",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Zoom In
      </button>
      <button
        onClick={zoomOut}
        style={{
          marginTop: "12px",
          marginLeft: "8px",
          padding: "8px 12px",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Zoom Out
      </button>
    </div>
  );
}
