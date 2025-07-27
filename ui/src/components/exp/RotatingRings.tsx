// components/exp/Oscilloscope.tsx
import { useCanvas } from "./useCanvas";

function drawRotatingRings(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  analyser: AnalyserNode,
  dataArray: Uint8Array,
  tick: number,
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 4;
  const numRings = 3;

  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  for (let ring = 0; ring < numRings; ring++) {
    const angleOffset = tick * 0.002 * (ring + 1);
    const segments = 64;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + angleOffset;
      const value = dataArray[(i + ring * 10) % dataArray.length];
      const amp = value / 255;
      const r = radius + ring * 30 + amp * 20;

      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${(angle * 180) / Math.PI}, 100%, 60%)`;
      ctx.fill();
    }
  }
}

export function RotatingRings({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let tick = 0;

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawRotatingRings(ctx, width, height, analyser, dataArray, tick);
    tick++;
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
