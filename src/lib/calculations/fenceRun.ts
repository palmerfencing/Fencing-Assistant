import type {
  FenceBayOverride,
  FenceRunInputs,
  FenceRunResults
} from "@/types/fenceRun";

const MAX_BAYS = 60;
const FEATHEREDGE_BAY_CENTRES = 2400;
const FEATHEREDGE_RAIL_LENGTH = 4800;
const FEATHEREDGE_RAILS_PER_BAY = 3;

function groundLevels(
  inputs: FenceRunInputs,
  bays: FenceRunResults["bays"],
  xStart: number,
  xEnd: number,
  stepDropOverride = 0
) {
  if (inputs.groundMode === "raked") {
    return {
      levelAtStart: inputs.totalFall * (xStart / Math.max(1, inputs.totalRunLength)),
      levelAtEnd: inputs.totalFall * (xEnd / Math.max(1, inputs.totalRunLength)),
      stepDrop: 0
    };
  }
  if (inputs.groundMode === "stepped") {
    const defaultDrop = inputs.totalFall / Math.max(1, Math.ceil(inputs.totalRunLength / FEATHEREDGE_BAY_CENTRES));
    return {
      levelAtStart: bays.reduce((sum, bay) => sum + bay.stepDrop, 0),
      levelAtEnd: bays.reduce((sum, bay) => sum + bay.stepDrop, 0),
      stepDrop: stepDropOverride || defaultDrop
    };
  }
  return { levelAtStart: 0, levelAtEnd: 0, stepDrop: 0 };
}

function calculateFeatheredgeRun(inputs: FenceRunInputs): FenceRunResults {
  if (inputs.totalRunLength <= 0 || inputs.postWidth <= 0) {
    return {
      bays: [],
      posts: [],
      totalPosts: 0,
      totalBays: 0,
      averageBayWidth: 0,
      minBayWidth: 0,
      maxBayWidth: 0,
      panelCount: 0,
      gravelBoardCount: 0,
      railCount: 0,
      railPieceCount: 0,
      stockJointPositions: [],
      rakeAngle: 0,
      usedLength: 0,
      warnings: ["Enter a run length greater than zero."],
      isValid: false
    };
  }

  const hasStartPost = inputs.startCondition === "end-post";
  const startCentre = hasStartPost ? inputs.postWidth / 2 : 0;
  const postCentres = [startCentre];
  for (let centre = FEATHEREDGE_BAY_CENTRES; centre < inputs.totalRunLength; centre += FEATHEREDGE_BAY_CENTRES) {
    if (centre > startCentre) postCentres.push(centre);
  }
  if (inputs.totalRunLength > startCentre && postCentres[postCentres.length - 1] !== inputs.totalRunLength) {
    postCentres.push(inputs.totalRunLength);
  }
  const bayWidths = postCentres.slice(1).map((centre, index) => centre - postCentres[index]);
  const bays: FenceRunResults["bays"] = [];
  const posts: FenceRunResults["posts"] = [];
  const warnings: string[] = [];

  if (bayWidths.length === 0) {
    return {
      bays: [],
      posts: [],
      totalPosts: 0,
      totalBays: 0,
      averageBayWidth: 0,
      minBayWidth: 0,
      maxBayWidth: 0,
      panelCount: 0,
      gravelBoardCount: 0,
      railCount: 0,
      railPieceCount: 0,
      stockJointPositions: [],
      rakeAngle: 0,
      usedLength: 0,
      warnings: ["The run must extend beyond the start post centre."],
      isValid: false
    };
  }

  postCentres.forEach((centre, index) => {
    posts.push({
      index,
      centre,
      x: centre - inputs.postWidth / 2,
      width: inputs.postWidth,
      type: index === 0 ? "start" : index === postCentres.length - 1 ? "end" : "intermediate"
    });
  });

  bayWidths.forEach((width, index) => {
    const xStart = postCentres[index];
    const xEnd = postCentres[index + 1];
    const isLastBay = index === bayWidths.length - 1;
    const isCutBay = isLastBay && inputs.totalRunLength % FEATHEREDGE_BAY_CENTRES > 0.5;
    const levels = groundLevels(inputs, bays, xStart, xEnd);
    bays.push({
      index,
      width,
      clearWidth: Math.max(0, width - inputs.postWidth),
      height: inputs.fenceHeight,
      xStart,
      xEnd,
      source: "auto",
      isCutBay,
      ...levels
    });
  });

  const finalStockLength = inputs.totalRunLength % FEATHEREDGE_RAIL_LENGTH;
  const stockJointPositions = Array.from(
    { length: Math.floor((inputs.totalRunLength - 0.5) / FEATHEREDGE_RAIL_LENGTH) },
    (_, index) => (index + 1) * FEATHEREDGE_RAIL_LENGTH
  );
  const cutBay = bays.find((bay) => bay.isCutBay);
  if (cutBay) {
    warnings.push(`End post span is a cut bay at ${Math.round(cutBay.width)} mm c/c.`);
  }
  if (inputs.gateOpening.enabled) {
    warnings.push("Gate placement is not applied to fixed 2.4 m featheredge centres.");
  }

  const stockLengthsPerRun = Math.ceil(inputs.totalRunLength / FEATHEREDGE_RAIL_LENGTH);
  const railStockCount = Math.ceil(
    (inputs.totalRunLength * FEATHEREDGE_RAILS_PER_BAY) / FEATHEREDGE_RAIL_LENGTH
  );

  return {
    bays,
    posts,
    totalPosts: posts.length,
    totalBays: bays.length,
    averageBayWidth: bayWidths.reduce((sum, width) => sum + width, 0) / Math.max(1, bays.length),
    minBayWidth: Math.min(...bayWidths),
    maxBayWidth: Math.max(...bayWidths),
    panelCount: 0,
    gravelBoardCount: stockLengthsPerRun,
    railCount: railStockCount,
    railPieceCount: FEATHEREDGE_RAILS_PER_BAY,
    cutRailLength: finalStockLength > 0.5 ? finalStockLength : undefined,
    stockJointPositions,
    estimatedBoardCount: Math.ceil((inputs.totalRunLength / FEATHEREDGE_BAY_CENTRES) * 20),
    rakeAngle: inputs.groundMode === "raked"
      ? Math.atan2(inputs.totalFall, inputs.totalRunLength) * (180 / Math.PI)
      : 0,
    usedLength: inputs.totalRunLength,
    warnings,
    isValid: bays.length > 0
  };
}

function postCountFor(bayCount: number, hasGate: boolean) {
  return bayCount + 1 + (hasGate ? 1 : 0);
}

function availableBayLength(inputs: FenceRunInputs, bayCount: number) {
  const gateWidth = inputs.gateOpening.enabled ? inputs.gateOpening.width : 0;
  const postLength = postCountFor(bayCount, inputs.gateOpening.enabled) * inputs.postWidth;
  return inputs.totalRunLength - gateWidth - postLength;
}

function candidatePenalty(inputs: FenceRunInputs, bayCount: number) {
  const available = availableBayLength(inputs, bayCount);
  if (available <= 0) return Number.POSITIVE_INFINITY;
  const width = available / bayCount;
  const under = Math.max(0, inputs.minBayWidth - width);
  const over = Math.max(0, width - inputs.maxBayWidth);
  const preferredDelta = Math.abs(width - inputs.preferredBayWidth);
  return under * under * 100 + over * over * 100 + preferredDelta * preferredDelta;
}

function chooseBayCount(inputs: FenceRunInputs) {
  if (inputs.bayOverrides.length > 0) return inputs.bayOverrides.length;

  let bestCount = 1;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let count = 1; count <= MAX_BAYS; count += 1) {
    const penalty = candidatePenalty(inputs, count);
    if (penalty < bestPenalty) {
      bestCount = count;
      bestPenalty = penalty;
    }
  }
  return bestCount;
}

function distributeBayWidths(
  inputs: FenceRunInputs,
  bayCount: number,
  available: number
) {
  const overrides: FenceBayOverride[] = Array.from(
    { length: bayCount },
    (_, index) => inputs.bayOverrides[index] ?? {}
  );
  const lockedTotal = overrides.reduce(
    (sum, override) => sum + (override.locked ? Math.max(0, override.width ?? 0) : 0),
    0
  );
  const unlockedCount = overrides.filter((override) => !override.locked).length;
  const autoWidth = unlockedCount > 0 ? (available - lockedTotal) / unlockedCount : 0;

  return overrides.map((override) => ({
    width: override.locked ? Math.max(0, override.width ?? 0) : autoWidth,
    stepDrop: Math.max(0, override.stepDrop ?? 0),
    source: override.locked ? ("manual" as const) : ("auto" as const)
  }));
}

function boardEstimate(inputs: FenceRunInputs, totalClearWidth: number) {
  if (inputs.fenceStyle === "panel") return undefined;
  const effectiveBoardCover = inputs.fenceStyle === "closeboard" ? 100 : 125;
  return Math.ceil(totalClearWidth / effectiveBoardCover);
}

export function calculateFenceRun(inputs: FenceRunInputs): FenceRunResults {
  if (inputs.fenceStyle === "featheredge") {
    return calculateFeatheredgeRun(inputs);
  }

  const warnings: string[] = [];
  const bayCount = chooseBayCount(inputs);
  const available = availableBayLength(inputs, bayCount);

  if (inputs.totalRunLength <= 0 || inputs.postWidth <= 0 || available <= 0) {
    return {
      bays: [],
      posts: [],
      totalPosts: 0,
      totalBays: 0,
      averageBayWidth: 0,
      minBayWidth: 0,
      maxBayWidth: 0,
      panelCount: 0,
      gravelBoardCount: 0,
      railCount: 0,
      railPieceCount: 0,
      stockJointPositions: [],
      rakeAngle: 0,
      usedLength: 0,
      warnings: ["The run is too short for the selected posts and gate opening."],
      isValid: false
    };
  }

  const distributed = distributeBayWidths(inputs, bayCount, available);
  const distributedTotal = distributed.reduce((sum, bay) => sum + bay.width, 0);
  if (distributed.some((bay) => bay.width <= 0) || Math.abs(distributedTotal - available) > 1) {
    warnings.push("Locked bay widths leave no usable space for the remaining bays.");
  }

  const gateAfter = Math.min(
    bayCount,
    Math.max(0, Math.round(inputs.gateOpening.afterBayIndex))
  );
  const posts: FenceRunResults["posts"] = [];
  const bays: FenceRunResults["bays"] = [];
  let gate: FenceRunResults["gate"];
  let cursor = 0;
  let postIndex = 0;

  const addPost = (type: FenceRunResults["posts"][number]["type"]) => {
    posts.push({
      index: postIndex,
      x: cursor,
      centre: cursor + inputs.postWidth / 2,
      width: inputs.postWidth,
      type
    });
    postIndex += 1;
    cursor += inputs.postWidth;
  };

  addPost("start");

  for (let index = 0; index <= bayCount; index += 1) {
    if (inputs.gateOpening.enabled && gateAfter === index) {
      const xStart = cursor;
      cursor += inputs.gateOpening.width;
      gate = {
        xStart,
        xEnd: cursor,
        width: inputs.gateOpening.width,
        afterBayIndex: gateAfter
      };
      addPost(index === bayCount ? "end" : "gate-side");
    }

    if (index === bayCount) break;

    const item = distributed[index];
    const xStart = cursor;
    cursor += item.width;
    const progressStart = xStart / inputs.totalRunLength;
    const progressEnd = cursor / inputs.totalRunLength;
    let levelAtStart = 0;
    let levelAtEnd = 0;
    let stepDrop = 0;

    if (inputs.groundMode === "raked") {
      levelAtStart = inputs.totalFall * progressStart;
      levelAtEnd = inputs.totalFall * progressEnd;
    } else if (inputs.groundMode === "stepped") {
      const defaultDrop = inputs.totalFall / Math.max(1, bayCount);
      stepDrop = item.stepDrop || defaultDrop;
      levelAtStart = bays.reduce((sum, bay) => sum + bay.stepDrop, 0);
      levelAtEnd = levelAtStart;
    }

    let warning: string | undefined;
    if (item.width < inputs.minBayWidth) {
      warning = `Bay ${index + 1} is ${Math.round(inputs.minBayWidth - item.width)} mm below the preferred minimum.`;
    } else if (item.width > inputs.maxBayWidth) {
      warning = `Bay ${index + 1} exceeds the preferred maximum by ${Math.round(item.width - inputs.maxBayWidth)} mm.`;
    }
    if (warning) warnings.push(warning);

    bays.push({
      index,
      width: item.width,
      clearWidth: item.width,
      height: inputs.fenceHeight,
      stepDrop,
      xStart,
      xEnd: cursor,
      levelAtStart,
      levelAtEnd,
      warning,
      source: item.source
    });

    const nextIsGate = inputs.gateOpening.enabled && gateAfter === index + 1;
    addPost(index === bayCount - 1 && !nextIsGate ? "end" : nextIsGate ? "gate-side" : "intermediate");
  }

  if (inputs.gateOpening.enabled && (gateAfter === 0 || gateAfter === bayCount)) {
    warnings.push("The gate is close to the end of the run; check latch and hinge access on site.");
  }

  const widths = bays.map((bay) => bay.width);
  const averageBayWidth = widths.reduce((sum, width) => sum + width, 0) / Math.max(1, widths.length);
  const reconcilesToRun = Math.abs(distributedTotal - available) <= 1;
  const isValid = bays.length > 0 && bays.every((bay) => bay.width > 0) && reconcilesToRun;
  const totalClearWidth = widths.reduce((sum, width) => sum + width, 0);
  const railsPerBay = inputs.fenceStyle === "panel" ? 0 : inputs.fenceHeight > 1500 ? 3 : 2;

  return {
    bays,
    posts,
    gate,
    totalPosts: posts.length,
    totalBays: bays.length,
    averageBayWidth,
    minBayWidth: Math.min(...widths),
    maxBayWidth: Math.max(...widths),
    panelCount: inputs.fenceStyle === "panel" ? bays.length : 0,
    gravelBoardCount: inputs.gravelBoardHeight > 0 ? bays.length : 0,
    railCount: railsPerBay * bays.length,
    railPieceCount: railsPerBay * bays.length,
    stockJointPositions: [],
    estimatedBoardCount: boardEstimate(inputs, totalClearWidth),
    rakeAngle: inputs.groundMode === "raked"
      ? Math.atan2(inputs.totalFall, inputs.totalRunLength) * (180 / Math.PI)
      : 0,
    usedLength: cursor,
    warnings,
    isValid
  };
}
