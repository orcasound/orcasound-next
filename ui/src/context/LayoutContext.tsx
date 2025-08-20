import { Theme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

import AudioVisualizer from "@/components/PlayBar/AudioVisualizer";

type LayoutContextType = {
  alertOpen: boolean;
  setAlertOpen: Dispatch<SetStateAction<boolean>>;
  headerHeight: string;
  mobileMenuHeight: string;
  playbarExpanded: boolean;
  setPlaybarExpanded: Dispatch<SetStateAction<boolean>>;
  mobileTab: number;
  setMobileTab: Dispatch<SetStateAction<number>>;
  candidatePreview: boolean;
  setCandidatePreview: Dispatch<SetStateAction<boolean>>;
  drawerContent: ReactNode | null;
  setDrawerContent: Dispatch<SetStateAction<ReactNode | null>>;
  drawerSide: "left" | "right";
  setDrawerSide: Dispatch<SetStateAction<"left" | "right">>;
  showPlayPrompt: boolean;
  setShowPlayPrompt: Dispatch<SetStateAction<boolean>>;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

const alertHeight = "36px";
const desktopHeaderHeight = "64px";
const mobileHeaderHeight = "60px";
const mobileMenuHeight = "69px";

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(true);

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const noAlertHeight = mdDown ? mobileHeaderHeight : desktopHeaderHeight;

  const headerHeight = alertOpen
    ? `calc(${alertHeight} + ${noAlertHeight})`
    : noAlertHeight;

  const [playbarExpanded, setPlaybarExpanded] = useState(false);

  const [candidatePreview, setCandidatePreview] = useState(true);

  const [drawerContent, setDrawerContent] = useState<ReactNode | null>(
    <AudioVisualizer key="default" />,
  );

  const [drawerSide, setDrawerSide] = useState<"left" | "right">("right");

  const [showPlayPrompt, setShowPlayPrompt] = useState<boolean>(false);

  // menuTab is the state of the mobile <MobileBottomNav>
  const [mobileTab, setMobileTab] = useState(0);

  return (
    <LayoutContext.Provider
      value={{
        alertOpen,
        setAlertOpen,
        headerHeight,
        mobileMenuHeight,
        playbarExpanded,
        setPlaybarExpanded,
        mobileTab,
        setMobileTab,
        candidatePreview,
        setCandidatePreview,
        drawerContent,
        setDrawerContent,
        drawerSide,
        setDrawerSide,
        showPlayPrompt,
        setShowPlayPrompt,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
