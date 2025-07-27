// components/exp/BurstParticles.tsx
import { useRef } from "react";

import { useCanvas } from "./useCanvas";

export function BurstParticles({ analyser }: { analyser: AnalyserNode }) {
  const particles = useRef(
    Array.from({ length: 100 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      angle: Math.random() * 2 * Math.PI,
      speed: 0,
    })),
  );

  const canvasRef = useCanvas((ctx, width, height) => {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, width, height);

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    const volume =
      data.reduce((sum, v) => sum + Math.abs(v - 128), 0) / data.length;

    for (const p of particles.current) {
      if (volume > 20) {
        p.speed = Math.random() * 4 + 2;
      }
      p.x += Math.cos(p.angle) * p.speed * 0.1;
      p.y += Math.sin(p.angle) * p.speed * 0.1;
      p.speed *= 0.95;

      const drawX = width / 2 + (p.x * width) / 3;
      const drawY = height / 2 + (p.y * height) / 3;

      ctx.beginPath();
      ctx.arc(drawX, drawY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${volume * 3}, 100%, 60%)`;
      ctx.fill();
    }
  });

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
