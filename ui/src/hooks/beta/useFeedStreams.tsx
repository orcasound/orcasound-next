import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useMemo } from "react";

import { FeedStream } from "@/graphql/generated";

const endpoint = "https://live.orcasound.net/graphiql/";

type FeedStreamResponse = {
  feedStreams: {
    results: FeedStream[];
  };
};

const GET_STREAMS = (feedId: string, playlistTimestamp: string) => gql`
  {
  feedStreams(
    feedId: "${feedId}",
    filter: {playlistTimestamp: {eq: "${playlistTimestamp}"}}) {
    results {
      startTime
      endTime
      duration
      bucket
      bucketRegion
      cloudfrontUrl
      playlistM3u8Path
      playlistPath
      playlistTimestamp
      feedId
    }
  }
}
`;

const fetchFeedStreams = async (
  feedId: string | undefined,
  playlistTimestamp: string,
) => {
  if (!feedId) throw new Error("feedId is undefined");
  return await request<FeedStreamResponse>(
    endpoint,
    GET_STREAMS(feedId, playlistTimestamp),
  );
};

export const useFeedStreams = ({
  feedId,
  playlistTimestamp,
  enabled = true,
}: {
  feedId: string | undefined;
  playlistTimestamp: string;
  enabled?: boolean;
}) => {
  return useQuery<FeedStreamResponse>({
    queryKey: ["feedstreams", feedId, playlistTimestamp],
    queryFn: () => fetchFeedStreams(feedId!, playlistTimestamp),
    enabled: !!feedId && !!playlistTimestamp && enabled,
    staleTime: 5 * 60 * 1000, // optional: cache for 5 minutes
  });
};

export function useFeedStreamsMultiple(
  feedId: string | undefined,
  playlistTimestamps: string[],
): UseQueryResult<{ feedStreams: { results: FeedStream[] } }>[] {
  const queries = useMemo(() => {
    return playlistTimestamps.map((timestamp) => ({
      queryKey: ["feedstreams", feedId, timestamp],
      queryFn: () => fetchFeedStreams(feedId!, timestamp),
      enabled: !!feedId && !!timestamp,
      staleTime: 5 * 60 * 1000,
    }));
  }, [feedId, playlistTimestamps]);
  const results = useQueries({ queries });
  return results;
}
