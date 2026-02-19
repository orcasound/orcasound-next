import { useMemo } from "react";

import { Candidate, CombinedData } from "@/types/DataTypes";
import { cleanSightingsDescription } from "@/utils/masterDataHelpers";

export const countCategories = (
  arr: { newCategory?: string | null }[],
  cat: string,
) => {
  return arr.filter(
    (d) => (d.newCategory ?? "").toLowerCase() === cat.toLowerCase(),
  ).length;
};

const offsetPadding = 15;

const addSeconds = (dateString: string, secondsToAdd: number) => {
  const originalDate = new Date(dateString);
  originalDate.setMilliseconds(
    originalDate.getMilliseconds() + secondsToAdd * 1000,
  );
  return originalDate?.toISOString();
};

const subtractSeconds = (dateString: string, secondsToAdd: number) => {
  const originalDate = new Date(dateString);
  originalDate.setMilliseconds(
    originalDate.getMilliseconds() - secondsToAdd * 1000,
  );
  return originalDate?.toISOString();
};

// --- NEW: map per-detection category to a 3-way bucket of "whale"-like
type BucketType = "whale" | "vessel" | "other";
const WHALE_BUCKET = new Set(["whale (human)", "whale (ai)", "sighting"]);
const toBucket = (cat?: string | null): BucketType => {
  const c = (cat ?? "").toLowerCase();
  if (WHALE_BUCKET.has(c)) return "whale";
  if (c === "vessel") return "vessel";
  // treat anything else as "other" by design
  return "other";
};

const createCandidates = (
  dataset: CombinedData[],
  interval: number,
): Candidate[] => {
  // Each candidate is an array of CombinedData that share hydrophone, bucket, and time window
  const candidates: Array<Array<CombinedData>> = [];

  // sort ascending by time
  const sort = [...dataset].sort(
    (a, b) => Date.parse(a.timestampString) - Date.parse(b.timestampString),
  );

  sort.forEach((el: CombinedData) => {
    const hydrophone = el.hydrophone;
    const bucket = toBucket(el.newCategory);

    if (!candidates.length) {
      candidates.push([el]);
      return;
    }

    // Find the most recent candidate with the same hydrophone AND same bucket
    const findLastMatchingArray = () => {
      for (let i = candidates.length - 1; i >= 0; i--) {
        const arr = candidates[i];
        if (!arr.length) continue;
        const sameHydrophone = arr[0].hydrophone === hydrophone;
        const arrBucket = toBucket(arr[0].newCategory);
        if (sameHydrophone && arrBucket === bucket) {
          return arr;
        }
      }
      return undefined;
    };

    const lastMatchingArray = findLastMatchingArray();
    const lastTimestamp =
      lastMatchingArray &&
      lastMatchingArray[lastMatchingArray.length - 1].timestampString;

    // Within the time window? If yes, add to that candidate; else start a new one.
    if (
      lastTimestamp &&
      Math.abs(Date.parse(lastTimestamp) - Date.parse(el.timestampString)) /
        (1000 * 60) <=
        interval
    ) {
      lastMatchingArray!.push(el);
    } else {
      candidates.push([el]);
    }
  });

  const candidatesMap = candidates.map((candidate) => {
    const hydrophone = candidate[0].hydrophone;
    const feedId = candidate[0].feedId?.toString();
    const firstReport = candidate[0].timestampString;
    const lastReport = candidate[candidate.length - 1].timestampString;
    const startTimestamp = subtractSeconds(firstReport, offsetPadding);
    const endTimestamp = addSeconds(lastReport, offsetPadding);

    const countString = [
      "whale (human)",
      "whale (AI)",
      "vessel",
      "other",
      "sighting",
    ]
      .map((category) => {
        const count = countCategories(candidate, category);
        let mutableCategory = category;
        if (count === 0) return;
        if (category === "sighting" && count > 1) {
          mutableCategory = mutableCategory + "s";
        }
        return `${count} ${mutableCategory}`;
      })
      .filter((c) => c)
      .join(" • ");

    // include the 3-way bucket in the id to avoid id collisions between types
    const bucket = toBucket(candidate[0].newCategory);

    return {
      id: `${startTimestamp}_${endTimestamp}_${bucket}`,
      array: candidate,
      startTimestamp,
      endTimestamp,
      whale: countCategories(candidate, "whale (human)"),
      vessel: countCategories(candidate, "vessel"),
      other: countCategories(candidate, "other"),
      "whale (AI)": countCategories(candidate, "whale (ai)"),
      sightings: countCategories(candidate, "sighting"),
      hydrophone,
      feedId,
      clipCount: countString,
      descriptions: candidate
        .map((el: CombinedData) => cleanSightingsDescription(el.comments))
        .filter(
          (el: string | null | undefined) =>
            typeof el === "string" && el.length > 0,
        )
        .join(" • ")
        .replace(/•\s?$/, "")
        .replace(/^\s?•\s?/, ""),
    };
  });

  return candidatesMap;
};

const sortCandidates = (candidates: Candidate[], sortOrder: string) => {
  const handledGetTime = (date?: Date) => {
    return date != null ? new Date(date).getTime() : 0;
  };

  const sortDescending = (array: Candidate[]) => {
    const sort = array.sort(
      (a, b) =>
        handledGetTime(new Date(b.array[0].timestampString)) -
        handledGetTime(new Date(a.array[0].timestampString)),
    );
    return sort;
  };

  const sortAscending = (array: Candidate[]) => {
    const sort = array.sort(
      (a, b) =>
        handledGetTime(new Date(a.array[0].timestampString)) -
        handledGetTime(new Date(b.array[0].timestampString)),
    );
    return sort;
  };

  const sortByReports = (array: Candidate[]) => {
    const sort = array.sort((a, b) => b.array.length - a.array.length);
    return sort;
  };

  const sorted =
    sortOrder === "desc"
      ? sortDescending([...candidates])
      : sortOrder === "asc"
        ? sortAscending([...candidates])
        : sortOrder === "reports"
          ? sortByReports([...candidates])
          : [];
  return sorted;
};

const filterGreaterThan = (
  array: Candidate[],
  detectionsGreaterThan: number,
) => {
  return array.filter((c) => {
    const detectionCount =
      c.whale + c.vessel + c.other + c["whale (AI)"] + c.sightings;
    return detectionCount >= detectionsGreaterThan;
  });
};

export function useSortedCandidates(
  rawData: CombinedData[],
  timeIncrement: number,
  sortOrder: string,
  detectionsGreaterThan: number,
): Candidate[] {
  return useMemo(() => {
    const inRange = rawData.filter((d) => d.hydrophone !== "out of range");
    const created = createCandidates(inRange, timeIncrement);
    const sorted = sortCandidates(created, sortOrder);
    const filtered = filterGreaterThan(sorted, detectionsGreaterThan);
    return filtered;
  }, [rawData, timeIncrement, sortOrder, detectionsGreaterThan]);
}
