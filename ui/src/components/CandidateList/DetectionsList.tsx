import {
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Theme,
  useMediaQuery,
} from "@mui/material";

import { CombinedData } from "@/types/DataTypes";

export const DetectionsList = ({ array }: { array: CombinedData[] }) => {
  const userName = "Orcasound Listener";
  const aiName = "Orcahello AI";
  const sightingName = "Cascadia Trusted Observer";
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <List sx={{ mx: 3 }}>
      {array?.map((el, index) => (
        <ListItemButton
          key={index}
          sx={{
            px: 0,
            borderTop: index !== 0 ? "1px solid rgba(255,255,255,.25)" : "none",
          }}
        >
          {/* <ListItemAvatar>
            <AccountCircle style={{ fontSize: 40, opacity: 0.9 }} />
          </ListItemAvatar> */}
          <ListItemText
            className="list-item-text"
            primary={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  mb: ".25em",
                }}
              >
                {/* <AccountCircle style={{ fontSize: "1.5em", opacity: 0.9 }} /> */}
                {el.newCategory === "WHALE (AI)"
                  ? aiName
                  : el.newCategory === "SIGHTING"
                    ? sightingName
                    : userName}
              </Box>
            }
            secondary={
              <>
                <span style={{ color: "#fff" }}>
                  {new Date(el.timestampString).toLocaleTimeString()}
                </span>
                {` · ${el.newCategory}`}
                {el.comments && (
                  <>
                    <br /> {el.comments}
                  </>
                )}
              </>
            }
          />
          <ListItemAvatar sx={{ display: "flex", opacity: "0.9" }}>
            <Box sx={{ padding: "0 8px" }} />
            <Box sx={{ padding: "0 8px" }} />
          </ListItemAvatar>
        </ListItemButton>
      ))}
    </List>
  );
};
