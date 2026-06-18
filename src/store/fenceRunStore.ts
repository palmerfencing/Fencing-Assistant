import { create } from "zustand";
import type { FenceBayOverride, FenceRunInputs } from "@/types/fenceRun";

export const defaultFenceRunInputs: FenceRunInputs = {
  projectName: "New fence run",
  notes: "",
  totalRunLength: 12000,
  fenceHeight: 1800,
  fenceStyle: "featheredge",
  layoutMode: "equal-bays",
  groundMode: "level",
  postWidth: 100,
  minBayWidth: 2400,
  preferredBayWidth: 2400,
  maxBayWidth: 2400,
  gravelBoardHeight: 150,
  groundClearance: 25,
  totalFall: 0,
  startCondition: "end-post",
  endCondition: "end-post",
  gateOpening: {
    enabled: false,
    width: 1000,
    afterBayIndex: 1
  },
  bayOverrides: []
};

interface FenceRunState {
  inputs: FenceRunInputs;
  setInputs: (inputs: FenceRunInputs) => void;
  patchInputs: (patch: Partial<FenceRunInputs>) => void;
  setBayOverride: (index: number, override: FenceBayOverride) => void;
  initialiseOverrides: (count: number, widths: number[]) => void;
  clearOverrides: () => void;
  reset: () => void;
}

export const useFenceRunStore = create<FenceRunState>((set) => ({
  inputs: defaultFenceRunInputs,
  setInputs: (inputs) => set({ inputs }),
  patchInputs: (patch) => set((state) => ({ inputs: { ...state.inputs, ...patch } })),
  setBayOverride: (index, override) => set((state) => {
    const bayOverrides = Array.from(
      { length: Math.max(state.inputs.bayOverrides.length, index + 1) },
      (_, itemIndex) => state.inputs.bayOverrides[itemIndex] ?? {}
    );
    bayOverrides[index] = { ...bayOverrides[index], ...override };
    return {
      inputs: {
        ...state.inputs,
        layoutMode: bayOverrides.some((item) => item.locked) ? "custom-bays" : "equal-bays",
        bayOverrides
      }
    };
  }),
  initialiseOverrides: (count, widths) => set((state) => ({
    inputs: {
      ...state.inputs,
      bayOverrides: Array.from(
        { length: count },
        (_, index) => state.inputs.bayOverrides[index] ?? { width: widths[index], locked: false }
      )
    }
  })),
  clearOverrides: () => set((state) => ({
    inputs: { ...state.inputs, layoutMode: "equal-bays", bayOverrides: [] }
  })),
  reset: () => set({ inputs: defaultFenceRunInputs })
}));
