import { Box, Stack, Theme, useMediaQuery } from "@mui/material";
import React from "react";

import ReportsBarChart from "@/components/CandidateList/ReportsBarChart";
import { useData } from "@/context/DataContext";

import CandidateListFilters from "./CandidateListFilters";
import { CandidatesResults } from "./CandidatesResults";

export const VisualizationsStack = () => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { sortedCandidates } = useData();
  return (
    <Stack>
      <CandidateListFilters />
      <Box sx={{ paddingTop: "1.5rem", overflow: mdDown ? "auto" : "initial" }}>
        <CandidatesResults viewType="chart" candidates={sortedCandidates} />
        <Box sx={{ paddingTop: "1.5rem" }}></Box>
        <ReportsBarChart />
      </Box>
    </Stack>
  );
};
