import type { GateInputs, GateResults } from "@/types/gate";

/**
 * Pure calculation engine. Keeping this free of React means it can later be
 * reused by quotes, saved jobs, server APIs, or a native app.
 */
export function calculateGate(input: GateInputs): GateResults {
  const internalWidth = Math.max(1, input.gateWidth - input.stileWidth * 2);
  const internalHeight = input.gateHeight;
  const railLength = internalWidth;
  const stileLength = input.gateHeight;
  const braceOpenings = [
    {
      name: "Top–middle brace",
      verticalRise: Math.max(1, input.middleRailPosition - (input.topRailPosition + input.railWidth))
    },
    {
      name: "Middle–bottom brace",
      verticalRise: Math.max(1, input.bottomRailPosition - (input.middleRailPosition + input.railWidth))
    }
  ];
  const braces = braceOpenings.map((brace) => {
    const angleRadians = Math.atan(brace.verticalRise / internalWidth);
    const angle = angleRadians * (180 / Math.PI);
    return {
      ...brace,
      // Use the clear opening bounded by the inside stile and rail faces.
      length: Math.sqrt(internalWidth ** 2 + brace.verticalRise ** 2),
      angle,
      // The two stile-facing cuts are parallel. This is the included angle
      // between each cut face and the long edge of the brace.
      cutAngle: 90 - angle,
      // Vertical end-grain face produced when rail-width timber is cut at the
      // calculated angle.
      shortEndLength: input.railWidth / Math.cos(angleRadians)
    };
  });

  // Featheredge boards overlap. The first board contributes its full width;
  // each later board adds only its exposed width (board width - overlap).
  const exposure = Math.max(1, input.boardWidth - input.boardOverlap);
  const boardCount = Math.max(1, Math.ceil((input.gateWidth - input.boardOverlap) / exposure));
  const actualOverlap = input.boardOverlap;
  const boardCoverage = input.boardWidth + (boardCount - 1) * exposure;
  const boardEndTrim = Math.max(0, boardCoverage - input.gateWidth);

  const frameTimberLength =
    stileLength * 2 + railLength * 3 + braces.reduce((total, brace) => total + brace.length, 0);
  const boardTimberLength = boardCount * input.gateHeight;
  const frameCuts = [
    { name: "Stile", length: stileLength },
    { name: "Stile", length: stileLength },
    { name: "Rail", length: railLength },
    { name: "Rail", length: railLength },
    { name: "Rail", length: railLength },
    { name: "Top-middle brace", length: braces[0].length },
    { name: "Middle-bottom brace", length: braces[1].length }
  ];
  const stockLength = 4800;
  const stockCutPlan = optimiseStockCuts(frameCuts, stockLength);

  return {
    internalWidth,
    internalHeight,
    railLength,
    stileLength,
    braces,
    boardCount,
    actualOverlap,
    boardCoverage,
    boardEndTrim,
    frameTimberLength,
    boardTimberLength,
    totalTimberLength: frameTimberLength + boardTimberLength,
    stockLength,
    stockCount: stockCutPlan.length,
    stockWaste: stockCutPlan.reduce((total, stock) => total + stock.waste, 0),
    stockCutPlan
  };
}

/**
 * Exact branch-and-bound bin packing for the seven frame components.
 * Lengths use the same nearest-millimetre values displayed in the cut list.
 */
function optimiseStockCuts(
  cuts: Array<{ name: string; length: number }>,
  stockLength: number
) {
  const sorted = cuts
    .map((cut) => ({ ...cut, length: Math.round(cut.length) }))
    .sort((a, b) => b.length - a.length);
  let best: Array<Array<{ name: string; length: number }>> = sorted.map((cut) => [cut]);

  const search = (
    index: number,
    bins: Array<Array<{ name: string; length: number }>>,
    used: number[]
  ) => {
    if (bins.length >= best.length) return;
    if (index === sorted.length) {
      best = bins.map((bin) => [...bin]);
      return;
    }

    const cut = sorted[index];
    const triedRemaining = new Set<number>();
    for (let binIndex = 0; binIndex < bins.length; binIndex += 1) {
      const remaining = stockLength - used[binIndex];
      if (cut.length > remaining || triedRemaining.has(remaining)) continue;
      triedRemaining.add(remaining);
      bins[binIndex].push(cut);
      used[binIndex] += cut.length;
      search(index + 1, bins, used);
      used[binIndex] -= cut.length;
      bins[binIndex].pop();
    }

    bins.push([cut]);
    used.push(cut.length);
    search(index + 1, bins, used);
    used.pop();
    bins.pop();
  };

  search(0, [], []);
  return best.map((cutsInStock) => {
    const used = cutsInStock.reduce((total, cut) => total + cut.length, 0);
    return { cuts: cutsInStock, used, waste: stockLength - used };
  });
}
