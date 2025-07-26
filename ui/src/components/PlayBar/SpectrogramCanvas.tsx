import { useEffect, useRef } from "react";

interface SpectrogramCanvasProps {
  analyser: AnalyserNode | null;
  barColor?: string;
  backgroundColor?: string;
}

const SpectrogramCanvas: React.FC<SpectrogramCanvasProps> = ({
  analyser,
  barColor = "#00ffff",
  backgroundColor = "black",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / bufferLength;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * height;

        ctx.fillStyle = barColor;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current!);
    };
  }, [analyser, barColor, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={50}
      style={{ width: "100%", height: "50px" }}
    />
  );
};

export default SpectrogramCanvas;
