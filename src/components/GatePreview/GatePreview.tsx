import { Download, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Arrow, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GateInputs, GateResults } from "@/types/gate";

const MARGIN = 105;

export function GatePreview({
  inputs, results, onStageReady
}: {
  inputs: GateInputs;
  results: GateResults;
  onStageReady?: (stage: Konva.Stage | null) => void;
}) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 330 });

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;
    const updateSize = () => setCanvasSize({
      width: Math.max(320, element.clientWidth),
      height: Math.max(330, element.clientHeight)
    });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => {
    const fitScale = Math.min(
      (canvasSize.width - MARGIN * 2) / inputs.gateWidth,
      (canvasSize.height - MARGIN * 2) / inputs.gateHeight
    );
    const drawingScale = fitScale * 1.5;
    return {
      scale: drawingScale,
      x: (canvasSize.width - inputs.gateWidth * drawingScale) / 2,
      y: (canvasSize.height - inputs.gateHeight * drawingScale) / 2
    };
  }, [canvasSize, inputs.gateHeight, inputs.gateWidth]);

  const exportPng = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (!uri) return;
    const link = document.createElement("a");
    link.download = `${inputs.projectName || "gate-frame"}.png`;
    link.href = uri;
    link.click();
  };

  const resetView = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };
  const s = geometry.scale;
  const gateW = inputs.gateWidth * s;
  const gateH = inputs.gateHeight * s;
  const stileW = inputs.stileWidth * s;
  const railH = inputs.railWidth * s;
  const leftInside = geometry.x + stileW;
  const rightInside = geometry.x + gateW - stileW;
  const railYs = [
    geometry.y + inputs.topRailPosition * s,
    geometry.y + inputs.middleRailPosition * s,
    geometry.y + inputs.bottomRailPosition * s
  ];

  const bracePolygons = [
    makeBracePolygon(leftInside, rightInside, railYs[0] + railH, railYs[1], inputs.braceDirection, Math.max(8, railH * 0.72)),
    makeBracePolygon(leftInside, rightInside, railYs[1] + railH, railYs[2], inputs.braceDirection, Math.max(8, railH * 0.72))
  ];

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-4 sm:px-6">
        <div>
          <p className="eyebrow">Structural drawing</p>
          <h2 className="mt-1 text-xl font-bold">Gate frame</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}><Minus size={17} /></Button>
          <Button variant="outline" size="icon" aria-label="Reset view" onClick={resetView}><RotateCcw size={16} /></Button>
          <Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}><Plus size={17} /></Button>
          <Button variant="outline" size="icon" aria-label="Export frame PNG" onClick={exportPng}><Download size={17} /></Button>
        </div>
      </div>
      <div ref={previewRef} className="relative aspect-[4/3] min-h-[330px] w-full overflow-hidden bg-[#f8f6f1]">
        <Stage
          ref={(node) => { stageRef.current = node; onStageReady?.(node); }}
          width={canvasSize.width}
          height={canvasSize.height}
          scaleX={zoom}
          scaleY={zoom}
          x={position.x}
          y={position.y}
          draggable
          onDragEnd={(event) => setPosition({ x: event.target.x(), y: event.target.y() })}
        >
          <Layer>
            <Rect width={canvasSize.width} height={canvasSize.height} fill="#f8f6f1" />
            <Group>
              {railYs.map((y, index) => (
                <Rect key={index} x={leftInside} y={y} width={rightInside - leftInside} height={railH} fill="#a87343" stroke="#704323" strokeWidth={2} />
              ))}

              {/* Each brace is a four-sided timber polygon with vertical end
                  cuts. It sits over the rail corners and is covered only by
                  the stiles, showing a single flush cut at each stile. */}
              {bracePolygons.map((points, index) => (
                <Line
                  key={index}
                  points={points}
                  closed
                  fill="#80502e"
                  stroke="#80502e"
                  strokeWidth={1}
                />
              ))}

              <Rect x={geometry.x} y={geometry.y} width={stileW} height={gateH} fill="#9a663b" stroke="#704323" strokeWidth={2} />
              <Rect x={geometry.x + gateW - stileW} y={geometry.y} width={stileW} height={gateH} fill="#9a663b" stroke="#704323" strokeWidth={2} />

              <DimensionLine x1={geometry.x} y1={geometry.y - 44} x2={geometry.x + gateW} y2={geometry.y - 44} label={`${inputs.gateWidth} mm`} />
              <DimensionLine x1={geometry.x - 50} y1={geometry.y + gateH} x2={geometry.x - 50} y2={geometry.y} label={`${inputs.gateHeight} mm`} vertical />
              {[geometry.x, geometry.x + gateW - stileW].map((x, index) => (
                <Text
                  key={`stile-label-${index}`}
                  x={x + stileW * 0.25}
                  y={geometry.y + gateH - 8}
                  width={Math.max(40, gateH - 16)}
                  text={`Stile ${results.stileLength.toFixed(0)} mm`}
                  rotation={-90}
                  fill="#fff"
                  fontSize={Math.max(9, Math.min(12, stileW * 0.32))}
                  fontStyle="bold"
                  align="center"
                />
              ))}
              {railYs.map((y, index) => (
                <Text
                  key={`rail-label-${index}`}
                  x={leftInside + 4}
                  y={y + Math.max(1, railH * 0.14)}
                  width={Math.max(40, rightInside - leftInside - 8)}
                  text={`Rail ${results.railLength.toFixed(0)} mm`}
                  fill="#fff"
                  fontSize={Math.max(8, Math.min(11, railH * 0.28))}
                  fontStyle="bold"
                  align="center"
                />
              ))}
              {results.braces.map((brace, index) => {
                const points = bracePolygons[index];
                return (
                  <Text
                    key={brace.name}
                    x={(points[0] + points[2]) / 2 - 31}
                    y={(points[1] + points[3]) / 2 - 13}
                    width={100}
                    text={`${brace.length.toFixed(0)} mm\n${brace.angle.toFixed(1)}°`}
                    align="center"
                    fill="#fff"
                    fontSize={Math.max(9, Math.min(13, railH * 0.3))}
                    fontStyle="bold"
                    padding={3}
                    shadowColor="#000"
                    shadowBlur={4}
                    shadowOpacity={0.35}
                  />
                );
              })}
            </Group>
          </Layer>
        </Stage>
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-white/85 px-2.5 py-1.5 text-[11px] font-semibold text-stone-500 shadow-sm backdrop-blur">
          <Maximize2 size={13} /> Drag to pan · {Math.round(zoom * 100)}%
        </div>
      </div>
    </Card>
  );
}

function makeBracePolygon(
  left: number,
  right: number,
  upperRailInside: number,
  lowerRailInside: number,
  direction: GateInputs["braceDirection"],
  thickness: number
) {
  const lowerX = direction === "bottom-left" ? left : right;
  const upperX = direction === "bottom-left" ? right : left;
  const run = Math.abs(right - left);
  const rise = lowerRailInside - upperRailInside;
  const verticalThickness = thickness * Math.sqrt(1 + (rise / run) ** 2);

  // The outer brace corners touch the two rail corners. The remaining timber
  // stays inside the open bay, while both vertical end faces bear on stiles.
  return [
    lowerX, lowerRailInside - verticalThickness,
    upperX, upperRailInside,
    upperX, upperRailInside + verticalThickness,
    lowerX, lowerRailInside
  ];
}

function DimensionLine({
  x1, y1, x2, y2, label, vertical = false
}: {
  x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean;
}) {
  return (
    <>
      <Arrow points={[x1, y1, x2, y2]} stroke="#2f6d4a" fill="#2f6d4a" strokeWidth={2} pointerAtBeginning pointerLength={8} pointerWidth={8} />
      <Text
        x={vertical ? x1 - 55 : (x1 + x2) / 2 - 43}
        y={vertical ? (y1 + y2) / 2 + 43 : y1 - 28}
        width={86}
        text={label}
        align="center"
        rotation={vertical ? -90 : 0}
        fill="#25583c"
        fontSize={16}
        fontStyle="bold"
      />
    </>
  );
}
