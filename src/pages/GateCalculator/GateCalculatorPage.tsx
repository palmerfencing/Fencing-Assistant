import { ArrowLeft, FileDown } from "lucide-react";
import { useMemo, useState } from "react";
import type Konva from "konva";
import { Link } from "react-router-dom";
import { CutList } from "@/components/CutList/CutList";
import { GateInputs } from "@/components/GateInputs/GateInputs";
import { GatePreview } from "@/components/GatePreview/GatePreview";
import { BoardSpacingPreview } from "@/components/GatePreview/BoardSpacingPreview";
import { PartsDiagram } from "@/components/GatePreview/PartsDiagram";
import { Button } from "@/components/ui/button";
import { calculateGate } from "@/lib/calculations/gate";
import { exportGatePdf } from "@/lib/exportGatePdf";
import { useGateStore } from "@/store/gateStore";

export function GateCalculatorPage() {
  const inputs = useGateStore((state) => state.inputs);
  const results = useMemo(() => calculateGate(inputs), [inputs]);
  const [stage, setStage] = useState<Konva.Stage | null>(null);

  return (
    <div className="page-shell py-6 sm:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-forest-800">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <p className="eyebrow">Design tool</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-forest-950 sm:text-4xl">Gate Calculator</h1>
          <p className="mt-2 text-sm text-stone-500">Accurate dimensions, workshop cut list and scaled drawing.</p>
        </div>
        <Button onClick={() => exportGatePdf(inputs, results, stage)}>
          <FileDown size={18} /> Export PDF
        </Button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_330px]">
        <GateInputs />
        <div className="min-w-0 space-y-5">
          <GatePreview inputs={inputs} results={results} onStageReady={setStage} />
          <PartsDiagram results={results} />
          <BoardSpacingPreview inputs={inputs} results={results} />
        </div>
        <div className="lg:col-start-2 xl:col-start-auto">
          <CutList inputs={inputs} results={results} />
        </div>
      </div>
    </div>
  );
}
