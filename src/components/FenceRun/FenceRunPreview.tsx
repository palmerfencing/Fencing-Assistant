import { AlertTriangle, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FenceRunInputs, FenceRunResults, FenceViewMode } from "@/types/fenceRun";

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 520;
const PAD_X = 70;
const BASE_Y = 395;

function viewLabel(mode: FenceViewMode) {
  if (mode === "setting-out") return "Setting out";
  if (mode === "levels") return "Levels";
  return "Plan layout";
}

export function FenceRunPreview({
  inputs,
  results,
  selectedBay,
  onSelectBay
}: {
  inputs: FenceRunInputs;
  results: FenceRunResults;
  selectedBay: number | null;
  onSelectBay: (index: number) => void;
}) {
  const [mode, setMode] = useState<FenceViewMode>("layout");
  const [zoom, setZoom] = useState(1);
  const [showDimensions, setShowDimensions] = useState(true);
  const isFeatheredge = inputs.fenceStyle === "featheredge";
  const innerWidth = VIEW_WIDTH - PAD_X * 2;
  const x = (value: number) => PAD_X + (value / Math.max(1, inputs.totalRunLength)) * innerWidth;
  const levelScale = Math.min(0.18, 150 / Math.max(1, inputs.totalFall));
  const y = (level: number) => BASE_Y + level * levelScale;
  const fenceHeight = Math.max(120, Math.min(235, inputs.fenceHeight * 0.12));
  const postTop = (postX: number) => {
    if (inputs.groundMode === "raked") return y((postX / Math.max(1, inputs.totalRunLength)) * inputs.totalFall) - fenceHeight - 24;
    const preceding = [...results.bays].reverse().find((bay) => bay.xStart <= postX);
    return y(preceding?.levelAtEnd ?? 0) - fenceHeight - 24;
  };
  const stockSegmentStarts = isFeatheredge ? [0, ...results.stockJointPositions] : [];
  const stockSegments = stockSegmentStarts.map((start, index) => ({
    start,
    end: results.stockJointPositions[index] ?? inputs.totalRunLength
  }));

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4 sm:px-6">
        <div>
          <p className="eyebrow">Live elevation</p>
          <h2 className="mt-1 text-xl font-bold text-forest-950">{viewLabel(mode)}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-stone-100 p-1">
            {(["layout", "setting-out", "levels"] as FenceViewMode[]).map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  mode === item ? "bg-white text-forest-950 shadow-sm" : "text-stone-500"
                )}
                onClick={() => setMode(item)}
              >
                {viewLabel(item)}
              </button>
            ))}
          </div>
          <Button type="button" size="icon" variant="outline" onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}>
            <Minus size={16} />
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={() => setZoom((value) => Math.min(2, value + 0.25))}>
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-stone-100 bg-stone-50/80 px-5 py-3 sm:px-6">
        <button
          type="button"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold transition",
            showDimensions ? "border-forest-200 bg-forest-50 text-forest-700" : "border-stone-200 bg-white text-stone-500"
          )}
          onClick={() => setShowDimensions((value) => !value)}
        >
          Dimensions
        </button>
        <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-stone-500">
          {Math.round(zoom * 100)}%
        </span>
        {!isFeatheredge && (
          <span className="hidden rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-stone-500 sm:inline">
            Select a bay to edit
          </span>
        )}
      </div>

      <div className="overflow-x-auto bg-[#f8f4ec]">
        {!results.isValid ? (
          <div className="grid min-h-[430px] place-items-center p-8 text-center">
            <div>
              <AlertTriangle className="mx-auto text-amber-600" size={34} />
              <p className="mt-3 font-bold text-forest-950">This layout cannot be drawn yet</p>
              <p className="mt-1 text-sm text-stone-500">Increase the run length or reduce the gate and post sizes.</p>
            </div>
          </div>
        ) : (
          <svg
            id="fence-run-preview"
            role="img"
            aria-label="Scaled fence run elevation"
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            style={{ width: `${zoom * 100}%`, minWidth: zoom > 1 ? 900 : 720 }}
            className="block h-auto"
          >
            <defs>
              <pattern id="timber-lines" width="18" height="18" patternUnits="userSpaceOnUse">
                <path d="M0 18L18 0" stroke="#d9c3a6" strokeWidth="1" opacity="0.55" />
              </pattern>
              <pattern id="board-lines" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M6 0V12" stroke="#8f603a" strokeWidth="1" opacity="0.4" />
              </pattern>
            </defs>

            <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="#f8f4ec" />
            <path d={`M35 ${BASE_Y + 30}H${VIEW_WIDTH - 35}`} stroke="#d7d0c5" strokeWidth="2" strokeDasharray="5 8" />

            {results.bays.map((bay) => {
              const left = x(bay.xStart);
              const right = x(bay.xEnd);
              const topLeft = y(bay.levelAtStart) - fenceHeight;
              const topRight = y(bay.levelAtEnd) - fenceHeight;
              const bottomLeft = y(bay.levelAtStart) - inputs.groundClearance * 0.08;
              const bottomRight = y(bay.levelAtEnd) - inputs.groundClearance * 0.08;
              const selected = selectedBay === bay.index;
              const fill = inputs.fenceStyle === "panel" ? "#d9c3a6" : "url(#board-lines)";
              const railOffsets = [50, 750, 1450].map((position) => ({
                position,
                offset: (position / Math.max(1, inputs.fenceHeight)) * fenceHeight
              }));
              const gravelHeight = (150 / Math.max(1, inputs.fenceHeight)) * fenceHeight;
              const structureLeft = isFeatheredge && bay.index === 0 && inputs.startCondition === "end-post"
                ? x(0)
                : left;

              return (
                <g
                  key={bay.index}
                  onClick={isFeatheredge ? undefined : () => onSelectBay(bay.index)}
                  className={isFeatheredge ? undefined : "cursor-pointer"}
                >
                  {isFeatheredge ? (
                    <>
                      <polygon
                        points={`${left},${topLeft} ${right},${topRight} ${right},${bottomRight} ${left},${bottomLeft}`}
                        fill="rgba(255,255,255,0.08)"
                        stroke={bay.isCutBay ? "#b7791f" : "transparent"}
                        strokeWidth={bay.isCutBay ? 3 : 0}
                        strokeDasharray={bay.isCutBay ? "7 5" : undefined}
                      />
                      {railOffsets.map((rail) => (
                        <g key={rail.position}>
                          <line
                            x1={structureLeft}
                            y1={topLeft + rail.offset}
                            x2={right}
                            y2={topRight + rail.offset}
                            stroke="#8c5d38"
                            strokeWidth="8"
                            strokeLinecap="square"
                          />
                          {bay.index === 0 && (
                            <text
                              x={left + 8}
                              y={(topLeft + topRight) / 2 + rail.offset - 6}
                              fill="#6f492e"
                              fontSize="10"
                              fontWeight="800"
                            >
                              {rail.position} mm
                            </text>
                          )}
                        </g>
                      ))}
                      <polygon
                        points={`${structureLeft},${bottomLeft - gravelHeight} ${right},${bottomRight - gravelHeight} ${right},${bottomRight} ${structureLeft},${bottomLeft}`}
                        fill="#a97848"
                        stroke="#6f492e"
                        strokeWidth="2"
                      />
                      {bay.index === 0 && (
                        <text x={left + 8} y={bottomLeft - gravelHeight / 2 + 4} fill="#fff7ed" fontSize="9" fontWeight="800">
                          150 mm TIMBER GRAVEL BOARD
                        </text>
                      )}
                    </>
                  ) : (
                    <polygon
                      points={`${left},${topLeft} ${right},${topRight} ${right},${bottomRight} ${left},${bottomLeft}`}
                      fill={selected ? "#bf9364" : fill}
                      stroke={bay.warning ? "#b7791f" : selected ? "#8c5d38" : "#8f603a"}
                      strokeWidth={selected ? 4 : 2}
                    />
                  )}
                  {inputs.fenceStyle === "panel" && (
                    <polygon
                      points={`${left},${topLeft} ${right},${topRight} ${right},${bottomRight} ${left},${bottomLeft}`}
                      fill="url(#timber-lines)"
                    />
                  )}
                  {mode !== "setting-out" && (
                    <>
                      {!isFeatheredge && (
                        <line x1={left} y1={(topLeft + bottomLeft) / 2} x2={right} y2={(topRight + bottomRight) / 2} stroke="#8f603a" opacity="0.38" />
                      )}
                      <text
                        x={(left + right) / 2}
                        y={isFeatheredge ? topLeft - 18 : (topLeft + bottomLeft) / 2 - 8}
                        textAnchor="middle"
                        fill={bay.isCutBay ? "#9a5d21" : "#4a3323"}
                        fontSize={isFeatheredge ? "13" : "16"}
                        fontWeight="800"
                      >
                        {bay.isCutBay ? `CUT POST SPAN - ${Math.round(bay.width)} mm c/c` : `Bay ${bay.index + 1}`}
                      </text>
                      {bay.source === "manual" && (
                        <text x={(left + right) / 2} y={(topLeft + bottomLeft) / 2 + 14} textAnchor="middle" fill="#6f492e" fontSize="10" fontWeight="800">
                          LOCKED
                        </text>
                      )}
                    </>
                  )}
                  {showDimensions && (
                    <>
                      <line x1={left} y1={bottomLeft + 35} x2={right} y2={bottomRight + 35} stroke="#335f47" strokeWidth="1.5" />
                      <line x1={left} y1={bottomLeft + 27} x2={left} y2={bottomLeft + 43} stroke="#335f47" />
                      <line x1={right} y1={bottomRight + 27} x2={right} y2={bottomRight + 43} stroke="#335f47" />
                      <text x={(left + right) / 2} y={Math.max(bottomLeft, bottomRight) + 58} textAnchor="middle" fill="#25583c" fontSize="13" fontWeight="800">
                        {Math.round(bay.width)} mm{isFeatheredge ? " c/c" : ""}
                      </text>
                    </>
                  )}
                  {mode === "levels" && inputs.groundMode !== "level" && (
                    <text x={(left + right) / 2} y={Math.min(topLeft, topRight) - 14} textAnchor="middle" fill="#9a5d21" fontSize="12" fontWeight="800">
                      {inputs.groundMode === "raked"
                        ? `${Math.round(bay.levelAtEnd - bay.levelAtStart)} mm fall`
                        : `Level ${Math.round(bay.levelAtStart)} mm`}
                    </text>
                  )}
                </g>
              );
            })}

            {isFeatheredge && stockSegments.map((segment, index) => {
              const length = segment.end - segment.start;
              return (
                <g key={`${segment.start}-${segment.end}`}>
                  <line x1={x(segment.start)} y1="78" x2={x(segment.end)} y2="78" stroke="#8c5d38" strokeWidth="2" />
                  <line x1={x(segment.start)} y1="71" x2={x(segment.start)} y2="85" stroke="#8c5d38" strokeWidth="2" />
                  <line x1={x(segment.end)} y1="71" x2={x(segment.end)} y2="85" stroke="#8c5d38" strokeWidth="2" />
                  <text x={(x(segment.start) + x(segment.end)) / 2} y="68" textAnchor="middle" fill="#6f492e" fontSize="11" fontWeight="900">
                    {length < 4799.5 ? `CUT STOCK ${Math.round(length)} mm` : `4.8 m STOCK ${index + 1}`}
                  </text>
                </g>
              );
            })}

            {results.gate && (
              <g>
                <rect
                  x={x(results.gate.xStart)}
                  y={BASE_Y - fenceHeight * 0.82}
                  width={x(results.gate.xEnd) - x(results.gate.xStart)}
                  height={fenceHeight * 0.82}
                  rx="4"
                  fill="#eaf2ec"
                  stroke="#25583c"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
                <path
                  d={`M${x(results.gate.xStart) + 8} ${BASE_Y - 8}L${x(results.gate.xEnd) - 8} ${BASE_Y - fenceHeight * 0.82 + 8}`}
                  stroke="#25583c"
                  strokeWidth="2"
                />
                <text
                  x={(x(results.gate.xStart) + x(results.gate.xEnd)) / 2}
                  y={BASE_Y - fenceHeight * 0.42}
                  textAnchor="middle"
                  fill="#142f23"
                  fontSize="14"
                  fontWeight="900"
                >
                  GATE {Math.round(results.gate.width)} mm
                </text>
              </g>
            )}

            {results.posts.map((post) => (
              <g key={post.index}>
                <rect
                  x={x(post.x)}
                  y={postTop(post.x)}
                  width={Math.max(5, x(post.x + post.width) - x(post.x))}
                  height={fenceHeight + 42}
                  rx="2"
                  fill={post.type === "gate-side" ? "#7b4f2f" : "#142f23"}
                />
                {mode === "setting-out" && (
                  <>
                    <line x1={x(post.centre)} y1={postTop(post.x) - 16} x2={x(post.centre)} y2={BASE_Y + 62} stroke="#25583c" strokeDasharray="3 5" />
                    <text x={x(post.centre)} y={BASE_Y + 80} textAnchor="middle" fill="#25583c" fontSize="11" fontWeight="800">
                      {Math.round(post.centre)}
                    </text>
                  </>
                )}
              </g>
            ))}

            {isFeatheredge && results.stockJointPositions.map((position) => {
              const bay = results.bays.find((item) => item.xStart <= position && item.xEnd >= position)
                ?? results.bays[results.bays.length - 1];
              const progress = bay && bay.xEnd !== bay.xStart ? (position - bay.xStart) / (bay.xEnd - bay.xStart) : 0;
              const level = bay ? bay.levelAtStart + (bay.levelAtEnd - bay.levelAtStart) * progress : 0;
              const jointTop = y(level) - fenceHeight;
              const jointBottom = y(level);
              const railOffsets = [50, 750, 1450].map((railPosition) => (railPosition / Math.max(1, inputs.fenceHeight)) * fenceHeight);
              return (
                <g key={position}>
                  <line
                    x1={x(position)}
                    y1={jointTop - 38}
                    x2={x(position)}
                    y2={jointBottom + 10}
                    stroke="#b7791f"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                  {railOffsets.map((offset) => (
                    <circle key={offset} cx={x(position)} cy={jointTop + offset} r="6" fill="#f8f4ec" stroke="#b7791f" strokeWidth="3" />
                  ))}
                  <rect x={x(position) - 6} y={jointBottom - (150 / Math.max(1, inputs.fenceHeight)) * fenceHeight - 4} width="12" height="8" fill="#f8f4ec" stroke="#b7791f" strokeWidth="2" />
                  <text x={x(position)} y={jointTop - 47} textAnchor="middle" fill="#9a5d21" fontSize="11" fontWeight="900">
                    4.8 m RAIL + GB JOINT
                  </text>
                </g>
              );
            })}

            <line x1={PAD_X} y1={472} x2={VIEW_WIDTH - PAD_X} y2={472} stroke="#142f23" strokeWidth="2" />
            <line x1={PAD_X} y1={464} x2={PAD_X} y2={480} stroke="#142f23" strokeWidth="2" />
            <line x1={VIEW_WIDTH - PAD_X} y1={464} x2={VIEW_WIDTH - PAD_X} y2={480} stroke="#142f23" strokeWidth="2" />
            <text x={VIEW_WIDTH / 2} y={502} textAnchor="middle" fill="#142f23" fontSize="15" fontWeight="900">
              TOTAL RUN {(inputs.totalRunLength / 1000).toFixed(2).replace(/\.?0+$/, "")} m
            </text>
          </svg>
        )}
      </div>
    </Card>
  );
}
