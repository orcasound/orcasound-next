import { useEffect, useRef, useState } from "react";

function AudioAnalyzerFromFile({ file }: { file: File }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const ctx = new AudioContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // ✅ Clear canvas
    ctx.clearRect(0, 0, width, height);

    // 🎧 Waveform
    drawWaveform(ctx, audioBuffer, width, height / 2);

    // 🌈 Spectrogram
    drawSpectrogram(ctx, audioBuffer, width, height / 2, height / 2);
  }, [audioBuffer]);

  return <canvas ref={canvasRef} width={1200} height={600} />;
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  buffer: AudioBuffer,
  width: number,
  height: number,
) {
  const channel = buffer.getChannelData(0);
  const samplesPerPixel = Math.floor(channel.length / width);

  ctx.beginPath();
  ctx.moveTo(0, height / 2);

  for (let x = 0; x < width; x++) {
    const start = x * samplesPerPixel;
    const end = start + samplesPerPixel;
    let min = 1,
      max = -1;
    for (let i = start; i < end && i < channel.length; i++) {
      const v = channel[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    ctx.lineTo(x, ((1 - max) * height) / 2);
    ctx.lineTo(x, ((1 - min) * height) / 2);
  }

  ctx.strokeStyle = "#888";
  ctx.stroke();
}

function drawSpectrogram(
  ctx: CanvasRenderingContext2D,
  buffer: AudioBuffer,
  width: number,
  height: number,
  offsetY: number,
) {
  const fftSize = 1024;
  const step = fftSize / 2;
  const sampleRate = buffer.sampleRate;
  const channel = buffer.getChannelData(0);

  const analyser = new AnalyserNode(new AudioContext(), {
    fftSize,
    smoothingTimeConstant: 0,
  });

  const canvasData = ctx.createImageData(width, height);
  const pixelsPerFrame = Math.floor(channel.length / step / width);

  for (let x = 0; x < width; x++) {
    const slice = channel.slice(
      x * step * pixelsPerFrame,
      (x + 1) * step * pixelsPerFrame,
    );
    const fftBuffer = new Float32Array(fftSize);
    fftBuffer.set(slice.slice(0, fftSize));

    // Perform FFT here (using a library like `fft.js` or `dsp.js`)
    // const magnitudes = performFFT(fftBuffer); // [0...fftSize/2]

    //   for (let y = 0; y < height; y++) {
    //     const bin = Math.floor((y / height) * (fftSize / 2));
    //     const mag = magnitudes[bin];
    //     const color = viridisColormap(mag);
    //     const index = (y * width + x) * 4;
    //     canvasData.data[index + 0] = color[0];
    //     canvasData.data[index + 1] = color[1];
    //     canvasData.data[index + 2] = color[2];
    //     canvasData.data[index + 3] = 255;
    //   }
    // }

    // ctx.putImageData(canvasData, 0, offsetY);
  }
}
