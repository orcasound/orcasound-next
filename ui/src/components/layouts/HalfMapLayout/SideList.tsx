import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

type SideListProps = {
  children: React.ReactNode;
  position?: "left" | "right";
};

export const SideList = ({ children, position = "left" }: SideListProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (position === "left") {
      // Restore previous scroll position
      const saved = sessionStorage.getItem("sideScrollY-left");
      if (saved) el.scrollTop = parseInt(saved, 10);

      const handleScroll = () => {
        sessionStorage.setItem("sideScrollY-left", el.scrollTop.toString());
      };

      el.addEventListener("scroll", handleScroll);

      return () => {
        el.removeEventListener("scroll", handleScroll);
      };
    } else {
      // Always reset scroll for right
      el.scrollTop = 0;
    }
  }, [router.asPath, position]);

  return (
    <Box
      className="side-list"
      ref={scrollRef}
      sx={{
        borderRightColor: "divider",
        borderRightStyle: "solid",
        borderRightWidth: 1,
        width: "25%",
        // minWidth: "367px",
        // maxWidth: "550px",
        overflow: "auto",
        position: "relative",
      }}
    >
      {children}
    </Box>
  );
};
