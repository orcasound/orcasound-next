import type { FFmpeg as FFmpegType } from "@ffmpeg/ffmpeg";
import { useCallback, useEffect, useRef, useState } from "react";

type FileEntry = {
  name: string;
  data: File | Blob | string;
};

export function useFfmpeg() {
  const ffmpegRef = useRef<InstanceType<typeof FFmpegType> | null>(null);
  const [isReady, setIsReady] = useState(false);

  const load = useCallback(async () => {
    if (ffmpegRef.current) return;
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    ffmpegRef.current = ffmpeg;
    setIsReady(true);
  }, []);

  const clearFiles = useCallback(async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;

    try {
      const files = await ffmpeg.listDir?.("/");
      if (!files) return;

      for (const file of files) {
        if (file.name !== "." && file.name !== "..") {
          try {
            await ffmpeg.deleteFile?.(file.name);
          } catch {
            // Ignore errors if file does not exist or cannot be deleted
          }
        }
      }
    } catch (err) {
      console.warn("Failed to list FFmpeg FS:", err);
    }
  }, []);

  const convertMultipleToMp3 = useCallback(
    async (files: FileEntry[]): Promise<Blob> => {
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("FFmpeg not loaded");

      await clearFiles();

      for (const file of files) {
        await ffmpeg.writeFile(file.name, await fetchFile(file.data));
      }

      const listContent = files.map((file) => `file '${file.name}'`).join("\n");
      await ffmpeg.writeFile("list.txt", listContent);

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
      await ffmpeg.exec(["-i", "temp.ts", "-b:a", "192k", "output.mp3"]);

      const data = await ffmpeg.readFile("output.mp3");
      return new Blob([data], { type: "audio/mpeg" });
    },
    [clearFiles],
  );

  const terminate = useCallback(async () => {
    if (ffmpegRef.current) {
      await ffmpegRef.current.terminate();
      ffmpegRef.current = null;
      setIsReady(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      void terminate();
    };
  }, [load, terminate]);

  const cancelCurrentJob = useCallback(async () => {
    if (ffmpegRef.current) {
      console.log("Cancelling ffmpeg job by terminating instance...");
      await ffmpegRef.current.terminate();
      ffmpegRef.current = null;
      setIsReady(false);
      await load(); // reload the instance
    }
  }, [load]);

  return { isReady, convertMultipleToMp3, clearFiles, cancelCurrentJob };
}
