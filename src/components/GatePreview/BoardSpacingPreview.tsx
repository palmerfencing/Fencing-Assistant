import { Card } from "@/components/ui/card";
import type { GateInputs, GateResults } from "@/types/gate";

export function BoardSpacingPreview({ inputs, results }: { inputs: GateInputs; results: GateResults }) {
  const exposure = inputs.boardWidth - results.actualOverlap;

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="border-b border-stone-100 p-4 sm:px-6">
        <p className="eyebrow">Featheredge layout</p>
        <h2 className="mt-1 text-xl font-bold">Board overlap</h2>
        <p className="mt-1 text-xs text-stone-500">
          {results.boardCount} boards at {inputs.boardWidth} mm · {results.actualOverlap.toFixed(1)} mm overlap · {exposure.toFixed(1)} mm exposure
          {results.boardEndTrim > 0 && ` · trim final board by ${results.boardEndTrim.toFixed(1)} mm`}
        </p>
      </div>
      <div className="p-5 sm:p-6">
        <div
          className="relative mx-auto h-48 min-w-[280px] max-w-3xl overflow-hidden border-y-2 border-stone-300 bg-stone-100"
          aria-label={`${results.boardCount} featheredge boards overlapping by ${results.actualOverlap.toFixed(1)} millimetres`}
        >
          {Array.from({ length: results.boardCount }, (_, index) => {
            const left = (index * exposure / inputs.gateWidth) * 100;
            const width = (inputs.boardWidth / inputs.gateWidth) * 100;
            return (
              <div
                key={index}
                className="absolute inset-y-0 border-l border-timber-600 bg-gradient-to-r from-[#b77d46] via-timber-400 to-[#e2bc86] shadow-[-3px_0_5px_rgba(80,45,20,0.18)]"
                style={{ left: `${left}%`, width: `${width}%`, zIndex: index + 1 }}
                title={`Board ${index + 1}: ${inputs.boardWidth} mm, overlapping ${results.actualOverlap.toFixed(1)} mm`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex justify-between gap-3 text-xs font-semibold text-stone-500">
          <span>← {inputs.gateWidth} mm overall →</span>
          <span>{results.actualOverlap.toFixed(1)} mm overlap</span>
        </div>
      </div>
    </Card>
  );
}
