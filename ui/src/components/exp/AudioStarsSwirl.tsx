// components/exp/AudioFlowField.tsx
import { useCanvas } from "./useCanvas";

const stars: { x: number; y: number; angle: number; radius: number }[] = [];

function drawAudioStarsSwirl(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
) {
  if (stars.length < 300) {
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.min(width, height) * 0.5;
      stars.push({ x: width / 2, y: height / 2, angle, radius });
    }
  }

  const midFreq = dataArray[64];
  const swirlSpeed = 0.002 + midFreq / 80000;

  ctx.fillStyle = "rgba(0, 0, 10, 0.1)";
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    star.angle += swirlSpeed;
    const sx = width / 2 + Math.cos(star.angle) * star.radius;
    const sy = height / 2 + Math.sin(star.angle) * star.radius;

    ctx.beginPath();
    ctx.arc(sx, sy, 1, 0, 2 * Math.PI);
    ctx.fillStyle = `hsl(${midFreq + star.radius * 0.1}, 100%, 80%)`;
    ctx.fill();
  }
}

export function AudioStarsSwirl({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const wrappedDraw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    drawAudioStarsSwirl(ctx, width, height, dataArray);
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
