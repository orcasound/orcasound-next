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
import { cleanSightingsDescription } from "@/utils/masterDataHelpers";
import { formatTimestamp } from "@/utils/time";

export const DetectionsList = ({ array }: { array: CombinedData[] }) => {
  const userName = "Orcasound Listener";
  const aiName = "Orcahello AI";
  const sightingName = "Cascadia Trusted Observer";
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <List sx={{ px: 3, width: "100%" }}>
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
                  {formatTimestamp(el.timestampString)}
                </span>
                {` · ${el.newCategory}`}
                {el.comments && (
                  <>
                    <br />{" "}
                    {el.newCategory === "SIGHTING"
                      ? cleanSightingsDescription(el.comments)
                      : el.comments}
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
