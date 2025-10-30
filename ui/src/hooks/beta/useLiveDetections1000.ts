import { useQuery } from "@tanstack/react-query";
import request, { gql } from "graphql-request";

import { Detection } from "@/graphql/generated";

const orcasoundEndpoint = "https://live.orcasound.net/graphql/";

const DETECTIONS_QUERY = gql`
  query GetDetections($limit: Int!, $offset: Int!) {
    detections(
      limit: $limit
      offset: $offset
      sort: { field: TIMESTAMP, order: DESC }
    ) {
      results {
        id
        feedId
        listenerCount
        category
        description
        playerOffset
        playlistTimestamp
        timestamp
        candidate {
          id
          feedId
        }
        feed {
          name
          id
        }
      }
    }
  }
`;

type LiveDataResponse = {
  detections: {
    results: Detection[];
  };
};

const fetchLiveDetections = async (): Promise<Detection[]> => {
  const batchSize = 250;
  const batchCount = 4;

  const promises = Array.from({ length: batchCount }, (_, i) => {
    return request<LiveDataResponse>(orcasoundEndpoint, DETECTIONS_QUERY, {
      limit: batchSize,
      offset: i * batchSize,
    });
  });

  const results = await Promise.all(promises);
  const allDetections = results.flatMap((res) => res.detections.results);

  return allDetections;
};

export function useLiveDetections1000() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["detections-live"],
    queryFn: fetchLiveDetections,
  });

  return { data, isLoading, error };
}
