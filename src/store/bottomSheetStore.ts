import { ReactNode } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type BottomSheetState = {
  content: ReactNode | null;
  isVisible: boolean;
  setContent: (content: ReactNode) => void;
  present: () => void;
  resetContent: () => void;
};

export const useBottomSheetStore = create<BottomSheetState>()(
  devtools(
    immer((set) => ({
      content: null,
      isVisible: false,
      setContent: (content: ReactNode) =>
        set((state) => {
          state.content = content;
        }),
      present: () =>
        set((state) => {
          state.isVisible = true;
        }),
      resetContent: () =>
        set((state) => {
          state.content = null;
          state.isVisible = false;
        }),
    })),
  ),
);
