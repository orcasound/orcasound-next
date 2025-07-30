import { PauseCircle, PlayCircle } from "@mui/icons-material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";

type WaveformPlayerProps = {
  audioUrl: string;
};

export default function WavesurferPlayer({ audioUrl }: WaveformPlayerProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  // containerRef seems unused, consider removing if not needed
  // const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [zoomLevel, setZoomLevel] = useState<number>(0); // pixels per second

  // These should probably be derived from duration and container width,
  // not separately stateful unless you have specific reasons.
  // const [baseZoom, setBaseZoom] = useState<number>(0); // fully zoomed out
  // const [maxZoom, setMaxZoom] = useState<number>(0); // fully zoomed in
  const [containerWidth, setContainerWidth] = useState<number | null>(null); // To calculate dynamic zoom limits

  const lastSecondsInWindowRef = useRef<number | null>(null);

  const spectrogramRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Effect for initializing WaveSurfer and plugins
  useEffect(() => {
    if (
      !waveformRef.current ||
      !spectrogramRef.current ||
      !timelineRef.current
    ) {
      console.log("Missing refs for Wavesurfer initialization. Skipping.");
      return;
    }

    if (!waveSurferRef.current) {
      const ws = WaveSurfer.create({
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
            height: 600,
            scale: "linear",
            fftSamples: 1024,
          }),
          Timeline.create({
            container: timelineRef.current,
          }),
        ],
      });
      waveSurferRef.current = ws;

      ws.on("error", (err) => {
        console.error("Wavesurfer error:", err);
      });

      // Crucial: Set isReady only when Wavesurfer confirms it's ready.
      ws.on("ready", (duration) => {
        console.log("Wavesurfer 'ready' event fired!");
        setIsReady(true);
        // Optionally, if `deferInit` was used for Spectrogram, initialize it here
        // ws.initPlugin('spectrogram');
      });

      console.log("Loading audio:", audioUrl);
      ws.load(audioUrl).catch((error) => {
        console.error("Error loading audio in Wavesurfer:", error);
      });

      // Cleanup function
      return () => {
        console.log("Destroying WaveSurfer instance...");
        ws.destroy();
        waveSurferRef.current = null;
        setIsReady(false);
      };
    } else {
      // If instance exists, and audioUrl changes, load new audio
      console.log("WaveSurfer instance exists, loading new audio:", audioUrl);
      setIsReady(false); // Reset ready state when loading new audio
      waveSurferRef.current.load(audioUrl).catch((error) => {
        console.error("Error loading new audio:", error);
      });
    }
  }, [audioUrl]); // Re-run effect if audioUrl changes

  // Callback to calculate zoom limits (memoized)
  const calculateZoomLimits = useCallback(() => {
    if (!waveSurferRef.current) return { minZoom: 0, maxZoom: 0 };

    const duration = waveSurferRef.current.getDuration();
    if (duration > 0 && waveformRef.current) {
      const containerPx = waveformRef.current.offsetWidth;
      // Define your zoom levels: e.g., base is 'whole audio fits container', max is '1 second per X pixels'
      const minZoom = containerPx / duration; // Pixels per second for fully zoomed out
      const maxZoom = 200; // Example: 200 pixels per second as max zoom in
      // You can adjust these based on your UX needs.
      return { minZoom, maxZoom };
    }
    return { minZoom: 0, maxZoom: 0 };
  }, [isReady, containerWidth]); // Recalculate if containerWidth or ready state changes

  // Effect to set initial zoom level and calculate limits
  useEffect(() => {
    if (isReady && waveSurferRef.current && containerWidth !== null) {
      // Ensure duration is available before calculating limits
      const duration = waveSurferRef.current.getDuration();
      if (duration > 0) {
        const { minZoom, maxZoom } = calculateZoomLimits();
        // Set initial zoom to fully zoomed out or a sensible default
        setZoomLevel(minZoom);
        console.log(`Initial zoom set to minZoom: ${minZoom}`);
      }
    }
  }, [isReady, calculateZoomLimits, containerWidth]); // Depend on isReady and calculated limits

  // Effect for applying zoom level changes
  useEffect(() => {
    // Only apply zoom if Wavesurfer is ready and zoomLevel is valid
    if (waveSurferRef.current && isReady && zoomLevel > 0) {
      console.log(`Applying zoom: ${zoomLevel}`);
      // Use requestAnimationFrame for smoother updates if zoomLevel changes frequently
      requestAnimationFrame(() => {
        waveSurferRef.current?.zoom(zoomLevel);
      });
    }
  }, [zoomLevel, isReady]); // Depend on zoomLevel and isReady

  // Effect to get container width for responsive scaling (optional)
  useEffect(() => {
    const handleResize = () => {
      if (waveformRef.current) {
        setContainerWidth(waveformRef.current.offsetWidth);
      }
    };
    if (waveformRef.current) {
      setContainerWidth(waveformRef.current.offsetWidth);
      window.addEventListener("resize", handleResize);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePlayPause = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
      setIsPlaying(waveSurferRef.current.isPlaying());
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoomLevel(newZoom);
  };

  const playIcon = (
    <PlayCircle
      sx={{ height: 64, width: 64, zIndex: 1, position: "relative" }}
      onClick={handlePlayPause}
    />
  );

  const pauseIcon = (
    <PauseCircle
      sx={{ height: 64, width: 64, zIndex: 1, position: "relative" }}
      onClick={handlePlayPause}
    />
  );

  return (
    <div>
      <div ref={timelineRef} id="timeline-container"></div>
      <div ref={waveformRef} id="waveform-container"></div>
      <div ref={spectrogramRef} id="spectrogram-container"></div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "16px",
        }}
      >
        {" "}
        {isPlaying ? pauseIcon : playIcon}
        <div style={{ width: "200px" }}>
          <input
            type="range"
            min={calculateZoomLimits().minZoom || 0} // Ensure min value is available
            max={calculateZoomLimits().maxZoom || 100} // Ensure max value is available
            value={zoomLevel}
            onChange={handleZoomChange}
            disabled={!isReady}
          />
          <div>Zoom Level: {zoomLevel.toFixed(2)} px/sec</div>
          {containerWidth && zoomLevel > 0 && (
            <div>
              Seconds in window: {(containerWidth / zoomLevel).toFixed(2)} sec
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
