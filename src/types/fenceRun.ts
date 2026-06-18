export type FenceStyle = "panel" | "closeboard" | "featheredge";
export type GroundMode = "level" | "stepped" | "raked";
export type LayoutMode = "equal-bays" | "custom-bays";
export type EndCondition = "end-post" | "return-wall" | "existing-post";
export type FenceViewMode = "layout" | "setting-out" | "levels";

export interface FenceRunGateOpening {
  enabled: boolean;
  width: number;
  afterBayIndex: number;
}

export interface FenceBayOverride {
  width?: number;
  stepDrop?: number;
  locked?: boolean;
}

export interface FenceRunInputs {
  projectName: string;
  notes: string;
  totalRunLength: number;
  fenceHeight: number;
  fenceStyle: FenceStyle;
  layoutMode: LayoutMode;
  groundMode: GroundMode;
  postWidth: number;
  minBayWidth: number;
  preferredBayWidth: number;
  maxBayWidth: number;
  gravelBoardHeight: number;
  groundClearance: number;
  totalFall: number;
  startCondition: EndCondition;
  endCondition: EndCondition;
  gateOpening: FenceRunGateOpening;
  bayOverrides: FenceBayOverride[];
}

export interface FenceBayResult {
  index: number;
  width: number;
  clearWidth: number;
  height: number;
  stepDrop: number;
  xStart: number;
  xEnd: number;
  levelAtStart: number;
  levelAtEnd: number;
  warning?: string;
  source: "auto" | "manual";
  isCutBay?: boolean;
}

export interface FencePostResult {
  index: number;
  x: number;
  centre: number;
  width: number;
  type: "start" | "intermediate" | "end" | "gate-side";
}

export interface FenceGateResult {
  xStart: number;
  xEnd: number;
  width: number;
  afterBayIndex: number;
}

export interface FenceRunResults {
  bays: FenceBayResult[];
  posts: FencePostResult[];
  gate?: FenceGateResult;
  totalPosts: number;
  totalBays: number;
  averageBayWidth: number;
  minBayWidth: number;
  maxBayWidth: number;
  panelCount: number;
  gravelBoardCount: number;
  railCount: number;
  railPieceCount: number;
  cutRailLength?: number;
  stockJointPositions: number[];
  estimatedBoardCount?: number;
  rakeAngle: number;
  usedLength: number;
  warnings: string[];
  isValid: boolean;
}
