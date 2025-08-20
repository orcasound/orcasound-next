import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { CandidateDrawer } from "@/components/layouts/HalfMapLayout/CandidateDrawer";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { useComputedPlaybackFields } from "@/hooks/beta/useComputedPlaybackFields";

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
