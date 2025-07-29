// components/exp/AudioVisualizer.tsx
import { useEffect, useRef } from "react";

export function ScrollingSpectrogram({
  analyser,
  scale = "log",
  colorMap = defaultColorMap,
  scrollWhenSilent = true,
}: {
  analyser: AnalyserNode;
  scale?: "linear" | "log";
  colorMap?: string[];
  scrollWhenSilent?: boolean;
}) {
  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const width = 1000;
  const heightSpectrogram = 500;
  const heightWaveform = 80;

  const isSilent = (data: Uint8Array) => data.every((val) => val === 0);

  useEffect(() => {
    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const waveData = new Uint8Array(bufferLength);

    const spectrogramCtx = spectrogramRef.current?.getContext("2d");
    const waveformCtx = waveformRef.current?.getContext("2d");
    if (!spectrogramCtx || !waveformCtx) return;

    const draw = () => {
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(waveData);

      const isFreqSilent = isSilent(freqData);
      const isWaveSilent = isSilent(waveData);
      const isAllSilent = isFreqSilent && isWaveSilent;

      // Optionally inject low noise to keep scrolling
      if (isAllSilent && scrollWhenSilent) {
        for (let i = 0; i < bufferLength; i++) {
          freqData[i] = Math.floor(Math.random() * 4); // low random noise
          waveData[i] = 127 + Math.floor(Math.random() * 4 - 2); // centered noise
        }
      }

      // === SPECTROGRAM ===
      const imageDataSpec = spectrogramCtx.getImageData(
        1,
        0,
        width - 1,
        heightSpectrogram,
      );
      spectrogramCtx.putImageData(imageDataSpec, 0, 0);
      spectrogramCtx.clearRect(width - 1, 0, 1, heightSpectrogram);

      for (let y = 0; y < heightSpectrogram; y++) {
        let index = 0;
        if (scale === "log") {
          const norm = y / heightSpectrogram;
          const logIndex = (Math.pow(10, norm * 1) - 1) / 9;
          index = logIndex * (bufferLength - 1);
        } else {
          const norm = y / heightSpectrogram;
          index = norm * (bufferLength - 1);
        }

        const i0 = Math.floor(index);
        const i1 = Math.min(i0 + 1, bufferLength - 1);
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
  }, [analyser, scale, colorMap, scrollWhenSilent]);

  return (
    <div>
      <canvas
        ref={spectrogramRef}
        width={width}
        height={heightSpectrogram}
        style={{ width: "100%", height: "90%" }}
      />
      <canvas
        ref={waveformRef}
        width={width}
        height={heightWaveform}
        style={{ width: "100%", maxHeight: "10%" }}
      />
    </div>
  );
}

const defaultColorMap: string[] = Array.from({ length: 256 }, (_, i) => {
  const alpha = 1;
  const r = i;
  const g = 0;
  const b = 255 - i;
  return `rgba(${r},${g},${b},${alpha})`;
});
