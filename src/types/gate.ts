export type BraceDirection = "bottom-left" | "bottom-right";

export interface GateInputs {
  projectName: string;
  gateWidth: number;
  gateHeight: number;
  stileWidth: number;
  railWidth: number;
  topRailPosition: number;
  middleRailPosition: number;
  bottomRailPosition: number;
  boardWidth: number;
  boardOverlap: number;
  braceDirection: BraceDirection;
}

export interface GateResults {
  internalWidth: number;
  internalHeight: number;
  railLength: number;
  stileLength: number;
  braces: Array<{
    name: string;
    verticalRise: number;
    length: number;
    angle: number;
    cutAngle: number;
    shortEndLength: number;
  }>;
  boardCount: number;
  actualOverlap: number;
  boardCoverage: number;
  boardEndTrim: number;
  frameTimberLength: number;
  boardTimberLength: number;
  totalTimberLength: number;
  stockLength: number;
  stockCount: number;
  stockWaste: number;
  stockCutPlan: Array<{
    cuts: Array<{ name: string; length: number }>;
    used: number;
    waste: number;
  }>;
}
