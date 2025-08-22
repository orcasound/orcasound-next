import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Theme, useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

import { useData } from "@/context/DataContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { useComputedPlaybackFields } from "@/hooks/beta/useComputedPlaybackFields";
import formatDuration from "@/utils/masterDataHelpers";

const MapWithNoSSR = dynamic(
  () => import("@/components/layouts/HalfMapLayout/NewMap"),
  {
    ssr: false,
  },
);

export function MapWrapper({}: {
  masterPlayerTimeRef?: React.MutableRefObject<number>;
}) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const {
    nowPlayingCandidate,
    nowPlayingFeed,
    setNowPlayingCandidate,
    setNowPlayingFeed,
  } = useNowPlaying();
  const { filters, feeds } = useData();
  const { startOffset } = useComputedPlaybackFields(nowPlayingCandidate);

  const candidateStart = nowPlayingCandidate?.startTimestamp ?? "";
  const currentTimeSeconds = new Date().getTime() / 1000;
  const timestampSeconds = new Date(candidateStart).getTime() / 1000;
  const timeAgoString = formatDuration(timestampSeconds, currentTimeSeconds);

  const feed = useMemo(() => {
    if (nowPlayingCandidate) {
      const canFeed = feeds.find((f) => f.id === nowPlayingCandidate.feedId);
      if (canFeed) {
        return canFeed;
      } else {
        return null;
      }
    } else if (nowPlayingFeed) {
      return nowPlayingFeed;
    } else {
      return null;
    }
  }, [feeds, nowPlayingCandidate, nowPlayingFeed]);

  return (
    <Box
      className={"map-wrapper"}
      sx={{ flexGrow: 1, height: "100%", position: "relative" }}
    >
      {mdDown && nowPlayingCandidate && (
        <IconButton
          aria-label="close"
          className="candidate-map-close"
          onClick={() => {
            // router.back();
            setNowPlayingFeed(feed);
            setNowPlayingCandidate(null);
          }}
          sx={{
            position: "absolute",
            right: "1rem",
            top: "1rem",
            color: (theme) => theme.palette.grey[500],
            background: (theme) => theme.palette.background.default,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            "&:hover": {
              background: (theme) => theme.palette.background.default,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <MapWithNoSSR />
    </Box>
  );
}
