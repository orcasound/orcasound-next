import { ReactNode, SetStateAction } from "react";
import { create } from "zustand";

import AudioVisualizer from "@/components/PlayBar/AudioVisualizer";

export type MobileTab = {
  label: string | undefined;
  value: string | undefined;
  content: ReactNode;
};

type LayoutStore = {
  alertOpen: boolean;
  playbarExpanded: boolean;
  activeMobileTab: MobileTab | null;
  candidatePreview: boolean;
  drawerContent: ReactNode | null;
  drawerSide: "left" | "right";
  showPlayPrompt: boolean;
  setAlertOpen: (value: SetStateAction<boolean>) => void;
  setPlaybarExpanded: (value: SetStateAction<boolean>) => void;
  setActiveMobileTab: (value: SetStateAction<MobileTab | null>) => void;
  setCandidatePreview: (value: SetStateAction<boolean>) => void;
  setDrawerContent: (value: SetStateAction<ReactNode | null>) => void;
  setDrawerSide: (value: SetStateAction<"left" | "right">) => void;
  setShowPlayPrompt: (value: SetStateAction<boolean>) => void;
};

function resolveSetState<T>(value: SetStateAction<T>, prev: T): T {
  if (typeof value === "function") {
    return (value as (prevState: T) => T)(prev);
  }
  return value;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  alertOpen: true,
  playbarExpanded: false,
  activeMobileTab: null,
  candidatePreview: true,
  drawerContent: <AudioVisualizer key="default" />,
  drawerSide: "right",
  showPlayPrompt: false,
  setAlertOpen: (value) =>
    set((state) => ({ alertOpen: resolveSetState(value, state.alertOpen) })),
  setPlaybarExpanded: (value) =>
    set((state) => ({
      playbarExpanded: resolveSetState(value, state.playbarExpanded),
    })),
  setActiveMobileTab: (value) =>
    set((state) => ({
      activeMobileTab: resolveSetState(value, state.activeMobileTab),
    })),
  setCandidatePreview: (value) =>
    set((state) => ({
      candidatePreview: resolveSetState(value, state.candidatePreview),
    })),
  setDrawerContent: (value) =>
    set((state) => ({
      drawerContent: resolveSetState(value, state.drawerContent),
    })),
  setDrawerSide: (value) =>
    set((state) => ({ drawerSide: resolveSetState(value, state.drawerSide) })),
  setShowPlayPrompt: (value) =>
    set((state) => ({
      showPlayPrompt: resolveSetState(value, state.showPlayPrompt),
    })),
}));
