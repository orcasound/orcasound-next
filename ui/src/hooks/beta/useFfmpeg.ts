import type { FFmpeg as FFmpegType } from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";

type ProgressHandler = (progress: { ratio: number }) => void;
type LogHandler = (message: string) => void;

type FileEntry = {
  name: string;
  data: File | Blob | string; // Removed Uint8Array
};

export function useFfmpeg() {
  const ffmpegRef = useRef<InstanceType<typeof FFmpegType> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFFmpeg() {
    if (ffmpegRef.current) return;
    try {
      setIsLoading(true);
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      ffmpegRef.current = ffmpeg;
      setIsReady(true);
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setError("Failed to load FFmpeg");
    } finally {
      setIsLoading(false);
    }
  }

  async function convertToMp3(
    inputFile: File | Blob,
    onProgress?: ProgressHandler,
    onLog?: LogHandler,
  ): Promise<Blob> {
    if (!ffmpegRef.current) throw new Error("FFmpeg not loaded yet");

    const { fetchFile } = await import("@ffmpeg/util");
    const ffmpeg = ffmpegRef.current;
    const inputName = "input.ts";
    const outputName = "output.mp3";

    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

    ffmpeg.on("log", ({ message }: { message: string }) => {
      onLog?.(message);
    });

    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      onProgress?.({ ratio: progress });
    });

    await ffmpeg.exec(["-i", inputName, "-b:a", "192k", outputName]);

    const data = await ffmpeg.readFile(outputName);
    return new Blob([data], { type: "audio/mpeg" });
  }

  async function convertMultipleToMp3(
    files: FileEntry[],
    onProgress?: ProgressHandler,
    onLog?: LogHandler,
  ): Promise<Blob> {
    if (!ffmpegRef.current) throw new Error("FFmpeg not loaded yet");

    const { fetchFile } = await import("@ffmpeg/util");
    const ffmpeg = ffmpegRef.current;

    // Write each input file to FS
    for (const file of files) {
      await ffmpeg.writeFile(file.name, await fetchFile(file.data));
    }

    // Create concat list file
    const listContent = files.map((file) => `file '${file.name}'`).join("\n");
    await ffmpeg.writeFile("list.txt", listContent);

    ffmpeg.on("log", ({ message }: { message: string }) => {
      onLog?.(message);
    });

    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      onProgress?.({ ratio: progress });
    });

    const outputName = "output.mp3";
    await ffmpeg.exec([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "list.txt",
      "-c",
      "copy",
      "temp.ts",
    ]);

    await ffmpeg.exec(["-i", "temp.ts", "-b:a", "192k", outputName]);

    const data = await ffmpeg.readFile(outputName);
    return new Blob([data], { type: "audio/mpeg" });
  }

  async function terminate() {
    if (ffmpegRef.current) {
      await ffmpegRef.current.terminate();
      ffmpegRef.current = null;
      setIsReady(false);
    }
  }

  useEffect(() => {
    loadFFmpeg();
    return () => {
      void terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isReady,
    isLoading,
    error,
    convertToMp3,
    convertMultipleToMp3,
    terminate,
  };
}
