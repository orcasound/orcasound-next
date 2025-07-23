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

import HydrophoneCard from "./HydrophoneCard";

export const HydrophonesStack = () => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const { feeds } = useData();

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        pb: "200px",
        mt: "24px",
      }}
    >
      <Typography component="h2" variant="h5" sx={{ mb: "1rem" }}>
        Listen Live
      </Typography>
      <Stack>
        <Box sx={{ overflow: mdDown ? "auto" : "initial" }}>
          <Stack spacing={2}>
            {feeds.map((feed) => {
              return <HydrophoneCard key={feed.id} feed={feed} />;
            })}
          </Stack>
        </Box>
      </Stack>{" "}
    </Container>
  );
};
