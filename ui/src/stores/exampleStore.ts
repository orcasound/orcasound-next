import { create } from "zustand";

type ExampleStore = {
  myState: boolean;
  setMyState: (value: boolean) => void;
  toggleMyState: () => void;
};

export const useExampleStore = create<ExampleStore>((set) => ({
  myState: true,
  setMyState: (value) => set({ myState: value }),
  toggleMyState: () => set((state) => ({ myState: !state.myState })),
}));
