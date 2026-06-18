import { create } from "zustand";
import type { GateInputs } from "@/types/gate";

export const defaultGateInputs: GateInputs = {
  projectName: "New gate project",
  gateWidth: 900,
  gateHeight: 1800,
  stileWidth: 88,
  railWidth: 88,
  topRailPosition: 50,
  middleRailPosition: 750,
  bottomRailPosition: 1450,
  boardWidth: 100,
  boardOverlap: 25,
  braceDirection: "bottom-left"
};

interface GateState {
  inputs: GateInputs;
  setInputs: (inputs: GateInputs) => void;
  reset: () => void;
}

export const useGateStore = create<GateState>((set) => ({
  inputs: defaultGateInputs,
  setInputs: (inputs) => set({ inputs }),
  reset: () => set({ inputs: defaultGateInputs })
}));
