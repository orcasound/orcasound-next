import { Theme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Dispatch, ReactNode, SetStateAction } from "react";

import { MobileTab, useLayoutStore } from "@/stores/layoutStore";

type LayoutContextType = {
  alertOpen: boolean;
  setAlertOpen: Dispatch<SetStateAction<boolean>>;
  headerHeight: string;
  mobileMenuHeight: string;
  playbarExpanded: boolean;
  setPlaybarExpanded: Dispatch<SetStateAction<boolean>>;
  activeMobileTab: MobileTab | null;
  setActiveMobileTab: Dispatch<SetStateAction<MobileTab | null>>;
  candidatePreview: boolean;
  setCandidatePreview: Dispatch<SetStateAction<boolean>>;
  drawerContent: ReactNode | null;
  setDrawerContent: Dispatch<SetStateAction<ReactNode | null>>;
  drawerSide: "left" | "right";
  setDrawerSide: Dispatch<SetStateAction<"left" | "right">>;
  showPlayPrompt: boolean;
  setShowPlayPrompt: Dispatch<SetStateAction<boolean>>;
};

const alertHeight = "36px";
const desktopHeaderHeight = "64px";
const mobileHeaderHeight = "60px";
const mobileMenuHeight = "69px";

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useLayout = (): LayoutContextType => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const noAlertHeight = mdDown ? mobileHeaderHeight : desktopHeaderHeight;

  const {
    alertOpen,
    setAlertOpen,
    playbarExpanded,
    setPlaybarExpanded,
    activeMobileTab,
    setActiveMobileTab,
    candidatePreview,
    setCandidatePreview,
    drawerContent,
    setDrawerContent,
    drawerSide,
    setDrawerSide,
    showPlayPrompt,
    setShowPlayPrompt,
  } = useLayoutStore();

  const headerHeight = alertOpen
    ? `calc(${alertHeight} + ${noAlertHeight})`
    : noAlertHeight;

  return {
    alertOpen,
    setAlertOpen,
    headerHeight,
    mobileMenuHeight,
    playbarExpanded,
    setPlaybarExpanded,
    activeMobileTab,
    setActiveMobileTab,
    candidatePreview,
    setCandidatePreview,
    drawerContent,
    setDrawerContent,
    drawerSide,
    setDrawerSide,
    showPlayPrompt,
    setShowPlayPrompt,
  };
};
