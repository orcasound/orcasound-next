import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { AIDetection, AIDetectionRaw } from "@/types/DataTypes";
import {
  constructUrl,
  normalizeAIDetection,
  sevenDays,
} from "@/utils/masterDataHelpers";

const endpointOrcahello =
  "https://aifororcasdetections.azurewebsites.net/api/detections";

const requestedStartOrcahello = new Date(Date.now() - sevenDays).toISOString();
const requestedEndOrcahello = new Date().toISOString();

const paramsOrcahello = {
  sortBy: "timestamp",
  sortOrder: "desc",
  timeframe: "1w",
  location: "all",
  recordsPerPage: 50,
};

const CACHE_KEY = "orcahello-ai-detections-v2";

type OrcahelloPageResult = {
  rows: AIDetectionRaw[];
};

export type AIDetectionsFetchMeta = {
  requestedStart: string;
  requestedEnd: string;
  fetchedNewest: string | null;
  fetchedOldest: string | null;
  failedPage: number | null;
  loadError: string | null;
  partial: boolean;
};

type AIDetectionsQueryPayload = {
  rawRows: AIDetectionRaw[];
  detections: AIDetection[];
  meta: AIDetectionsFetchMeta;
};

const fetchOrcahelloPage = async (
  page: number,
): Promise<OrcahelloPageResult> => {
  const url = constructUrl(endpointOrcahello, {
    ...paramsOrcahello,
    page,
  });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Orcahello request failed with ${response.status}`);
  }

  const rows = (await response.json()) as AIDetectionRaw[];
  return { rows };
};

const withinRequestedRange = (row: AIDetectionRaw) =>
  new Date(row.timestamp).getTime() >=
  new Date(requestedStartOrcahello).getTime();

const buildFetchMeta = (
  rows: AIDetectionRaw[],
  failedPage: number | null,
  loadError: string | null,
): AIDetectionsFetchMeta => ({
  requestedStart: requestedStartOrcahello,
  requestedEnd: requestedEndOrcahello,
  fetchedNewest: rows[0]?.timestamp ?? null,
  fetchedOldest: rows[rows.length - 1]?.timestamp ?? null,
  failedPage,
  loadError,
  partial: failedPage !== null,
});

const mergeRows = (
  freshRows: AIDetectionRaw[],
  cachedRows: AIDetectionRaw[],
): AIDetectionRaw[] => {
  const merged = new Map<string, AIDetectionRaw>();

  for (const row of [...freshRows, ...cachedRows]) {
    const key = row.id ?? `${row.timestamp}-${row.audioUri ?? "unknown"}`;
    if (!merged.has(key)) {
      merged.set(key, row);
    }
  }

  return Array.from(merged.values())
    .filter(withinRequestedRange)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

const toQueryPayload = (
  rows: AIDetectionRaw[],
  failedPage: number | null,
  loadError: string | null,
): AIDetectionsQueryPayload => ({
  rawRows: rows,
  detections: rows.map(normalizeAIDetection),
  meta: buildFetchMeta(rows, failedPage, loadError),
});

const readCachedPayload = (): AIDetectionsQueryPayload | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return undefined;
    }

    return JSON.parse(raw) as AIDetectionsQueryPayload;
  } catch {
    return undefined;
  }
};

const fetchOrcahelloData = async (
  cachedRows: AIDetectionRaw[],
  onProgress?: (value: AIDetectionsQueryPayload) => void,
): Promise<AIDetectionsQueryPayload> => {
  const cachedIds = new Set(cachedRows.map((row) => row.id).filter(Boolean));

  let firstPage: OrcahelloPageResult;

  try {
    firstPage = await fetchOrcahelloPage(1);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Orcahello error";
    return toQueryPayload(cachedRows, 1, message);
  }

  const firstPageHasCachedRows = firstPage.rows.some(
    (row) => row.id && cachedIds.has(row.id),
  );
  let freshRows = firstPage.rows.filter(
    (row) => !(row.id && cachedIds.has(row.id)),
  );
  onProgress?.(toQueryPayload(mergeRows(freshRows, cachedRows), null, null));

  if (firstPageHasCachedRows) {
    return toQueryPayload(mergeRows(freshRows, cachedRows), null, null);
  }

  for (let page = 2; page <= 100; page += 1) {
    let nextPage: OrcahelloPageResult;

    try {
      nextPage = await fetchOrcahelloPage(page);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Orcahello error";
      return toQueryPayload(mergeRows(freshRows, cachedRows), page, message);
    }

    if (nextPage.rows.length === 0) {
      break;
    }

    const hitCachedRow = nextPage.rows.some(
      (row) => row.id && cachedIds.has(row.id),
    );
    const freshPageRows = nextPage.rows.filter(
      (row) => !(row.id && cachedIds.has(row.id)),
    );

    if (freshPageRows.length > 0) {
      freshRows = freshRows.concat(freshPageRows);
      onProgress?.(
        toQueryPayload(mergeRows(freshRows, cachedRows), null, null),
      );
    }

    if (hitCachedRow || nextPage.rows.length < paramsOrcahello.recordsPerPage) {
      break;
    }
  }

  return toQueryPayload(mergeRows(freshRows, cachedRows), null, null);
};

export function useAIDetections() {
  const [cacheReady, setCacheReady] = useState(false);
  const [cachedPayload, setCachedPayload] = useState<
    AIDetectionsQueryPayload | undefined
  >(undefined);
  const [progressPayload, setProgressPayload] = useState<
    AIDetectionsQueryPayload | undefined
  >(undefined);

  useEffect(() => {
    setCachedPayload(readCachedPayload());
    setProgressPayload(undefined);
    setCacheReady(true);
  }, []);

  const { data, isSuccess, isFetching, isPending, error } = useQuery({
    queryKey: ["ai-detections", requestedStartOrcahello],
    queryFn: () =>
      fetchOrcahelloData(cachedPayload?.rawRows ?? [], setProgressPayload),
    initialData: cachedPayload,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: cacheReady,
  });

  const resolvedPayload = data ?? progressPayload ?? cachedPayload;
  const returnData = resolvedPayload?.detections;
  const fetchMeta = resolvedPayload?.meta;

  useEffect(() => {
    if (!data || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    setCachedPayload(data);
  }, [data]);

  const unreviewed = returnData?.filter((el: AIDetection) => !el.reviewed);
  const confirmed = returnData?.filter(
    (el: AIDetection) => el.reviewed && el.found === "yes",
  );
  const falsepositives = returnData?.filter(
    (el: AIDetection) => el.reviewed && el.found === "no",
  );
  const unknown = returnData?.filter(
    (el: AIDetection) => el.reviewed && el.found === "don't know",
  );

  return {
    returnData,
    confirmed,
    unreviewed,
    falsepositives,
    unknown,
    fetchMeta,
    isSuccess,
    isFetching,
    isPending,
    error,
  };
}
