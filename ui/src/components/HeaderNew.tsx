import { Close, Menu } from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Collapse,
  Drawer,
  IconButton,
  List,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

import Link from "@/components/Link";
import { useLayout } from "@/context/LayoutContext";
import wordmark from "@/public/wordmark/wordmark-white.svg";
import { displayDesktopOnly, displayMobileOnly } from "@/styles/responsive";
import { analytics } from "@/utils/analytics";

import CandidateListFilters from "./CandidateList/CandidateListFilters";

export default function HeaderNew({
  onBrandClick,
  tabs,
}: {
  onBrandClick?: () => void;
  tabs?: ReactNode;
}) {
  const { alertOpen, setAlertOpen } = useLayout();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  useEffect(() => {
    if (mdDown) {
      setAlertOpen(false);
    }
  }, [mdDown, setAlertOpen]);

  return (
    <AppBar
      // position="sticky"
      // position={mdDown ? "fixed" : "static"} // needed this to be fixed to avoid issue with 100vh preventing scroll on mobile
      color="primary"
      position={"static"}
      sx={{
        // Keep header above the side drawer
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Collapse in={alertOpen}>
        <Alert
          severity="info"
          variant="filled"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setAlertOpen(false);
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          sx={{
            borderRadius: 0,
            justifyContent: "center",
            paddingY: 0,
            "& .MuiAlert-action": {
              marginLeft: 0,
            },
          }}
        >
          ORCA CONSERVANCY —{" "}
          <a style={{ textDecoration: "underline", color: "#fff" }}>
            Salmon habitat restoration work party Jun 20.{" "}
          </a>
        </Alert>
      </Collapse>{" "}
      <Toolbar>
        <Mobile onBrandClick={onBrandClick} />
        <Desktop tabs={tabs} />
      </Toolbar>
    </AppBar>
  );
}

function Mobile({
  window,
  onBrandClick,
}: {
  window?: () => Window;
  onBrandClick?: () => void;
}) {
  const drawerWidth = "100%";
  const [menuIsOpen, setMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const handleMenuToggle = () => {
    setMenuOpen(!menuIsOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={displayMobileOnly} width={1}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          justifyContent: "space-between",
          height: "48px",
        }}
      >
        <Brand onClick={onBrandClick} />
        <IconButton
          sx={{
            // backgroundColor: "rgba(255,255,255,.15)",
            // padding: "6px !important",
            // borderRadius: "4px",
            padding: "0px !important",
          }}
          color="inherit"
          onClick={handleMenuToggle}
        >
          {menuIsOpen ? <Close /> : <Menu />}
        </IconButton>
      </Box>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={menuIsOpen}
          onClose={handleMenuToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
            BackdropProps: {
              style: { backgroundColor: "transparent" },
            },
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "base.main",
              marginTop: (theme) => `${theme.mixins.toolbar.minHeight}px`,
            },
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Box
            onClick={handleMenuToggle}
            sx={{ textAlign: "center", height: "100%" }}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <List sx={{ maxWidth: (theme) => theme.breakpoints.values.sm }}>
              <CandidateListFilters
                showFilters={showFilters}
                setShowFilters={setShowFilters}
              />
            </List>
          </Box>
        </Drawer>
      </nav>
    </Box>
  );
}

function Desktop({ tabs }: { tabs?: ReactNode }) {
  const [showFilters, setShowFilters] = useState(false);
  return (
    <Box sx={{ ...displayDesktopOnly, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: 1,
        }}
      >
        <Brand />

        <Box sx={{ flex: 1, marginLeft: "3rem" }}>{tabs}</Box>

        <Box
          className="header-buttons"
          sx={{ display: "flex", gap: "12px", py: "1rem" }}
        >
          <Button
            href="#"
            size="small"
            variant="outlined"
            sx={{ whiteSpace: "nowrap", maxHeight: "31px" }}
          >
            Sign up
          </Button>
          <Button
            href="#"
            size="small"
            variant="contained"
            sx={{ whiteSpace: "nowrap", maxHeight: "31px" }}
          >
            Log in
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Typography variant="h6" noWrap overflow="visible">
      <Link
        href="/"
        color="inherit"
        underline="none"
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => {
          if (onClick) onClick();
          analytics.nav.logoClicked();
        }}
      >
        <Image
          src={wordmark.src}
          alt="Orcasound"
          width={120}
          height={48}
          priority={true}
          style={{ marginTop: "-2px" }}
        />
      </Link>
    </Typography>
  );
}
