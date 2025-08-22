import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import { CandidateDrawer } from "@/components/layouts/HalfMapLayout/CandidateDrawer";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";

function CandidatePage() {
  return null;
}

const CandidateLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { sortedCandidates } = useData();
  const { setPlaybarExpanded, setDrawerContent } = useLayout();
  const { setNowPlayingCandidate, setNowPlayingFeed } = useNowPlaying();

  const { candidateId } = router.query;

  const candidate = sortedCandidates.find((c) => c.id === candidateId) ?? null;

  useEffect(() => {
    setDrawerContent(<CandidateDrawer candidate={candidate} />);
  }, [setDrawerContent, candidate]);

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
