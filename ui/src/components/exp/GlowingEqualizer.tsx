// components/exp/Oscilloscope.tsx
import { useCanvas } from "./useCanvas";

function drawGlowingEqualizer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  analyser: AnalyserNode,
  dataArray: Uint8Array,
) {
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, width, height);

  const barWidth = width / dataArray.length;

  for (let i = 0; i < dataArray.length; i++) {
    const value = dataArray[i];
    const barHeight = (value / 255) * height;
    const x = i * barWidth;

    const hue = (i / dataArray.length) * 360;
    const color = `hsl(${hue}, 100%, 60%)`;

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
  }

  // reset shadow
  ctx.shadowBlur = 0;
}

export function GlowingEqualizer({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawGlowingEqualizer(ctx, width, height, analyser, dataArray);
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
