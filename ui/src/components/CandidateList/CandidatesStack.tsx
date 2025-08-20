import {
  Box,
  Container,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { useData } from "@/context/DataContext";
import { Feed } from "@/graphql/generated";
import { countCategories } from "@/hooks/beta/useSortedCandidates";
import { CombinedData } from "@/types/DataTypes";
import { standardizeFeedName } from "@/utils/masterDataHelpers";

import Link from "../Link";
import CandidateListFilters, { timeRangeSelect } from "./CandidateListFilters";
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
  if (!feed && router.query.feedSlug) {
    const routerFeed = feeds.find((f) => f.slug === router.query.feedSlug);
    feed = routerFeed;
  }
  const candidates = feed
    ? sortedCandidates.filter(
        (c) => c.hydrophone === standardizeFeedName(feed?.name),
      )
    : sortedCandidates;

  const detections = feed
    ? filteredData.filter(
        (c) => c.hydrophone === standardizeFeedName(feed?.name),
      )
    : filteredData;

  function countString(detectionArray: CombinedData[]) {
    const categories = ["whale", "whale (AI)", "vessel", "other", "sighting"];

    const items = categories
      .map((category) => {
        const count = countCategories(detectionArray, category);

        // if (count === 0) return null;

        let label = category;
        if (category === "sighting" && count !== 1) {
          label += "s";
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

  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{
        px: 2,
        pb: "200px",
        mt: showChart ? 2 : 3,
      }}
    >
      {!showChart && !showHeading && (
        <Box mb={2}>
          <Typography component="h2" variant="h5" mb={1}>
            Recordings
          </Typography>
          <Typography
            component="p"
            variant="body1"
            mb={2}
            sx={{ color: "rgba(255,255,255,.7)" }}
          >
            Explore recent events and vote for the most interesting.
          </Typography>
          <CandidateListFilters
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </Box>
      )}
      {showChart && (
        <Stack className="chart-heading" gap={0.5}>
          <Typography component="h2" variant="h6" sx={{ mt: "6px" }}>
            {
              timeRangeSelect.find((el) => el.value === filters.timeRange)
                ?.label
            }
            {" · "}
            {feed ? feed.name : "All hydrophones"}
          </Typography>
          {countString(detections)}
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
