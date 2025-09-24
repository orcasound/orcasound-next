// WavesurferPlayer.tsx — make UNSAVED selector draw on top of saved regions.
// Keeps detection ticks, safe zoom, fixed-width selector, and saved-region hover (when not overlapped).

import { PauseCircle, PlayCircle } from "@mui/icons-material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";

import { CombinedData } from "@/types/DataTypes";

export type Annotation = {
  id: string;
  start: number;
  end: number;
  text: string;
};

type WaveformPlayerProps = {
  audioUrl: string;
  startTimestamp?: string;
  desiredHeightPx?: number;
  regionWidthSec?: number;
  detections?: CombinedData[] | null;
  annotations: Annotation[];
  unsavedColor?: string;
  savedColor?: string;
  onUnsavedRegionChange?: (range: { start: number; end: number }) => void;
};

type RegionOptions = {
  id?: string;
  start: number;
  end: number;
  color?: string;
  drag?: boolean;
  resize?: boolean;
  content?: string;
};
type Region = RegionOptions & {
  id?: string;
  element?: HTMLElement;
  remove(): void;
  setOptions?: (opts: Partial<RegionOptions>) => void;
};
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

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

const UNSAVED_ID = "unsaved-30s";
const savedId = (id: string) => `saved-${id}`;

// Layering: UNSAVED selector above SAVED regions
const Z_UNSAVED = 40;
const Z_SAVED = 20;

// ---- Safe zoom helpers ----
type WSIntrospect = {
  getDecodedData?: () => unknown;
  isDestroyed?: () => boolean;
};
function hasAudioBuffer(ws: WaveSurfer): boolean {
  const w = ws as unknown as WSIntrospect;
  if (typeof w.isDestroyed === "function" && w.isDestroyed()) return false;
  if (typeof w.getDecodedData === "function") return !!w.getDecodedData();
  const dur = ws.getDuration();
  return Number.isFinite(dur) && dur > 0;
}
function zoomIfReady(ws: WaveSurfer, pxPerSec: number): void {
  if (!Number.isFinite(pxPerSec) || pxPerSec <= 0) return;
  if (!hasAudioBuffer(ws)) return;
  try {
    ws.zoom(pxPerSec);
  } catch {
    /* ignore */
  }
}

export default function WavesurferPlayer({
  audioUrl,
  startTimestamp,
  desiredHeightPx = 320,
  regionWidthSec = 30,
  detections = null,
  annotations,
  unsavedColor = "rgba(255, 193, 7, 0.35)",
  savedColor = "rgba(0,0,0, 0.35)",
  onUnsavedRegionChange,
}: WaveformPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const spectrogramRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const spectroPluginRef = useRef<ReturnType<typeof Spectrogram.create> | null>(
    null,
  );

  const wsRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsAPI | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [normZoom, setNormZoom] = useState(0);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });
  const [wrapperWidth, setWrapperWidth] = useState(0);

  const selectorWidthRef = useRef<number>(regionWidthSec);
  useEffect(() => {
    selectorWidthRef.current = regionWidthSec;
  }, [regionWidthSec]);

  const onUnsavedRef = useRef<typeof onUnsavedRegionChange>();
  useEffect(() => {
    onUnsavedRef.current = onUnsavedRegionChange;
  }, [onUnsavedRegionChange]);

  const timelineH = 28;
  const controlsH = 88;
  const waveH = Math.round(Math.max(36, Math.min(96, desiredHeightPx * 0.12)));
  const tickH = 14;

  // The whole spectrogram row includes the tick bar within it
  const specH = Math.max(
    80 + tickH, // ensure room for both the image + ticks
    desiredHeightPx - (timelineH + waveH + controlsH),
  );

  useEffect(() => {
    if (!waveformRef.current || !spectrogramRef.current || !timelineRef.current)
      return;

    const spectro = Spectrogram.create({
      container: spectrogramRef.current!,
      labels: true,
      height: Math.max(80, specH),
      scale: "linear",
      fftSamples: 1024,
    });

    spectroPluginRef.current = spectro;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#999",
      progressColor: "#fff",
      cursorColor: "#fff",
      height: waveH,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      url: audioUrl,
      plugins: [spectro, Timeline.create({ container: timelineRef.current })],
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    assertRegions(regions);
    regionsRef.current = regions;

    regions.enableDragSelection(false);

    ws.on("ready", () => {
      setIsReady(true);
      const dur = ws.getDuration();
      const w = wrapperRef.current?.offsetWidth ?? 0;
      if (dur > 0 && w > 10) {
        const min = w / dur;
        const max = 200;
        setBounds({ min, max });
        setNormZoom(0);
        zoomIfReady(ws, min);
      }
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));

    // Ensure correct layering whenever a region is created
    regions.on("region-created", (region) => {
      if (!region.element) return;
      if (region.id === UNSAVED_ID) {
        region.element.style.zIndex = String(Z_UNSAVED);
      } else if (region.id && region.id.startsWith("saved-")) {
        region.element.style.zIndex = String(Z_SAVED);
      }
    });

    // Keep width fixed and layering on update for UNSAVED
    regions.on("region-updated", (region) => {
      if (region.id !== UNSAVED_ID) return;
      const dur = ws.getDuration();
      const EPS = 0.003;
      let start = region.start;
      let end = region.end;
      const width = selectorWidthRef.current;

      if (Math.abs(end - start - width) > EPS) end = start + width;
      if (end > dur) {
        end = dur;
        start = Math.max(0, end - width);
      }
      if (start < 0) {
        start = 0;
        end = Math.min(dur, width);
      }

      region.setOptions?.({ start, end, drag: true, resize: false });

      if (region.element) region.element.style.zIndex = String(Z_UNSAVED);

      onUnsavedRef.current?.({ start, end });
    });

    wsRef.current = ws;
    return () => {
      try {
        regionsRef.current?.destroy?.();
        ws.destroy();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
      regionsRef.current = null;
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  useEffect(() => {
    const ws = wsRef.current;
    const sp = spectroPluginRef.current;
    if (!ws || !isReady) return;

    // 2a) Waveform height stays tied to waveH
    (
      ws as unknown as { setOptions?: (o: { height?: number }) => void }
    )?.setOptions?.({ height: waveH });

    // 2b) Spectrogram plugin canvas height = spec row minus ticks
    const innerSpecH = Math.max(80, specH - tickH);
    (
      sp as unknown as { setOptions?: (o: { height?: number }) => void }
    )?.setOptions?.({ height: innerSpecH });

    // 2c) Nudge a redraw safely
    const dur = ws.getDuration();
    if (dur > 0) ws.zoom((ws.getWrapper().scrollWidth || 1) / dur);
  }, [isReady, waveH, specH, tickH]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => setWrapperWidth(el.offsetWidth || 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || !isReady) return;
    const dur = ws.getDuration();
    if (!dur || wrapperWidth <= 10) return;
    const min = wrapperWidth / dur;
    const max = 200;
    setBounds({ min, max });
    zoomIfReady(ws, min + normZoom * (max - min));
  }, [wrapperWidth, isReady, normZoom]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || !isReady) return;
    const { min, max } = bounds;
    if (min <= 0 || max <= 0) return;
    zoomIfReady(ws, min + normZoom * (max - min));
  }, [normZoom, isReady, bounds, bounds.min, bounds.max]);

  // Ensure single draggable UNSAVED region (and keep it above saved)
  useEffect(() => {
    const ws = wsRef.current;
    const regions = regionsRef.current;
    if (!ws || !regions || !isReady) return;

    let unsaved = regions.getRegions().find((r) => r.id === UNSAVED_ID);
    const dur = ws.getDuration();
    if (!unsaved) {
      const end = Math.min(dur, regionWidthSec);
      unsaved = regions.addRegion({
        id: UNSAVED_ID,
        start: 0,
        end,
        color: unsavedColor,
        drag: true,
        resize: false,
      });
      if (unsaved.element) unsaved.element.style.zIndex = String(Z_UNSAVED);
      onUnsavedRef.current?.({ start: 0, end });
    } else {
      unsaved.setOptions?.({ color: unsavedColor, drag: true, resize: false });
      if (unsaved.element) unsaved.element.style.zIndex = String(Z_UNSAVED);
      onUnsavedRef.current?.({ start: unsaved.start, end: unsaved.end });
    }
  }, [isReady, regionWidthSec, unsavedColor]);

  // Render saved annotations as immovable (below UNSAVED)
  useEffect(() => {
    const ws = wsRef.current;
    const regions = regionsRef.current;
    if (!ws || !regions || !isReady) return;

    regions.getRegions().forEach((r) => {
      if (r.id && r.id.startsWith("saved-")) r.remove();
    });

    const dur = ws.getDuration();
    annotations.forEach((a) => {
      const start = clamp(a.start, 0, Math.max(0.01, dur - 0.01));
      const end = clamp(a.end, start + 0.01, dur);
      const reg = regions.addRegion({
        id: savedId(a.id),
        start,
        end,
        color: savedColor,
        drag: false,
        resize: false,
        content: a.text || "",
      });
      if (reg.element) {
        reg.element.style.zIndex = String(Z_SAVED);
        reg.element.setAttribute("title", a.text || "");
      }
    });
  }, [annotations, savedColor, isReady]);

  // ---- Detection ticks + hover tooltip (unchanged) ----
  type Tick = { sec: number; label: string };

  function detectionToSeconds(d: CombinedData, startMs: number): number | null {
    const o = d as unknown as Record<string, unknown>;
    const n1 = o["timeSec"];
    if (typeof n1 === "number" && Number.isFinite(n1) && n1 >= 0) return n1;
    const n2 = o["t"];
    if (typeof n2 === "number" && Number.isFinite(n2) && n2 >= 0) return n2;
    const ts = o["timestamp"];
    if (ts instanceof Date) {
      const s = (ts.getTime() - startMs) / 1000;
      return Number.isFinite(s) && s >= 0 ? s : null;
    }
    if (typeof ts === "string") {
      const t = Date.parse(ts);
      if (Number.isFinite(t)) {
        const s = (t - startMs) / 1000;
        return Number.isFinite(s) && s >= 0 ? s : null;
      }
    }
    const timeStr = o["time"] ?? o["ts"];
    if (typeof timeStr === "string") {
      const t = Date.parse(timeStr);
      if (Number.isFinite(t)) {
        const s = (t - startMs) / 1000;
        return Number.isFinite(s) && s >= 0 ? s : null;
      }
    }
    return null;
  }

  function detectionLabel(d: CombinedData): string {
    const o = d as unknown as Record<string, unknown>;
    const commentLike =
      o["comments"] ??
      o["comment"] ??
      o["notes"] ??
      o["label"] ??
      o["description"];
    if (typeof commentLike === "string" && commentLike.trim().length > 0) {
      return commentLike.trim();
    }
    const ts =
      o["timestamp"] ??
      o["time"] ??
      o["ts"] ??
      (typeof o["timeSec"] === "number" ? `${o["timeSec"]}s` : undefined);
    return typeof ts === "string" ? ts : "";
  }

  const detectionTicks: Tick[] = useMemo(() => {
    if (!detections || detections.length === 0) return [];
    if (!startTimestamp) return [];
    const startMs = Date.parse(startTimestamp);
    if (!Number.isFinite(startMs)) return [];
    const ticks: Tick[] = [];
    for (const d of detections) {
      const s = detectionToSeconds(d, startMs);
      if (s !== null) ticks.push({ sec: s, label: detectionLabel(d) });
    }
    return ticks.sort((a, b) => a.sec - b.sec);
  }, [detections, startTimestamp]);

  const [hoverTick, setHoverTick] = useState<{
    leftPct: number;
    label: string;
  } | null>(null);

  const { min, max } = bounds;
  const sliderDisabled = !isReady || min <= 0 || max <= 0;
  const pxPerSec = min + normZoom * (max - min);
  const secondsInWindow = pxPerSec > 0 ? (wrapperWidth || 0) / pxPerSec : 0;

  const togglePlay = () => {
    const ws = wsRef.current;
    if (!ws) return;
    ws.playPause();
    setIsPlaying(ws.isPlaying());
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: `${desiredHeightPx}px`,
        display: "grid",
        gridTemplateRows: `${timelineH}px ${waveH}px ${specH}px ${controlsH}px`,
        gridTemplateColumns: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        contain: "layout paint",
      }}
    >
      {/* Timeline */}
      <div ref={timelineRef} style={{ gridRow: "1", height: "100%" }} />

      {/* Waveform */}
      <div ref={waveformRef} style={{ gridRow: "2", height: "100%" }} />

      {/* Spectrogram row (includes ticks) */}
      <div
        style={{
          gridRow: "3",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          lineHeight: 0, // avoid baseline gap
        }}
      >
        {/* Spectrogram host: shortened by tickH so ticks can sit flush */}
        <div
          ref={spectrogramRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: `${tickH}px`, // <— leaves exactly tickH for tick bar
            display: "block",
            lineHeight: 0, // avoid baseline gap
          }}
        />

        {/* Tick bar overlay, flush with the bottom */}
        {isReady && detectionTicks.length > 0 && wsRef.current && (
          <>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: `${tickH}px`,
                height: `${tickH}px`,
                zIndex: 5,
                pointerEvents: "auto",
              }}
              onMouseLeave={() => setHoverTick(null)}
            >
              {detectionTicks.map((tick, i) => {
                const dur = wsRef.current!.getDuration() || 1;
                const pct = clamp((tick.sec / dur) * 100, 0, 100);
                return (
                  <div
                    key={`${i}-${tick.sec.toFixed(3)}`}
                    onMouseEnter={() =>
                      setHoverTick({
                        leftPct: pct,
                        label: tick.label || `${tick.sec.toFixed(2)}s`,
                      })
                    }
                    style={{
                      position: "absolute",
                      left: `${pct}%`,
                      bottom: 0,
                      width: 2,
                      height: Math.max(0, tickH - 2),
                      background: "rgba(255,255,255,0.95)",
                      transform: "translateX(-1px)",
                      borderRadius: 1,
                      cursor: "default",
                    }}
                    title=""
                  />
                );
              })}
            </div>

            {hoverTick && (
              <div
                style={{
                  position: "absolute",
                  left: `${hoverTick.leftPct}%`,
                  bottom: tickH + 2, // pop just above the ticks
                  transform: "translateX(-50%)",
                  maxWidth: 260,
                  zIndex: 6,
                  background: "rgba(0,0,0,0.8)",
                  color: "#fff",
                  padding: "6px 8px",
                  fontSize: 12,
                  lineHeight: 1.3,
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.15)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {hoverTick.label}
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          gridRow: "4",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: 12,
          boxSizing: "border-box",
        }}
      >
        {isPlaying ? (
          <PauseCircle sx={{ height: 48, width: 48 }} onClick={togglePlay} />
        ) : (
          <PlayCircle sx={{ height: 48, width: 48 }} onClick={togglePlay} />
        )}

        <div style={{ width: "100%", maxWidth: 520 }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.002}
            value={normZoom}
            onChange={(e) =>
              setNormZoom(Math.max(0, Math.min(1, Number(e.target.value))))
            }
            disabled={sliderDisabled}
            style={{ width: "100%" }}
          />
          {!sliderDisabled && wrapperWidth > 0 && (
            <div style={{ marginLeft: 4, fontSize: 12, opacity: 0.8 }}>
              <div>Zoom: {pxPerSec.toFixed(2)} px/sec</div>
              <div>Window: {secondsInWindow.toFixed(2)} sec</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
