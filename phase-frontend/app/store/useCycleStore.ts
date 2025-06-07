import { create } from "zustand";
import { PhaseInfo } from "../logic/cycleCalculator";

interface CycleState {
  phaseInfo: PhaseInfo | null;
  setPhaseInfo: (info: PhaseInfo | null) => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  phaseInfo: null,
  setPhaseInfo: (info) => set({ phaseInfo: info }),
}));
