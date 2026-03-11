import { useMemo } from "react";

import {
  Detection,
  Feed,
  useDetectionsQuery,
  useFeedsQuery,
} from "@/graphql/generated";
import {
  AIDetection,
  AudioDetection,
  CombinedData,
  Sighting,
} from "@/types/DataTypes";
import { lookupFeedId } from "@/utils/masterDataHelpers";

import {
  transformHuman,
  transformSightings,
} from "../../utils/masterDataTransforms";
import { useAIDetections } from "./useAIDetections";
import { useLiveDetections1000 } from "./useLiveDetections1000";
import { useLiveFeeds } from "./useLiveFeeds";
import { useSightings } from "./useSightings";

export type MasterData = {
  audio: AudioDetection[];
  ai: AIDetection[];
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

  //// ORCAHELLO detections
  const { returnData: aiDetections = [], isSuccess: isSuccessOrcahello } =
    useAIDetections();
  const datasetAi = useMemo(
    () =>
      aiDetections.map((detection) => ({
        ...detection,
        feedId: lookupFeedId(detection.hydrophone, feeds),
      })),
    [aiDetections, feeds],
  );

  // standardize human detections
  const datasetAudio = useMemo(() => {
    if (!isSuccessOrcahello) {
      return transformHuman(audioDetections, feeds);
    } else {
      return transformHuman(
        audioDetections.filter((d) => d.source === "HUMAN"),
        feeds,
      );
    }
  }, [audioDetections, feeds, isSuccessOrcahello]);

  //// ACARTIA sightings
  // get detections
  const { data: sightingsData, isSuccess: isSuccessSightings } = useSightings();
  const dataSightings = useMemo(
    () => sightingsData?.results ?? [],
    [sightingsData],
  );
  // standardize sightings
  const datasetSightings = useMemo(
    () => transformSightings(dataSightings, feeds),
    [dataSightings, feeds],
  );

  const combined: CombinedData[] = useMemo(() => {
    return [...datasetAudio, ...datasetAi, ...datasetSightings];
  }, [datasetAudio, datasetAi, datasetSightings]);

  const dataset = useMemo(() => {
    return {
      audio: datasetAudio,
      ai: datasetAi,
      sightings: datasetSightings,
      combined: combined,
      feeds: feeds,
      isSuccessSightings: isSuccessSightings,
    };
  }, [
    datasetAudio,
    datasetAi,
    datasetSightings,
    combined,
    feeds,
    isSuccessSightings,
  ]);
  return dataset;
}
