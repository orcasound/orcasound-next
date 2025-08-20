import {
  BookmarkBorder,
  ChatBubbleOutline,
  FileDownloadOutlined,
} from "@mui/icons-material";
import { Box, Button, Theme, useMediaQuery } from "@mui/material";

const upvote = (
  <svg
    width="17"
    height="18"
    viewBox="0 0 17 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.94695 17.3304V10.4059H0.619141L8.4092 0.884766L16.1993 10.4059H11.8714V17.3304H4.94695ZM6.67807 15.5993H10.1403V8.67482H12.5423L8.4092 3.61129L4.27614 8.67482H6.67807V15.5993Z"
      fill="currentColor"
      fillOpacity="0.75"
    />
  </svg>
);

const downvote = (
  <svg
    width="17"
    height="18"
    viewBox="0 0 17 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.18425 0.751589V7.67608H0.856445L8.6465 17.1973L16.4366 7.67608H12.1087V0.751589H5.18425ZM6.91538 2.48271H10.3776V9.40721H12.7796L8.6465 14.4707L4.51344 9.40721H6.91538V2.48271Z"
      fill="currentColor"
      fillOpacity="0.75"
    />
  </svg>
);

const shareIcon = (
  <svg
    width="17"
    height="13"
    viewBox="0 0 17 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.9678 12.5983L9.75601 11.3649L12.8504 8.27053H4.47608C3.39413 8.27053 2.47447 7.89184 1.7171 7.13448C0.959738 6.37711 0.581055 5.45745 0.581055 4.3755C0.581055 3.29355 0.959738 2.37389 1.7171 1.61652C2.47447 0.859152 3.39413 0.480469 4.47608 0.480469H4.90886V2.21159H4.47608C3.87019 2.21159 3.35807 2.42077 2.93971 2.83913C2.52136 3.25748 2.31218 3.7696 2.31218 4.3755C2.31218 4.98139 2.52136 5.49352 2.93971 5.91187C3.35807 6.33022 3.87019 6.5394 4.47608 6.5394H12.8504L9.75601 3.42338L10.9678 2.21159L16.1612 7.40496L10.9678 12.5983Z"
      fill="currentColor"
      fillOpacity="0.75"
    />
  </svg>
);

export default function CommunityBar({
  votes,
  downloadReady = false,
  audioUrl,
  clipId,
}: {
  votes: number;
  downloadReady?: boolean;
  audioUrl?: string | undefined;
  clipId?: string;
}) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <Box
      className="community-bar"
      sx={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Box className="upvote-button">
        <Button
          variant="outlined"
          sx={{
            borderRadius: 100,
            p: "6px 12px",
            display: "flex",
            gap: "8px",
            lineHeight: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              height: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {upvote}
            {votes}
            {downvote}
          </div>
        </Button>
      </Box>
      <Button
        variant="outlined"
        sx={{
          borderRadius: 100,
          p: "6px 12px",
          display: "flex",
          gap: "8px",
          lineHeight: 1,
          minWidth: 0,
          minHeight: "20px",
        }}
      >
        <ChatBubbleOutline
          sx={{
            opacity: 0.75,
            height: "20px",
          }}
        />
        0
      </Button>
      <Button
        variant="outlined"
        sx={{
          borderRadius: 100,
          p: "6px 12px",
          display: "flex",
          gap: "8px",
          lineHeight: 1,
          minWidth: 0,
          minHeight: "20px",
        }}
      >
        <BookmarkBorder
          sx={{
            opacity: 0.75,
            height: "20px",
          }}
        />
      </Button>
      <Button
        variant="outlined"
        sx={{
          borderRadius: 100,
          p: "6px 12px",
          display: "flex",
          gap: "8px",
          lineHeight: 1,
          minWidth: 0,
          textTransform: "none",
        }}
      >
        <div
          style={{
            height: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {shareIcon}
        </div>
        {mdDown ? "" : "Share"}
      </Button>
      {downloadReady && (
        <Button
          variant="contained"
          href={audioUrl ? audioUrl : ""}
          download={`clip-${clipId}.mp3`}
          sx={{
            borderRadius: 100,
            p: "6px 12px",
            display: "flex",
            gap: "8px",
            lineHeight: 1,
            minWidth: 0,
            minHeight: "20px",
            backgroundColor: "accent3.main",
            textTransform: "none",
          }}
        >
          <FileDownloadOutlined
            sx={{
              opacity: 0.75,
              height: "20px",
              color: "background.default",
            }}
          />
        </Button>
      )}
    </Box>
  );
}
