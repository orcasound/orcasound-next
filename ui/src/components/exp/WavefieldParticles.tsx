// components/exp/WavefieldParticles.tsx
import { useRef } from "react";

import { useCanvas } from "./useCanvas";

export function WavefieldParticles({ analyser }: { analyser: AnalyserNode }) {
  const particles = useRef(
    Array.from({ length: 150 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: 0,
      vy: 0,
    })),
  );

  const canvasRef = useCanvas((ctx, width, height) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, width, height);

    const waveform = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(waveform);

    for (const p of particles.current) {
      const index = Math.floor((p.x * waveform.length) % waveform.length);
      const force = (waveform[index] - 128) / 128;

      p.vx += Math.sin(p.y * 20) * force * 0.002;
      p.vy += Math.cos(p.x * 20) * force * 0.002;

      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) {
        p.x = Math.random();
        p.y = Math.random();
        p.vx = p.vy = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 2, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(0, 255, 255, 0.6)`;
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
