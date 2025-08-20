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

export const HydrophonesStack = ({
  handlePlayPauseClick,
}: {
  handlePlayPauseClick: () => Promise<void>;
}) => {
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
      <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
        Listen Live
      </Typography>
      <Typography
        component="p"
        variant="body1"
        mb={2}
        sx={{ color: "rgba(255,255,255,.7)" }}
      >
        Alert the community when you hear something.
      </Typography>
      <Stack>
        <Box sx={{ overflow: mdDown ? "auto" : "initial" }}>
          <Stack spacing={2}>
            {feeds.map((feed) => {
              return (
                <HydrophoneCard
                  key={feed.id}
                  feed={feed}
                  handlePlayPauseClick={handlePlayPauseClick}
                />
              );
            })}
          </Stack>
        </Box>
      </Stack>{" "}
    </Container>
  );
};
