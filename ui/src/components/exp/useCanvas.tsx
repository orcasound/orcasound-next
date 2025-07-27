// hooks/useCanvas.ts
import { useEffect, useRef } from "react";

type DrawCallback = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void;

export function useCanvas(draw: DrawCallback) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      draw(ctx, width, height); // use layout-resolved values
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [draw]);

  return canvasRef;
}
