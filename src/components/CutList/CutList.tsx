import { PackageCheck, Ruler, Trees } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMillimetres } from "@/lib/utils";
import type { GateInputs, GateResults } from "@/types/gate";

export function CutList({ inputs, results }: { inputs: GateInputs; results: GateResults }) {
  const cuts = [
    { qty: 2, name: "Stiles", length: results.stileLength },
    { qty: 3, name: "Rails", length: results.railLength },
    ...results.braces.map((brace) => ({ qty: 1, name: brace.name, length: brace.length }))
  ];

  return (
    <Card className="overflow-hidden">
      <div className="bg-forest-950 p-5 text-white sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-timber-400">Workshop ready</p>
        <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold"><Trees size={22} /> Cut list</h2>
      </div>
      <div className="p-5 sm:p-6">
        <div className="divide-y divide-stone-100">
          {cuts.map((cut) => (
            <div key={cut.name} className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div><span className="font-black text-forest-900">{cut.qty} ×</span> <span className="text-stone-600">{cut.name}</span></div>
              <span className="font-mono text-sm font-bold text-forest-900">@ {formatMillimetres(cut.length)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Metric label="Top brace angle" value={`${results.braces[0].angle.toFixed(1)}°`} />
          <Metric label="Bottom brace angle" value={`${results.braces[1].angle.toFixed(1)}°`} />
          <Metric label="Frame timber" value={`${(results.frameTimberLength / 1000).toFixed(2)} m`} />
          <Metric label="4.8 m stock needed" value={`${results.stockCount} lengths`} />
          <Metric label="Stock purchased" value={`${(results.stockCount * results.stockLength / 1000).toFixed(1)} m`} />
          <Metric label="Stock waste" value={`${(results.stockWaste / 1000).toFixed(2)} m`} />
        </div>

        <div className="mt-5 rounded-2xl border border-forest-100 bg-forest-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-forest-900">
            <PackageCheck size={17} /> Optimised 4.8 m cutting plan
          </h3>
          <div className="mt-3 space-y-3">
            {results.stockCutPlan.map((stock, index) => (
              <div key={index}>
                <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-stone-600">
                  <span>Stock length {index + 1}</span>
                  <span>{stock.waste} mm waste</span>
                </div>
                <div className="flex h-7 overflow-hidden rounded-md border border-forest-200 bg-white">
                  {stock.cuts.map((cut, cutIndex) => (
                    <div
                      key={`${cut.name}-${cutIndex}`}
                      className="grid min-w-8 place-items-center border-r border-white/70 bg-forest-700 px-1 text-[9px] font-bold text-white"
                      style={{ width: `${(cut.length / results.stockLength) * 100}%` }}
                      title={`${cut.name}: ${cut.length} mm`}
                    >
                      {cut.length}
                    </div>
                  ))}
                  <div className="bg-stone-200" style={{ width: `${(stock.waste / results.stockLength) * 100}%` }} />
                </div>
                <p className="mt-1 text-[10px] leading-4 text-stone-500">
                  {stock.cuts.map((cut) => `${cut.name} ${cut.length} mm`).join(" + ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="text-sm font-bold text-forest-950">Brace calculation check</h3>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Brace dimensions use the clear inside rectangle between the stile faces and adjacent rail faces.
          </p>
          <div className="mt-4 space-y-4">
            <BraceCalculation
              name="Top–middle brace"
              upperPosition={inputs.topRailPosition}
              lowerPosition={inputs.middleRailPosition}
              railWidth={inputs.railWidth}
              internalWidth={results.internalWidth}
              verticalRise={results.braces[0].verticalRise}
              length={results.braces[0].length}
              angle={results.braces[0].angle}
            />
            <BraceCalculation
              name="Middle–bottom brace"
              upperPosition={inputs.middleRailPosition}
              lowerPosition={inputs.bottomRailPosition}
              railWidth={inputs.railWidth}
              internalWidth={results.internalWidth}
              verticalRise={results.braces[1].verticalRise}
              length={results.braces[1].length}
              angle={results.braces[1].angle}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="Featheredge boards" value={`${results.boardCount}`} />
          <Metric label="Board timber" value={`${(results.boardTimberLength / 1000).toFixed(2)} m`} />
          <Metric label="All timber total" value={`${(results.totalTimberLength / 1000).toFixed(2)} m`} />
          <Metric label="Board overlap" value={formatMillimetres(results.actualOverlap, 1)} />
        </div>
        <p className="mt-4 flex gap-2 rounded-xl bg-timber-50 p-3 text-xs leading-5 text-timber-600">
          <Ruler size={16} className="mt-0.5 shrink-0" />
          Stock optimisation covers the frame only and excludes saw kerf. Add your blade kerf and site tolerance before purchasing or cutting.
        </p>
      </div>
    </Card>
  );
}

function BraceCalculation({
  name,
  upperPosition,
  lowerPosition,
  railWidth,
  internalWidth,
  verticalRise,
  length,
  angle
}: {
  name: string;
  upperPosition: number;
  lowerPosition: number;
  railWidth: number;
  internalWidth: number;
  verticalRise: number;
  length: number;
  angle: number;
}) {
  return (
    <div className="border-t border-stone-200 pt-3 first:border-0 first:pt-0">
      <p className="text-xs font-bold text-forest-800">{name}</p>
      <div className="mt-2 space-y-1 font-mono text-[11px] leading-5 text-stone-600">
        <p>
          Clear height = {lowerPosition} − {upperPosition} − {railWidth} ={" "}
          <strong className="text-forest-900">{verticalRise.toFixed(0)} mm</strong>
        </p>
        <p>
          Inside width = gate width − (2 × stile width) ={" "}
          <strong className="text-forest-900">{internalWidth.toFixed(0)} mm</strong>
        </p>
        <p>
          Length = √({internalWidth.toFixed(0)}² + {verticalRise.toFixed(0)}²) ={" "}
          <strong className="text-forest-900">{length.toFixed(1)} mm</strong>
        </p>
        <p>
          Angle = atan({verticalRise.toFixed(0)} ÷ {internalWidth.toFixed(0)}) ={" "}
          <strong className="text-forest-900">{angle.toFixed(1)}°</strong>
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 font-bold text-forest-950">{value}</p>
    </div>
  );
}
