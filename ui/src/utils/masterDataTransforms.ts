import { Detection, Feed } from "@/graphql/generated";
import {
  AIDetection,
  AIDetectionRaw,
  AudioDetection,
  CascadiaSighting,
  DetectionsResult,
  Sighting,
} from "@/types/DataTypes";
import {
  lookupFeedId,
  lookupFeedName,
  lookupFeedSlug,
  standardizeFeedName,
} from "@/utils/masterDataHelpers";

const toNewCategory = (detection: Detection): AudioDetection["newCategory"] => {
  if (detection.source === "MACHINE") return "WHALE (AI)";

  switch (detection.category) {
    case "WHALE":
      return "WHALE (HUMAN)";
    case "VESSEL":
    case "OTHER":
      return detection.category;
    default:
      return "uncategorized";
  }
};

const normalizeTags = (rawTags: AIDetectionRaw["tags"]): string[] => {
  if (!rawTags) return [];

  if (Array.isArray(rawTags)) {
    return rawTags.map((tag) => tag.trim()).filter(Boolean);
  }

  return rawTags
    .split(";")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export function transformAudioDetections(
  detections: DetectionsResult[],
  feeds: Feed[],
): AudioDetection[] {
  if (!feeds.length || !detections.length) return [];

  return detections.map((el) => ({
    ...el,
    type: "audio",
    standardizedFeedName: lookupFeedName(el.feedId!, feeds),
    hydrophone: lookupFeedName(el.feedId!, feeds),
    feedSlug: lookupFeedSlug(el.feedId!, feeds),
    comments: el.description,
    newCategory: toNewCategory(el as Detection),
    timestampString: el.timestamp.toString(),
  }));
}

export function transformSightings(
  sightings: CascadiaSighting[],
  feeds: Feed[],
): Sighting[] {
  // standardize data
  const radius = 3;
  const addLat = radius / 69;
  const addLong = (lat: number) =>
    radius / (69 * Math.cos((lat * Math.PI) / 180));

  const feedCoordinates = feeds.map((feed) => ({
    name: feed.name,
    lat: feed.latLng.lat,
    lng: feed.latLng.lng,
    minLat: feed.latLng.lat - addLat,
    maxLat: feed.latLng.lat + addLat,
    minLng: feed.latLng.lng - addLong(feed.latLng.lat),
    maxLng: feed.latLng.lng + addLong(feed.latLng.lat),
  }));

  const assignSightingHydrophone = (sighting: CascadiaSighting) => {
    let hydrophone: string = "out of range";
    feedCoordinates.forEach((feed) => {
      const inLatRange =
        sighting.latitude >= feed.minLat && sighting.latitude <= feed.maxLat;
      const inLngRange =
        sighting.longitude >= feed.minLng && sighting.longitude <= feed.maxLng;
      if (inLatRange && inLngRange) {
        hydrophone = feed.name;
      }
    });
    hydrophone = standardizeFeedName(hydrophone);
    return hydrophone;
  };

  if (!Array.isArray(sightings)) return [];

  return sightings.map((el) => ({
    ...el,
    type: "sightings",
    newCategory: "SIGHTING",
    standardizedFeedName: assignSightingHydrophone(el),
    hydrophone: assignSightingHydrophone(el),
    feedId: lookupFeedId(assignSightingHydrophone(el), feeds ?? []),
    timestampString: el.created.replace(" ", "T") + "Z",
    timestamp: new Date(el.created.replace(" ", "T") + "Z"),
  }));
}

export const transformAIDetection = (
  raw: AIDetectionRaw,
  feeds: Feed[],
): AIDetection => ({
  ...raw,
  id: raw.id ?? crypto.randomUUID(),
  type: "ai",
  source: "orcahello",
  standardizedFeedName: standardizeFeedName(raw.location?.name ?? "unknown"),
  hydrophone: standardizeFeedName(raw.location?.name ?? "unknown"),
  feedId: lookupFeedId(standardizeFeedName(raw.location.name), feeds),
  comments: raw.comments,
  newCategory: "WHALE (AI)",
  timestampString: raw.timestamp,
  annotations: raw.annotations ?? [],
  found:
    raw.found?.toLowerCase() === "yes"
      ? "yes"
      : raw.found?.toLowerCase() === "no"
        ? "no"
        : raw.found?.toLowerCase() === "don't know"
          ? "don't know"
          : null,
  reviewState: !raw.reviewed
    ? "unreviewed"
    : raw.found?.toLowerCase() === "yes"
      ? "confirmed"
      : raw.found?.toLowerCase() === "no"
        ? "falsepositive"
        : "unknown",
  tags: normalizeTags(raw.tags),
});
