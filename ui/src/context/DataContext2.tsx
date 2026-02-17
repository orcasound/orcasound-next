import dayjs, { Dayjs } from "dayjs";
import React, {
  createContext,
  MutableRefObject,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { defaultRange } from "@/components/CandidateList/CandidateListFilters";
import { Feed } from "@/graphql/generated";
import useFilteredData from "@/hooks/beta/useFilteredData";
import { MasterData, useMasterData } from "@/hooks/beta/useMasterData";
import { useSortedCandidates } from "@/hooks/beta/useSortedCandidates";
import { Candidate, CombinedData } from "@/types/DataTypes";

import { useNowPlaying } from "./NowPlayingContext";

// This file is a bridge design for "DataContext + store split":
// - useMasterData stays here (React Query composition remains in React hook land)
// - UI-owned state is isolated in a separate provider shape (later replaceable with Zustand)
// - DataContext outward API remains the same as DataContext.tsx

export interface CandidateFilters {
  timeRange: number;
  timeIncrement: number;
  hydrophone: string;
  category: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  sortOrder: "asc" | "desc" | "reports";
  searchQuery: string;
  chartLegend: "category" | "hydrophone";
  detectionsGreaterThan: number;
}

type FeedCountData = {
  counts: Record<string, number>;
  countString: string;
  shortCountString: string;
};

type FeedCounts = {
  [feedId: string]: FeedCountData;
};

interface DataUiState {
  useLiveData: boolean;
  setUseLiveData: React.Dispatch<React.SetStateAction<boolean>>;
  filters: CandidateFilters;
  setFilters: React.Dispatch<React.SetStateAction<CandidateFilters>>;
  autoPlayOnReady: MutableRefObject<boolean>;
}

interface DataContext2Type {
  feeds: Feed[];
  filteredData: CombinedData[];
  reportCount: FeedCounts;
  sortedCandidates: Candidate[];
  filters: CandidateFilters;
  setFilters: React.Dispatch<React.SetStateAction<CandidateFilters>>;
  isSuccessOrcahello: boolean;
  autoPlayOnReady: MutableRefObject<boolean>;
  lastWhaleReport: (feed?: Feed | null) => CombinedData | undefined;
  lastWhaleReportFeed: Feed | null;
  useLiveData: boolean;
  setUseLiveData: React.Dispatch<React.SetStateAction<boolean>>;
  data: MasterData | null;
}

const DataUiStateContext = createContext<DataUiState | undefined>(undefined);
const DataContext2 = createContext<DataContext2Type | undefined>(undefined);

function DataUiStateProvider({ children }: { children: React.ReactNode }) {
  const [useLiveData, setUseLiveData] = useState(true);
  const [filters, setFilters] = useState<CandidateFilters>({
    timeRange: defaultRange,
    timeIncrement: 15,
    hydrophone: "All hydrophones",
    category: "All categories",
    startDate: null,
    endDate: dayjs(),
    sortOrder: "reports",
    searchQuery: "",
    chartLegend: "category",
    detectionsGreaterThan: 1,
  });
  const autoPlayOnReady = useRef(true);

  const value = useMemo(
    () => ({
      useLiveData,
      setUseLiveData,
      filters,
      setFilters,
      autoPlayOnReady,
    }),
    [useLiveData, filters],
  );

  return (
    <DataUiStateContext.Provider value={value}>
      {children}
    </DataUiStateContext.Provider>
  );
}

function useDataUiState(): DataUiState {
  const context = useContext(DataUiStateContext);
  if (!context) {
    throw new Error("useDataUiState must be used within DataUiStateProvider");
  }
  return context;
}

function DataProviderInner({ children }: { children: React.ReactNode }) {
  const { nowPlayingCandidate } = useNowPlaying();
  const { useLiveData, setUseLiveData, filters, setFilters, autoPlayOnReady } =
    useDataUiState();

  // React Query composition stays in a React hook/provider boundary.
  const data = useMasterData(useLiveData);
  const feeds = data.feeds;
  const isSuccessOrcahello = data.isSuccessOrcahello;

  const filteredData = useFilteredData(data.combined, filters);

  const lastWhaleReport = (feed?: Feed | null) => {
    const reports = feed
      ? filteredData.filter((d) => d.feedId === feed?.id)
      : filteredData;
    const whaleReports = reports.filter(
      (d) =>
        d.newCategory === "WHALE" ||
        d.newCategory === "WHALE (AI)" ||
        d.newCategory === "SIGHTING",
    );
    const lastReportTime = Math.max(
      ...whaleReports.map((r) => new Date(r.timestampString).getTime()),
    );
    return whaleReports.find(
      (r) => new Date(r.timestampString).getTime() === lastReportTime,
    );
  };

  const lastWhaleReportFeed =
    feeds.find((f) => f.id === lastWhaleReport()?.feedId) ?? null;

  const sortedCandidates = useSortedCandidates(
    filteredData,
    filters.timeIncrement,
    filters.sortOrder,
    filters.detectionsGreaterThan,
  );

  const reportCounter = (
    startTimestamp?: string | null,
    endTimestamp?: string | null,
  ) => {
    const categories = [...new Set(filteredData.map((el) => el.newCategory))];
    const obj: FeedCounts = {
      all: { counts: {}, countString: "", shortCountString: "" },
    };

    feeds.forEach((feed) => {
      if (feed.id != null) {
        obj[feed.id] = { counts: {}, countString: "", shortCountString: "" };
      }
    });

    for (const feedId in obj) {
      categories.forEach((category) => {
        obj[feedId].counts[category] = 0;
      });
    }

    const scopedData =
      !startTimestamp || !endTimestamp
        ? filteredData
        : filteredData.filter((d) => {
            return (
              new Date(d.timestampString) >= new Date(startTimestamp) &&
              new Date(d.timestampString) <= new Date(endTimestamp)
            );
          });

    scopedData.forEach((d) => {
      if (
        d.feedId &&
        d.newCategory &&
        obj[d.feedId] &&
        obj[d.feedId].counts[d.newCategory] != null
      ) {
        obj.all.counts[d.newCategory] += 1;
        obj[d.feedId].counts[d.newCategory] += 1;
      }
    });

    const countString = (counts: Record<string, number>) => {
      const parts: string[] = [];
      for (const key of Object.keys(counts)) {
        if (counts[key] > 0) {
          parts.push(
            `${counts[key]} ${key.toLowerCase()}${key === "SIGHTING" ? "s" : ""}`,
          );
        }
      }
      return parts.join(" · ");
    };

    const shortCountString = (counts: Record<string, number>) => {
      const parts: string[] = [];
      const shortCounts = { whale: 0, vessel: 0, other: 0 };
      for (const key of Object.keys(counts)) {
        if (key === "WHALE" || key === "WHALE (AI)" || key === "SIGHTING") {
          shortCounts.whale += counts[key];
        } else if (key === "VESSEL") {
          shortCounts.vessel += counts[key];
        } else if (key === "OTHER") {
          shortCounts.other += counts[key];
        }
      }
      Object.entries(shortCounts).forEach(([key, count]) => {
        parts.push(`${count} ${key}`);
      });
      return parts.join(" · ");
    };

    for (const feed in obj) {
      obj[feed].countString = countString(obj[feed].counts);
      obj[feed].shortCountString = shortCountString(obj[feed].counts);
    }

    return obj;
  };

  const reportCount = nowPlayingCandidate
    ? reportCounter(
        nowPlayingCandidate.startTimestamp,
        nowPlayingCandidate.endTimestamp,
      )
    : reportCounter();

  return (
    <DataContext2.Provider
      value={{
        feeds,
        reportCount,
        filteredData,
        sortedCandidates,
        filters,
        setFilters,
        isSuccessOrcahello,
        autoPlayOnReady,
        lastWhaleReport,
        lastWhaleReportFeed,
        useLiveData,
        setUseLiveData,
        data,
      }}
    >
      {children}
    </DataContext2.Provider>
  );
}

export const DataProvider2 = ({ children }: { children: React.ReactNode }) => {
  return (
    <DataUiStateProvider>
      <DataProviderInner>{children}</DataProviderInner>
    </DataUiStateProvider>
  );
};

export const useData2 = (): DataContext2Type => {
  const context = useContext(DataContext2);
  if (!context) {
    throw new Error("useData2 must be used within a DataProvider2");
  }
  return context;
};
