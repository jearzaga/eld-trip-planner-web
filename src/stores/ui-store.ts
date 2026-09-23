import { create } from 'zustand';

type UiState = {
  selectedStopSeq: number | null;
  activeLogDay: number;
  selectStop: (seq: number | null) => void;
  setActiveLogDay: (day: number) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedStopSeq: null,
  activeLogDay: 1,
  selectStop: (seq) => set({ selectedStopSeq: seq }),
  setActiveLogDay: (day) => set({ activeLogDay: day }),
}));
