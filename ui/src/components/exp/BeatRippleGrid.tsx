// components/exp/AudioFlowField.tsx
import { useCanvas } from "./useCanvas";
let lastBeat = 0;

function drawBeatRippleGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  analyser: AnalyserNode,
  dataArray: Uint8Array,
) {
  analyser.getByteTimeDomainData(dataArray);

  const now = Date.now();
  const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
  const normalized = avg / 128 - 1;

  const isBeat = normalized > 0.25 && now - lastBeat > 300;
  if (isBeat) lastBeat = now;

  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, width, height);

  const cols = 6;
  const rows = 4;
  const spacingX = width / (cols + 1);
  const spacingY = height / (rows + 1);

  for (let i = 1; i <= cols; i++) {
    for (let j = 1; j <= rows; j++) {
      const cx = spacingX * i;
      const cy = spacingY * j;
      const radius = isBeat ? 15 + Math.random() * 20 : 8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${100 + i * 20}, ${50 + j * 30}, 255, 0.6)`;
      ctx.fill();
    }
  }
}

export function BeatRippleGrid({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawBeatRippleGrid(ctx, width, height, analyser, dataArray);
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
