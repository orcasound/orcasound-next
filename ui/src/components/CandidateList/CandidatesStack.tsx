import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { useData } from "@/context/DataContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { Feed } from "@/graphql/generated";
import { countCategories } from "@/hooks/beta/useSortedCandidates";
import { CombinedData } from "@/types/DataTypes";

import Link from "../Link";
import { timeRangeSelect } from "./CandidateListFilters";
import CandidatesList from "./CandidatesList";
import { CandidatesResults } from "./CandidatesResults";
import ReportsBarChart from "./ReportsBarChart";

export const CandidatesStack = ({
  feed,
  showChart = false,
  showHeading = true,
}: {
  feed?: Feed;
  showChart?: boolean;
  showHeading?: boolean;
}) => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { feeds, filters, sortedCandidates, filteredData } = useData();
  const router = useRouter();
  const { nowPlayingFeed, setNowPlayingFeed } = useNowPlaying();
  if (!feed && router.query.feedSlug) {
    const routerFeed = feeds.find((f) => f.slug === router.query.feedSlug);
    feed = routerFeed;
  } else if (!feed && nowPlayingFeed) {
    feed = nowPlayingFeed;
  }
  const candidates = feed
    ? sortedCandidates.filter((c) => c.feedId === feed?.id)
    : sortedCandidates;

  const detections = feed
    ? filteredData.filter((c) => c.feedId === feed?.id)
    : filteredData;

  const detectionsAudible = detections.filter(
    (d) => d.hydrophone !== "out of range",
  );

  function countString(detectionArray: CombinedData[]) {
    const categories = ["whale", "whale (AI)", "vessel", "other", "sighting"];

    const items = categories
      .map((category) => {
        const count = countCategories(detectionArray, category);

        // if (count === 0) return null;

        let label = category;
        if (category === "sighting" && count !== 1) {
          label += "s in audible range";
        } else if (category === "sighting") {
          label += " in audible range";
        }

        return (
          <Link key={category} href="#" color="rgba(255,255,255,.7)">
            {count} {label}
          </Link>
        );
      })
      .filter((c) => c); // filters out the null items

    // Interleave with separators
    const interleaved = items.flatMap((item, index) =>
      index < items.length - 1
        ? [item, <span key={`dot-${index}`}> · </span>]
        : [item],
    );

    return (
      <div
        style={{
          display: "flex",
          columnGap: "8px",
          flexWrap: "wrap",
          lineHeight: 1.6,
        }}
      >
        {interleaved}
      </div>
    );
  }

  const [showFilters, setShowFilters] = useState(false);

  const clearFilterButton = (
    <Button
      variant="contained"
      size="small"
      startIcon={<Close />}
      sx={{
        whiteSpace: "nowrap",
        backgroundColor: "rgba(255,255,255,.2)",
        color: "white",
        mb: 1,
        "&:hover": {
          backgroundColor: "rgba(255,255,255,.25)",
        },
      }}
      onClick={() => {
        if (router.query.feedSlug) {
          feed = undefined;
          setNowPlayingFeed(null);
          router.push("/");
        } else if (nowPlayingFeed) {
          feed = undefined;
          setNowPlayingFeed(null);
        }
      }}
    >
      Clear filter
    </Button>
  );

  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{
        px: { xs: 2, sm: 2, md: 3 },
        pb: "200px",
        mt: showChart ? 1 : 3,
      }}
    >
      {showChart && (
        <Stack
          className="chart-heading"
          gap={0.5}
          sx={{ alignItems: "flex-start" }}
        >
          {mdDown && feed && clearFilterButton}
          <Typography
            component="h2"
            variant="h6"
            sx={{ lineHeight: 1.4, mt: mdDown ? "0px" : "8px" }}
          >
            {!mdDown &&
              timeRangeSelect.find((el) => el.value === filters.timeRange)
                ?.label}
            {!mdDown && " · "}
            {feed ? feed.name : "All hydrophones"}
          </Typography>
          {countString(detectionsAudible)}
        </Stack>
      )}
      <Stack
        className={"candidates-stack"}
        sx={{
          overflowY: "auto",
          flex: 1,
          pb: "100px",
        }}
      >
        {showChart && (
          <Box sx={{ py: "1.5rem" }}>
            <ReportsBarChart
              showLegend={false}
              showYAxis={false}
              showXAxis={false}
              feed={feed}
            />
          </Box>
        )}
        <Box sx={{ overflow: mdDown ? "auto" : "initial" }}>
          <CandidatesResults viewType="list" candidates={candidates} />
          <Box sx={{ paddingTop: "1.5rem" }}></Box>
          <CandidatesList feed={feed} />
        </Box>
      </Stack>{" "}
    </Container>
  );
};
