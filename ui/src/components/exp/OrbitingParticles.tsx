// components/exp/OrbitingParticles.tsx
import { useRef } from "react";

import { useCanvas } from "./useCanvas";

export function OrbitingParticles({ analyser }: { analyser: AnalyserNode }) {
  const angles = useRef(
    Array.from({ length: 100 }, () => Math.random() * 2 * Math.PI),
  );

  const canvasRef = useCanvas((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);

    const freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);

    const avg = freq.slice(0, 64).reduce((a, b) => a + b, 0) / 64;

    angles.current = angles.current.map((a) => a + 0.01);

    angles.current.forEach((a, i) => {
      const radius = (avg / 256) * width * 0.4 + i * 0.3;
      const x = width / 2 + Math.cos(a) * radius;
      const y = height / 2 + Math.sin(a) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${i * 3 + avg}, 80%, 70%)`;
      ctx.fill();
    });
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
