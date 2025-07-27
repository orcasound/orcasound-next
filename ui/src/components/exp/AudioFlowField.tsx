// components/exp/AudioFlowField.tsx
import { useCanvas } from "./useCanvas";

function drawAudioFlowField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  analyser: AnalyserNode,
) {
  // 1. Clear canvas
  // 1. Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 2. Get audio data
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  // 3. Draw using ctx and data
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    const x = (i / data.length) * width;
    const y = height - (val / 255) * height;
    ctx.fillStyle = `hsl(${(val / 255) * 360}, 100%, 60%)`;
    ctx.fillRect(x, y, 2, 2);
  }
}

export function AudioFlowField({ analyser }: { analyser: AnalyserNode }) {
  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawAudioFlowField(ctx, width, height, analyser);
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
