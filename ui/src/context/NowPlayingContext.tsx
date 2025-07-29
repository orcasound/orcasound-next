import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { VideoJSPlayer } from "@/components/Player/VideoJS";
import { Feed } from "@/graphql/generated";
import { Candidate } from "@/types/DataTypes";

interface NowPlayingContextType {
  nowPlayingCandidate: Candidate | null;
  setNowPlayingCandidate: React.Dispatch<
    React.SetStateAction<Candidate | null>
  >;
  nowPlayingFeed: Feed | null;
  setNowPlayingFeed: React.Dispatch<React.SetStateAction<Feed | null>>;
  masterPlayerRef: React.MutableRefObject<VideoJSPlayer | null>;
  masterPlayerStatus: string;
  setMasterPlayerStatus: React.Dispatch<React.SetStateAction<string>>;
  analyserNodeRef: React.MutableRefObject<AnalyserNode | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  queue?: Candidate[];
  setQueue?: React.Dispatch<React.SetStateAction<Candidate[]>>;
  onPlayerEnd?: () => void;
}

const NowPlayingContext = createContext<NowPlayingContextType | undefined>(
  undefined,
);

export const NowPlayingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [nowPlayingCandidate, setNowPlayingCandidate] =
    useState<Candidate | null>(null);
  const [nowPlayingFeed, setNowPlayingFeed] = useState<Feed | null>(null);

  const [masterPlayerStatus, setMasterPlayerStatus] = useState("empty");
  const masterPlayerRef = useRef<VideoJSPlayer | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const [queue, setQueue] = useState<Candidate[]>([]);
  const onPlayerEndRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (nowPlayingCandidate) {
      onPlayerEndRef.current = () => {
        const currentIndex = queue.findIndex(
          (candidate) => candidate.id === nowPlayingCandidate.id,
        );
        const nextIndex = currentIndex + 1;
        if (queue[nextIndex]) {
          setNowPlayingCandidate(queue[nextIndex]);
        }
      };
    } else {
      onPlayerEndRef.current = undefined;
    }
  }, [queue, nowPlayingCandidate, setNowPlayingCandidate, nowPlayingFeed]);

  const onPlayerEnd = useCallback(() => {
    onPlayerEndRef.current?.();
  }, []);

  return (
    <NowPlayingContext.Provider
      value={{
        nowPlayingCandidate,
        setNowPlayingCandidate,
        nowPlayingFeed,
        setNowPlayingFeed,
        masterPlayerRef,
        masterPlayerStatus,
        setMasterPlayerStatus,
        audioContextRef,
        analyserNodeRef,
        queue,
        setQueue,
        onPlayerEnd,
      }}
    >
      {children}
    </NowPlayingContext.Provider>
  );
};

export const useNowPlaying = (): NowPlayingContextType => {
  const context = useContext(NowPlayingContext);
  if (!context) {
    throw new Error("useNowPlaying must be used within a NowPlayingProvider");
  }
  return context;
};
