import { Card } from "@/components/ui/card";
import type { GateResults } from "@/types/gate";

export function PartsDiagram({ results }: { results: GateResults }) {
  const longestStraight = Math.max(results.stileLength, results.railLength);

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="border-b border-stone-100 p-4 sm:px-6">
        <p className="eyebrow">Frame components</p>
        <h2 className="mt-1 text-xl font-bold">Parts diagram</h2>
        <p className="mt-1 text-xs text-stone-500">Scaled cutting references for every structural component.</p>
      </div>
      <div className="space-y-7 p-5 sm:p-6">
        <StraightParts
          name="Stiles"
          quantity={2}
          lengths={[results.stileLength, results.stileLength]}
          longest={longestStraight}
          colour="#996238"
        />
        <StraightParts
          name="Rails"
          quantity={3}
          lengths={[results.railLength, results.railLength, results.railLength]}
          longest={longestStraight}
          colour="#ae7742"
        />

        <div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-bold text-forest-950">2 × Braces</span>
            <span className="text-xs text-stone-500">Parallel cuts at both ends</span>
          </div>
          <div className="space-y-4">
            {results.braces.map((brace, index) => (
              <BracePart key={brace.name} brace={brace} number={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function StraightParts({
  name, quantity, lengths, longest, colour
}: {
  name: string;
  quantity: number;
  lengths: number[];
  longest: number;
  colour: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-forest-950">{quantity} × {name}</span>
        <span className="text-xs text-stone-500">{lengths.map((length) => `${length.toFixed(0)} mm`).join(" · ")}</span>
      </div>
      <div className="space-y-1.5">
        {lengths.map((length, index) => (
          <div
            key={`${name}-${index}`}
            className="flex h-7 min-w-20 items-center justify-end rounded-sm border border-[#704323] px-2 text-[10px] font-bold text-white shadow-sm"
            style={{ width: `${Math.max(18, (length / longest) * 100)}%`, backgroundColor: colour }}
          >
            {length.toFixed(0)} mm
          </div>
        ))}
      </div>
    </div>
  );
}

function BracePart({
  brace, number
}: {
  brace: GateResults["braces"][number];
  number: number;
}) {
  const viewWidth = 520;
  const viewHeight = 205;
  const maximumRun = 360;
  const maximumRise = 92;
  const run = Math.min(maximumRun, maximumRise / Math.tan((brace.angle * Math.PI) / 180));
  const rise = run * Math.tan((brace.angle * Math.PI) / 180);
  const x1 = 72;
  const x2 = x1 + run;
  const lowerY = 143;
  const upperY = lowerY - rise;
  const faceHeight = 34;
  const polygon = `${x1},${lowerY - faceHeight} ${x2},${upperY} ${x2},${upperY + faceHeight} ${x1},${lowerY}`;
  const arcRadius = 21;

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-forest-950">Brace {number} · {brace.name}</p>
        <p className="text-[10px] font-semibold text-stone-500">{brace.length.toFixed(0)} mm overall</p>
      </div>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${brace.name}, ${brace.length.toFixed(0)} millimetres, parallel ${brace.cutAngle.toFixed(1)} degree end cuts`}
      >
        <defs>
          <marker id={`arrow-${number}`} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto-start-reverse">
            <path d="M0,0 L7,3.5 L0,7 z" fill="#2f6d4a" />
          </marker>
        </defs>

        <polygon points={polygon} fill="#80502e" stroke="#5f351d" strokeWidth="2" />
        <line x1={x1} y1={lowerY - faceHeight} x2={x1} y2={lowerY} stroke="#f4d7b5" strokeWidth="2" />
        <line x1={x2} y1={upperY} x2={x2} y2={upperY + faceHeight} stroke="#f4d7b5" strokeWidth="2" />

        {/* Matching angle arcs emphasise that both end cuts are parallel. */}
        <path
          d={`M ${x1} ${lowerY - arcRadius} A ${arcRadius} ${arcRadius} 0 0 1 ${x1 + arcRadius * Math.cos((brace.angle * Math.PI) / 180)} ${lowerY - arcRadius * Math.sin((brace.angle * Math.PI) / 180)}`}
          fill="none"
          stroke="#25583c"
          strokeWidth="2"
        />
        <path
          d={`M ${x2} ${upperY + arcRadius} A ${arcRadius} ${arcRadius} 0 0 1 ${x2 - arcRadius * Math.cos((brace.angle * Math.PI) / 180)} ${upperY + arcRadius * Math.sin((brace.angle * Math.PI) / 180)}`}
          fill="none"
          stroke="#25583c"
          strokeWidth="2"
        />
        <text x={x1 - 54} y={lowerY - faceHeight + 5} fill="#25583c" fontSize="12" fontWeight="700">
          {brace.cutAngle.toFixed(1)}°
        </text>
        <text x={x2 + 10} y={upperY + faceHeight + 14} fill="#25583c" fontSize="12" fontWeight="700">
          {brace.cutAngle.toFixed(1)}°
        </text>

        {/* Overall diagonal length. */}
        <line
          x1={x1 + 5}
          y1={lowerY + 21}
          x2={x2 - 5}
          y2={upperY + faceHeight + 21}
          stroke="#2f6d4a"
          strokeWidth="1.5"
          markerStart={`url(#arrow-${number})`}
          markerEnd={`url(#arrow-${number})`}
        />
        <text x={(x1 + x2) / 2 - 39} y={lowerY + 47} fill="#25583c" fontSize="12" fontWeight="700">
          {brace.length.toFixed(0)} mm
        </text>

      </svg>
    </div>
  );
}
