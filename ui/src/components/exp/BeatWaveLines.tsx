// components/exp/AudioFlowField.tsx
import { useCanvas } from "./useCanvas";

function drawBeatWaveLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  analyser: AnalyserNode,
  dataArray: Uint8Array,
) {
  analyser.getByteFrequencyData(dataArray);

  const energy = dataArray.slice(0, 40).reduce((a, b) => a + b, 0);
  const beat = energy / 40;

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, width, height);

  const barCount = 10;
  const spacing = width / barCount;

  for (let i = 0; i < barCount; i++) {
    const x = i * spacing + spacing / 4;
    const barHeight = (beat / 255) * height;
    ctx.fillStyle = `hsl(${(i / barCount) * 360}, 100%, 50%)`;
    ctx.fillRect(x, height - barHeight, spacing / 2, barHeight);
  }
}

export function BeatWaveLines({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawBeatWaveLines(ctx, width, height, analyser, dataArray);
  };

  const canvasRef = useCanvas(wrappedDraw);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        objectFit: "fill",
      }}
    />
  );
}
