import { create } from "zustand";

type OpenSheet = { id: string; dismiss: () => void };

export const useSheetNavigationStore = create<{
  sheets: OpenSheet[];
  open: (sheet: OpenSheet) => void;
  close: (id: string) => void;
}>((set) => ({
  sheets: [],
  open: (sheet) =>
    set((state) => ({
      sheets: [...state.sheets.filter(({ id }) => id !== sheet.id), sheet],
    })),
  close: (id) =>
    set((state) => ({
      sheets: state.sheets.filter((sheet) => sheet.id !== id),
    })),
}));

export function dismissTopSheet() {
  const sheet = useSheetNavigationStore.getState().sheets.at(-1);
  if (!sheet) return false;
  sheet.dismiss();
  return true;
}
