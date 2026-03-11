import { Dispatch, SetStateAction } from "react";

import { Detection, Feed } from "@/graphql/generated";

export interface AudioDetection extends Omit<Detection, "candidate"> {
  type: "audio";
  hydrophone: string;
  comments: string | null | undefined;
  newCategory:
    | "WHALE (HUMAN)"
    | "VESSEL"
    | "OTHER"
    | "WHALE (AI)"
    | "uncategorized";
  timestampString: string;
}

export interface CascadiaSighting {
  id: string;
  type: string; // e.g., "sighting"
  project_id: number;
  trip_id: number;
  name: string; // e.g., "Killer Whale (Orca)"
  scientific_name: string; // e.g., "Orcinus orca"
  number_sighted: number;
  latitude: number;
  longitude: number;
  created: string; // ISO date string, e.g., "2025-01-01 17:25:00"
  source: string; // e.g., "whale_alert"
  comments: string | null | undefined; // HTML string, null | undefined matches Orcahello
  icon: string; // e.g., "dot-black"
  photo_url: string;
  usernm: string; // e.g., "cascadiaWebMap"
  count_check: number;
  in_ocean: number; // boolean-like (0 or 1)
  is_test: number; // boolean-like (0 or 1)
  moderated: number | string; // boolean-like (0 or 1) for Cascadia, string for Orcahello
  trusted: number; // boolean-like (0 or 1)
}

export interface Sighting extends CascadiaSighting {
  type: "sightings";
  hydrophone: string;
  feedId: string;
  newCategory: "SIGHTING";
  timestamp: Date;
  timestampString: string;
}

export type CombinedData = AudioDetection | AIDetection | Sighting;

export interface Dataset {
  audio: AudioDetection[];
  ai: AIDetection[];
  sightings: Sighting[];
  combined: CombinedData[];
  feeds: Feed[];
  setNowPlaying?: Dispatch<SetStateAction<Candidate>>;
}

export interface AIDetectionLocation {
  name: string;
  longitude: number;
  latitude: number;
}

export interface AIDetectionAnnotation {
  id: number;
  startTime: number;
  endTime: number;
  confidence: number;
}

export type AIDetectionFound = "yes" | "no" | "don't know" | null;

export type AIDetectionReviewState =
  | "confirmed"
  | "falsepositive"
  | "unknown"
  | "unreviewed";

// Raw shape returned by the AI For Orcas / OrcaHello REST API.
// `tags` arrives as a semicolon-delimited string and `found` may require
// case-normalization before app use.
export interface AIDetectionRaw {
  id: string | null;
  audioUri: string | null;
  spectrogramUri: string | null;
  location: AIDetectionLocation;
  timestamp: string;
  annotations: AIDetectionAnnotation[] | null;
  reviewed: boolean;
  found: string | null;
  comments: string | null;
  confidence: number;
  moderator: string | null;
  moderated: string | null;
  tags: string | null;
}

// Normalized app shape for filtering and downstream transforms.
export interface AIDetection
  extends Omit<AIDetectionRaw, "id" | "annotations" | "found" | "tags"> {
  id: string;
  type: "ai";
  source: "orcahello";
  hydrophone: string;
  feedId?: string;
  comments: string | null;
  newCategory: "WHALE (AI)";
  timestampString: string;
  annotations: AIDetectionAnnotation[];
  found: AIDetectionFound;
  reviewState: AIDetectionReviewState;
  tags: string[];
}

export interface Candidate {
  id: string;
  array: CombinedData[];
  startTimestamp: string;
  endTimestamp: string;
  whale: number;
  vessel: number;
  other: number;
  "whale (AI)": number;
  sightings: number;
  hydrophone: string;
  feedId: string | undefined;
  clipCount: string;
  descriptions: string;
}
