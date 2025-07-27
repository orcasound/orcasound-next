// components/exp/Oscilloscope.tsx
import { useCanvas } from "./useCanvas";

export function Spectroscope({ analyser }: { analyser: AnalyserNode }) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const canvasRef = useCanvas((ctx, width, height) => {
    const barColor = "#00ffff";
    const backgroundColor = "black";

    analyser.getByteFrequencyData(dataArray);
    const barWidth = width / bufferLength;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i];
      const barHeight = (value / 255) * height;

      ctx.fillStyle = barColor;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
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
