import {
  Box,
  Container,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React from "react";

import { useData } from "@/context/DataContext";
import { Feed } from "@/graphql/generated";

import Link from "../Link";
import { timeRangeSelect } from "./CandidateListFilters";
import CandidatesList from "./CandidatesList";
import { CandidatesResults } from "./CandidatesResults";
import ReportsBarChart from "./ReportsBarChart";

export const CandidatesStack = ({
  feed,
  showChart = false,
}: {
  feed?: Feed;
  showChart?: boolean;
}) => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { filters } = useData();
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
      {!showChart && (
        <Typography component="h2" variant="h5" mb={2}>
          Recordings
        </Typography>
      )}
      {showChart && (
        <Stack className="chart-heading" gap={0.5}>
          <Typography component="h2" variant="h6">
            {
              timeRangeSelect.find((el) => el.value === filters.timeRange)
                ?.label
            }
          </Typography>
          <Stack direction={"row"} gap={1}>
            <Link href="#" sx={{ color: "rgba(255,255,255,.7)" }}>
              8 whale
            </Link>
            {" · "}
            <Link href="#" sx={{ color: "rgba(255,255,255,.7)" }}>
              5 vessel
            </Link>
            {" · "}
            <Link href="#" sx={{ color: "rgba(255,255,255,.7)" }}>
              2 other
            </Link>
            {" · "}
            <Link href="#" sx={{ color: "rgba(255,255,255,.7)" }}>
              3 sightings
            </Link>
          </Stack>
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
          <CandidatesResults viewType="list" feed={feed} />
          <Box sx={{ paddingTop: "1.5rem" }}></Box>
          <CandidatesList feed={feed} />
        </Box>
      </Stack>{" "}
    </Container>
  );
};
