import { useEffect, useMemo, useState } from "react";

import { useFeedStreamsMultiple } from "@/hooks/beta/useFeedStreams";
import { useFfmpeg } from "@/hooks/beta/useFfmpeg";

import { useFeedSegments } from "./useFeedSegments";

type Props = {
  feedId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
};

type Segment = {
  name: string;
  url: string;
  duration: number;
  startTimeMs: number;
};

function calculateSegmentsDurationMs(segments: { duration: number }[]): number {
  return segments.reduce((total, seg) => total + seg.duration * 1000, 0);
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function useConcatenatedAudio({
  feedId,
  startTime,
  endTime,
}: Props) {
  const { isReady, convertMultipleToMp3, clearFiles } = useFfmpeg();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDurationMs, setTotalDurationMs] = useState<string | null>(null);

  const { data: segmentsData } = useFeedSegments({
    feedId,
    startTime,
    endTime,
  });

  const playlistTimestamps = useMemo(() => {
    if (!segmentsData?.feedSegments?.results) return [];
    const timestamps = segmentsData.feedSegments.results
      .map((seg) => seg.playlistTimestamp)
      .filter((ts): ts is string => !!ts);
    return [...new Set(timestamps)];
  }, [segmentsData]);

  const streams = useFeedStreamsMultiple(feedId, playlistTimestamps);

  const allLoaded = streams.every((r) => r.isFetched && !r.isLoading);

  const allStreams = useMemo(() => {
    const flattened = streams.flatMap((q) => q.data?.feedStreams.results ?? []);

    const filtered = flattened.filter(
      (s): s is typeof s & { playlistTimestamp: string } =>
        !!s.playlistTimestamp,
    );

    const sorted = filtered.sort(
      (a, b) =>
        new Date(a.playlistTimestamp).getTime() -
        new Date(b.playlistTimestamp).getTime(),
    );

    return sorted;
  }, [streams]);

  console.log("isReady", isReady);
  console.log("allStreams.length", allStreams.length);
  useEffect(() => {
    console.log("allStreams changed", allStreams);
  }, [allStreams]);
  useEffect(() => {
    console.log("playlistTimestamps identity changed");
  }, [playlistTimestamps]);

  console.log("playlistTimestamps", playlistTimestamps);
  console.log("feedId", feedId);
  console.log("results");
  console.log("startTime", startTime);
  console.log("endTime", endTime);
  console.log("allLoaded", allLoaded);

  useEffect(() => {
    if (
      !isReady ||
      allStreams.length === 0 ||
      !allLoaded ||
      !feedId ||
      !startTime ||
      !endTime
    ) {
      console.log("useConcatenatedAudio skipped -- missing params");

      return;
    }
    console.log("useConcatenatedAudio running fetchAndConcat");

    const abortController = new AbortController();
    let cancelled = false;

    const fetchAndConcat = async () => {
      setIsProcessing(true);
      setError(null);
      setAudioBlob(null);

      try {
        await clearFiles();

        const segments: Segment[] = [];

        for (const stream of allStreams) {
          if (
            !stream?.playlistM3u8Path ||
            !stream.bucket ||
            !stream.bucketRegion
          )
            continue;

          const m3u8Url = `https://${stream.bucket}.s3.${stream.bucketRegion}.amazonaws.com${stream.playlistM3u8Path}`;
          const res = await fetch(m3u8Url, { signal: abortController.signal });
          const text = await res.text();
          const lines = text.split("\n");
          let cumulativeTime = new Date(stream.startTime ?? "").getTime();

          for (let i = 0; i < lines.length; i++) {
            if (cancelled) return;
            const line = lines[i].trim();
            if (line.startsWith("#EXTINF:")) {
              const duration = parseFloat(
                line.replace("#EXTINF:", "").replace(",", ""),
              );
              const nextLine = lines[i + 1]?.trim();
              if (nextLine && !nextLine.startsWith("#")) {
                const segmentStart = cumulativeTime;
                const segmentEnd = cumulativeTime + duration * 1000;
                const startMs = new Date(startTime).getTime();
                const endMs = new Date(endTime).getTime();

                if (segmentEnd >= startMs && segmentStart < endMs) {
                  const baseUrl = m3u8Url.substring(
                    0,
                    m3u8Url.lastIndexOf("/") + 1,
                  );
                  segments.push({
                    name: `${stream.playlistTimestamp}-${i}.ts`,
                    url: `${baseUrl}${nextLine}`,
                    duration,
                    startTimeMs: segmentStart,
                  });
                }

                cumulativeTime += duration * 1000;
              }
            }
          }
        }

        if (cancelled) return;

        const fetchedFiles = await Promise.all(
          segments.map(async (seg) => {
            if (cancelled) return null;
            try {
              const res = await fetch(seg.url, {
                signal: abortController.signal,
              });
              const arrayBuffer = await res.arrayBuffer();
              return {
                name: seg.name,
                data: new Blob([arrayBuffer], { type: "video/mp2t" }),
              };
            } catch (err) {
              console.warn(`Failed to fetch segment ${seg.name}:`, err);
              return null;
            }
          }),
        );

        if (cancelled) return;

        const validFiles = fetchedFiles.filter(
          (file): file is { name: string; data: Blob } => file !== null,
        );

        if (validFiles.length === 0) {
          setError("No valid audio segments found.");
          return;
        }

        const output = await convertMultipleToMp3(validFiles);
        if (!cancelled) {
          setAudioBlob(output);
          setTotalDurationMs(
            formatDuration(calculateSegmentsDurationMs(segments)),
          );
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof DOMException && err.name === "AbortError") {
            // Fetch aborted, no-op
          } else {
            console.error("Unexpected error:", err);
            setError("Failed to fetch or process audio segments.");
          }
        }
      } finally {
        if (!cancelled) setIsProcessing(false);
      }
    };

    void fetchAndConcat();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [
    isReady,
    allStreams,
    startTime,
    endTime,
    convertMultipleToMp3,
    clearFiles,
    allLoaded,
    feedId,
  ]);

  return {
    audioBlob,
    isProcessing,
    error,
    totalDurationMs,
  };
}
