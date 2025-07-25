import { useEffect, useMemo, useState } from "react";

import { useFeedStreams } from "@/hooks/beta/useFeedStreams";
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
  const { isReady, convertMultipleToMp3, clearFiles, cancelCurrentJob } =
    useFfmpeg();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDurationMs, setTotalDurationMs] = useState<string | null>(null);

  const { data: segmentsData } = useFeedSegments({
    feedId,
    startTime,
    endTime,
  });

  console.log("feedSegments length", segmentsData?.feedSegments.results.length);

  const firstTimestamp = useMemo(() => {
    const tsList =
      segmentsData?.feedSegments?.results
        ?.map((seg) => seg.playlistTimestamp)
        .filter((ts): ts is string => !!ts) ?? [];
    return tsList.length > 0 ? tsList[0] : null;
  }, [segmentsData]);

  const {
    data: streamData,
    isFetched,
    isLoading,
  } = useFeedStreams({
    feedId,
    playlistTimestamp: firstTimestamp ?? "",
    enabled: !!firstTimestamp,
  });

  const stream = streamData?.feedStreams?.results?.[0] ?? null;

  const allLoaded = isFetched && !isLoading;

  console.log("isReady", isReady);
  console.log("stream", stream);
  console.log("allLoaded", allLoaded);
  console.log("feedId", feedId);
  console.log("startTime", startTime);
  console.log("endTime", endTime);

  useEffect(() => {
    if (!segmentsData?.feedSegments?.results?.length) {
      console.log("No segments found — clearing audioBlob");
      setAudioBlob(null);
      setTotalDurationMs(null);
      setError("No segments available for this time range.");
      setIsProcessing(false);
      return;
    }

    if (
      !isReady ||
      !stream ||
      !allLoaded ||
      !feedId ||
      !startTime ||
      !endTime
    ) {
      console.log("useConcatenatedAudio skipped — missing deps");
      return;
    }

    console.log("useConcatenatedAudio running with single stream");

    const abortController = new AbortController();
    let cancelled = false;

    const fetchAndConcat = async () => {
      setIsProcessing(true);
      setError(null);
      setAudioBlob(null);

      try {
        await clearFiles();

        const segments: Segment[] = [];

        if (stream?.playlistM3u8Path && stream.bucket && stream.bucketRegion) {
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
            // no-op
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
    stream,
    startTime,
    endTime,
    convertMultipleToMp3,
    clearFiles,
    allLoaded,
    feedId,
    segmentsData?.feedSegments?.results?.length,
  ]);

  const streamEndTime =
    stream && stream.endTime ? new Date(stream.endTime) : new Date();

  useEffect(() => {
    cancelCurrentJob();
  }, [startTime, cancelCurrentJob]);

  return {
    audioBlob,
    isProcessing,
    error,
    totalDurationMs,
    droppedSeconds:
      new Date(endTime) > streamEndTime
        ? Math.round(
            (new Date(endTime).getTime() - new Date(streamEndTime).getTime()) /
              1000,
          )
        : 0,
  };
}
