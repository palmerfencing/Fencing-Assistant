import { ArrowLeft, FileDown, ImageDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FenceRunInputs } from "@/components/FenceRun/FenceRunInputs";
import { FenceRunPreview } from "@/components/FenceRun/FenceRunPreview";
import { FenceRunSummary } from "@/components/FenceRun/FenceRunSummary";
import { Button } from "@/components/ui/button";
import { calculateFenceRun } from "@/lib/calculations/fenceRun";
import { exportFenceRunPdf, exportFenceRunPng } from "@/lib/exportFenceRun";
import { useFenceRunStore } from "@/store/fenceRunStore";

export function FenceRunDesignerPage() {
  const inputs = useFenceRunStore((state) => state.inputs);
  const results = useMemo(() => calculateFenceRun(inputs), [inputs]);
  const [selectedBay, setSelectedBay] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (selectedBay !== null && selectedBay >= results.totalBays) setSelectedBay(null);
  }, [results.totalBays, selectedBay]);

  useEffect(() => {
    if (inputs.fenceStyle === "featheredge" && selectedBay !== null) setSelectedBay(null);
  }, [inputs.fenceStyle, selectedBay]);

  const runExport = async (format: "pdf" | "png") => {
    setExporting(true);
    try {
      if (format === "pdf") await exportFenceRunPdf(inputs, results);
      else await exportFenceRunPng(inputs);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-shell py-6 sm:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-forest-800">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <p className="eyebrow">Design tool</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-forest-950 sm:text-4xl">Fence Run Designer</h1>
          <p className="mt-2 text-sm text-stone-500">Balance bays, place posts and plan levels across a complete straight run.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!results.isValid || exporting} onClick={() => void runExport("png")}>
            <ImageDown size={18} /> PNG
          </Button>
          <Button disabled={!results.isValid || exporting} onClick={() => void runExport("pdf")}>
            <FileDown size={18} /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_330px]">
        <FenceRunInputs results={results} selectedBay={selectedBay} onSelectBay={setSelectedBay} />
        <div className="min-w-0">
          <FenceRunPreview inputs={inputs} results={results} selectedBay={selectedBay} onSelectBay={setSelectedBay} />
        </div>
        <div className="lg:col-start-2 xl:col-start-auto">
          <FenceRunSummary inputs={inputs} results={results} />
        </div>
      </div>
    </div>
  );
}
