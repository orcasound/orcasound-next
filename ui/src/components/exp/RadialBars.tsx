// components/exp/Oscilloscope.tsx
import { useCanvas } from "./useCanvas";

function drawRadialBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  analyser: AnalyserNode,
  dataArray: Uint8Array,
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 5;

  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  const bars = dataArray.length;
  for (let i = 0; i < bars; i++) {
    const value = dataArray[i];
    const angle = (i / bars) * Math.PI * 2;
    const barLength = (value / 255) * (Math.min(width, height) / 3);

    const x1 = centerX + radius * Math.cos(angle);
    const y1 = centerY + radius * Math.sin(angle);
    const x2 = centerX + (radius + barLength) * Math.cos(angle);
    const y2 = centerY + (radius + barLength) * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsl(${(i / bars) * 360}, 100%, 50%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function RadialBars({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawRadialBars(ctx, width, height, analyser, dataArray);
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
