// components/exp/AudioFlowField.tsx
import { useCanvas } from "./useCanvas";

function drawBeatPulseCircle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  analyser: AnalyserNode,
  dataArray: Uint8Array,
) {
  analyser.getByteTimeDomainData(dataArray);

  const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
  const normalized = avg / 128 - 1;

  const isBeat = normalized > 0.2;

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(
    width / 2,
    height / 2,
    isBeat ? 80 + Math.random() * 40 : 40,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = isBeat ? "rgba(255, 80, 80, 0.7)" : "rgba(100,100,255,0.3)";
  ctx.fill();
}

export function BeatPulseCircle({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawBeatPulseCircle(ctx, width, height, analyser, dataArray);
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
