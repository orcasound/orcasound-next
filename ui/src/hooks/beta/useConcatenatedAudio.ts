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
  const { isReady, convertMultipleToMp3 } = useFfmpeg();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
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

  const streamsResults = useFeedStreamsMultiple(feedId, playlistTimestamps);

  const allStreams = useMemo(() => {
    return streamsResults.map((q) => q.data?.feedStreams.results ?? []).flat();
  }, [streamsResults]);

  useEffect(() => {
    if (!isReady || allStreams.length === 0 || hasFetched) return;

    async function fetchAndConcat() {
      setIsProcessing(true);
      setError(null);

      const segments: Segment[] = [];

      try {
        for (const stream of allStreams) {
          if (
            !stream?.playlistM3u8Path ||
            !stream.bucket ||
            !stream.bucketRegion
          )
            continue;

          const m3u8Url = `https://${stream.bucket}.s3.${stream.bucketRegion}.amazonaws.com${stream.playlistM3u8Path}`;
          const res = await fetch(m3u8Url);
          const text = await res.text();
          const lines = text.split("\n");
          let cumulativeTime = new Date(stream.startTime ?? "").getTime();

          for (let i = 0; i < lines.length; i++) {
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

        const fetchedFiles = await Promise.all(
          segments.map(async (seg) => {
            try {
              const res = await fetch(seg.url);
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

        const validFiles = fetchedFiles.filter(Boolean) as {
          name: string;
          data: Blob;
        }[];

        if (validFiles.length === 0) {
          setError("No valid audio segments found.");
          return;
        }

        try {
          const output = await convertMultipleToMp3(validFiles);
          setAudioBlob(output);
          setError(null); // clear error on success
        } catch (err) {
          console.error("FFmpeg conversion failed:", err);
          setError("Failed to process audio.");
        }

        setTotalDurationMs(
          formatDuration(calculateSegmentsDurationMs(segments)),
        );
      } finally {
        setIsProcessing(false);
        setHasFetched(true);
      }
    }

    void fetchAndConcat();
  }, [
    isReady,
    allStreams,
    startTime,
    endTime,
    convertMultipleToMp3,
    hasFetched,
  ]);

  return {
    audioBlob,
    isProcessing,
    error,
    totalDurationMs,
  };
}
