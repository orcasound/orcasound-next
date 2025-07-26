import { useEffect, useRef } from "react";

function AudioVisualizer({
  getFrequencyData,
  getWaveformData,
  getCurrentTime,
  colorMap,
  scale = "linear",
}: {
  getFrequencyData: () => Uint8Array | null;
  getWaveformData: () => Uint8Array | null;
  getCurrentTime: () => number;
  colorMap: string[]; // 256-element array of rgba strings
  scale: "linear" | "log";
}) {
  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastAudioTimeRef = useRef<number>(getCurrentTime());

  const width = 1000;
  const heightSpectrogram = 500;
  const heightWaveform = 80;

  const isSilent = (data: Uint8Array) => data.every((val) => val === 0);

  useEffect(() => {
    const spectrogramCtx = spectrogramRef.current?.getContext("2d");
    const waveformCtx = waveformRef.current?.getContext("2d");
    if (!spectrogramCtx || !waveformCtx) return;

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
          scale === "log"
            ? heightSpectrogram -
              Math.log10(1 + 9 * fraction) * heightSpectrogram
            : heightSpectrogram - fraction * heightSpectrogram;

        ctx.fillText(`${Math.round(freq)} Hz`, 40, y);
      }

      ctx.restore();
    }

    function drawTimeTicks(
      ctx: CanvasRenderingContext2D,
      pixelsPerSecond: number,
    ) {
      ctx.save();
      ctx.fillStyle = "#ccc";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";

      const durationSeconds = width / pixelsPerSecond;
      const numTicks = Math.floor(durationSeconds * 2); // tick every 0.5s
      for (let i = 0; i <= numTicks; i++) {
        const x = width - i * pixelsPerSecond * 0.5;
        if (x < 0) break;
        ctx.fillText(`${(i * 0.5).toFixed(1)}s`, x, heightSpectrogram - 5);
      }

      ctx.restore();
    }

    const draw = () => {
      const freqData = getFrequencyData();
      const waveData = getWaveformData();

      const audioActive =
        freqData && waveData && !isSilent(freqData) && !isSilent(waveData);

      const currentAudioTime = getCurrentTime();
      const lastAudioTime = lastAudioTimeRef.current;
      const deltaTime = Math.max(currentAudioTime - lastAudioTime, 0.001); // prevent divide by 0
      lastAudioTimeRef.current = currentAudioTime;

      const pixelsPerSecond = 1 / deltaTime;

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

      drawFrequencyTicks(spectrogramCtx);
      drawTimeTicks(spectrogramCtx, pixelsPerSecond);

      for (let y = 0; y < heightSpectrogram; y++) {
        let index = 0;

        if (scale === "log") {
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
  }, [getFrequencyData, getWaveformData, colorMap, scale, getCurrentTime]);

  return (
    <div>
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
        style={{ width: "100%", maxHeight: "400px" }}
      />
    </div>
  );
}

export default AudioVisualizer;
