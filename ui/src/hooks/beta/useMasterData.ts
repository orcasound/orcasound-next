import { useMemo } from "react";

import {
  Detection,
  Feed,
  useDetectionsQuery,
  useFeedsQuery,
} from "@/graphql/generated";
import { AudioDetection, CombinedData, Sighting } from "@/types/DataTypes";

import {
  transformHuman,
  transformSightings,
} from "../../utils/masterDataTransforms";
import { useLiveDetections1000 } from "./useLiveDetections1000";
import { useLiveFeeds } from "./useLiveFeeds";
import { useSightings } from "./useSightings";

export type MasterData = {
  audio: AudioDetection[];
  sightings: Sighting[];
  combined: CombinedData[];
  feeds: Feed[];
};

export function useMasterData(useLiveData: boolean): MasterData {
  //// ORCASOUND
  // get feeds and detections based on live/seed toggle in development UI
  const seedDetections = useDetectionsQuery().data?.detections?.results ?? [];
  // const liveDetections = useLiveDetections().data?.detections?.results ?? [];
  const liveDetections = useLiveDetections1000().data ?? [];

  const audioDetections = useLiveData
    ? liveDetections
    : (seedDetections as Detection[]);

  const liveFeeds = useLiveFeeds().data?.feeds ?? [];
  const seedFeeds = useFeedsQuery().data?.feeds ?? [];
  const feeds = useLiveData ? liveFeeds : (seedFeeds as Feed[]);

  // standardize data
  const datasetAudio = useMemo(
    () => transformHuman(audioDetections, feeds),
    [audioDetections, feeds],
  );

  //// ACARTIA sightings
  // get detections
  const { data: sightingsData, isSuccess: isSuccessSightings } = useSightings();
  const dataSightings = useMemo(
    () => sightingsData?.results ?? [],
    [sightingsData],
  );
  // standardize data
  const datasetSightings = useMemo(
    () => transformSightings(dataSightings, feeds),
    [dataSightings, feeds],
  );

  const combined: CombinedData[] = useMemo(() => {
    return [...datasetAudio, ...datasetSightings];
  }, [datasetAudio, datasetSightings]);

  const dataset = useMemo(() => {
    return {
      audio: datasetAudio,
      sightings: datasetSightings,
      combined: combined,
      feeds: feeds,
      isSuccessSightings: isSuccessSightings,
    };
  }, [datasetAudio, datasetSightings, combined, feeds, isSuccessSightings]);
  return dataset;
}
