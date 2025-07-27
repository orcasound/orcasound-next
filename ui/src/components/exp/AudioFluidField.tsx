// components/exp/AudioFlowField.tsx
import { useCanvas } from "./useCanvas";

const rows = 60;
const cols = 100;

let phase = 0;

function drawFluidField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
) {
  ctx.fillStyle = "rgba(10, 10, 20, 0.2)";
  ctx.fillRect(0, 0, width, height);

  const spacingX = width / cols;
  const spacingY = height / rows;

  const lowFreqAvg = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;

  phase += 0.01 + lowFreqAvg / 30000;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const angle = (i + j) * 0.1 + phase;
      const amp = (dataArray[(i + j) % dataArray.length] / 255) * 15;
      const x = i * spacingX;
      const y = j * spacingY + Math.sin(angle) * amp;

      ctx.beginPath();
      ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
      ctx.fillStyle = `hsla(${angle * 30}, 100%, 60%, 0.6)`;
      ctx.fill();
    }
  }
}

export function AudioFluidField({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawFluidField(ctx, width, height, dataArray);
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
