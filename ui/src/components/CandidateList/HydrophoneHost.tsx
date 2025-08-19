import { Paper, Typography } from "@mui/material";
import Link from "next/link";

const hosts = [
  {
    hydrophone: "orcasound-lab",
    name: "Beam Reach",
    link: "http://www.beamreach.blue/",
  },
  {
    hydrophone: "north-sjc",
    name: "Orca Behavior Institute",
    link: "https://www.orcabehaviorinstitute.org/",
  },
  {
    hydrophone: "sunset-bay",
    name: "Beach Camp at Sunset Bay",
    link: "https://www.sunsetbaywharf.com/",
  },
  {
    hydrophone: "port-townsend",
    name: "Port Townsend Marine Science Center",
    link: "http://www.ptmsc.org/",
  },
  {
    hydrophone: "bush-point",
    name: "Orca Network",
    link: "https://orcanetwork.org/",
  },
];

export const HydrophoneHost = ({
  feedSlug,
}: {
  feedSlug: string | undefined;
}) => {
  const host = hosts.find((host) => feedSlug === host.hydrophone) || hosts[0];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "accent1.main",
        p: 2,
        borderRadius: 1,
      }}
    >
      <Typography variant="body2">
        Hosted by <strong>{host?.name}</strong>
        <br />
        <Link href={host?.link} target="_blank" rel="noopener">
          Learn more or donate
        </Link>{" "}
        to support their work.
      </Typography>
    </Paper>
  );
};
