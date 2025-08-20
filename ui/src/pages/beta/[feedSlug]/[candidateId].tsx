import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { CandidateDrawer } from "@/components/layouts/HalfMapLayout/CandidateDrawer";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { useComputedPlaybackFields } from "@/hooks/beta/useComputedPlaybackFields";
import useConcatenatedAudio from "@/hooks/beta/useConcatenatedAudio";

function CandidatePage() {
  return null;
}

const CandidateLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { feeds, sortedCandidates, filteredData, autoPlayOnReady } = useData();
  const { setPlaybarExpanded, setDrawerContent } = useLayout();
  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();

  useEffect(() => {
    setDrawerContent(<CandidateDrawer candidate={candidate} />);
  }, [setDrawerContent]);

  const { candidateId, feedSlug } = router.query;

  const feed = feeds.find((f) => f.slug === feedSlug) ?? undefined;
  const feedId = useMemo(() => {
    return feeds.find((f) => f.slug === feedSlug)?.id ?? "";
  }, [feeds, feedSlug]);
  const candidate = sortedCandidates.find((c) => c.id === candidateId) ?? null;
  const startEnd = useMemo(() => {
    return typeof candidateId === "string" ? candidateId?.split("_") : [];
  }, [candidateId]);
  const startTimeString = startEnd[0];
  const endTimeString = startEnd[startEnd.length - 1];
  const startTimeMs = new Date(startEnd[0]).getTime();
  const endTimeMs = new Date(startEnd[startEnd.length - 1]).getTime();

  const { durationString } = useComputedPlaybackFields(candidate);

  // const [detections, setDetections] = useState<DetectionsProps>({
  //   all: [],
  //   human: [],
  //   ai: [],
  //   sightings: [],
  //   hydrophone: "",
  //   startTime: "",
  // });

  const [candidateIdState, setCandidateIdState] = useState<
    string | string[] | undefined
  >(undefined);

  const previousCandidateIdRef = useRef<string | string[] | undefined>();

  // necessary to ensure the next useEffect runs
  useEffect(() => {
    setCandidateIdState(candidateId);
  }, [candidateId, setCandidateIdState]);

  // Playbar open/close logic on route change
  useEffect(() => {
    // Don't do anything if there's no candidateId
    if (!candidateIdState) return;

    // Skip if same as previous
    if (previousCandidateIdRef.current === candidateIdState) return;

    // Save new value
    previousCandidateIdRef.current = candidateIdState;

    // Collapse then expand playbar
    setPlaybarExpanded(false);
    const timeout = setTimeout(() => {
      setPlaybarExpanded(true);
    }, 700);

    return () => clearTimeout(timeout);
  }, [candidateIdState, setPlaybarExpanded]);

  // Now Playing logic
  useEffect(() => {
    setNowPlayingCandidate(candidate);
    setNowPlayingFeed(null);
  }, [candidate, setNowPlayingCandidate, setNowPlayingFeed]);

  // // Detections lookup
  // useEffect(() => {
  //   const arr: CombinedData[] = [];
  //   filteredData.forEach((d) => {
  //     const time = new Date(d.timestamp.toString()).getTime();
  //     if (time >= startTimeMs && time <= endTimeMs && d.feedId === feed?.id) {
  //       arr.push(d);
  //     }
  //   });
  //   const sortedArr = arr.sort(
  //     (a, b) =>
  //       Date.parse(a.timestamp.toString()) - Date.parse(b.timestamp.toString()),
  //   );

  //   setDetections({
  //     all: sortedArr,
  //     human: sortedArr.filter((d) => d.type === "human"),
  //     ai: sortedArr.filter((d) => d.type === "ai"),
  //     sightings: sortedArr.filter((d) => d.type === "sightings"),
  //     hydrophone: sortedArr[0]?.hydrophone,
  //     startTime: new Date(startTimeString).toLocaleString(),
  //   });
  // }, [filteredData, feed?.id, startTimeMs, endTimeMs, startTimeString]);

  const {
    audioBlob,
    spectrogramUrl,
    isProcessing,
    error,
    totalDurationMs,
    droppedSeconds,
  } = useConcatenatedAudio({
    feedId,
    startTime: startTimeString,
    endTime: endTimeString,
  });

  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    setAudioUrl(undefined);
  }, [router.asPath]);

  useEffect(() => {
    if (!startTimeString || !endTimeString) return;

    let url: string | null = null;

    if (audioBlob) {
      url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } else {
      setAudioUrl(undefined);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [audioBlob, startTimeString, endTimeString]);

  return <HalfMapLayout>{children}</HalfMapLayout>;
};

CandidatePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MasterDataLayout>
      <CandidateLayout>{page}</CandidateLayout>
    </MasterDataLayout>
  );
};

export default CandidatePage;
