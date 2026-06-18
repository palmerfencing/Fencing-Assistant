import { AlertTriangle, CheckCircle2, ClipboardList, Fence, Ruler, Trees } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMillimetres } from "@/lib/utils";
import type { FenceRunInputs, FenceRunResults } from "@/types/fenceRun";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-stone-50 px-3.5 py-3">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</span>
      <span className="mt-1 block text-lg font-black text-forest-950">{value}</span>
    </div>
  );
}

export function FenceRunSummary({
  inputs,
  results
}: {
  inputs: FenceRunInputs;
  results: FenceRunResults;
}) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-700"><Fence size={19} /></span>
          <div>
            <p className="eyebrow">Layout</p>
            <h2 className="text-xl font-bold text-forest-950">Run summary</h2>
          </div>
        </div>
        {inputs.fenceStyle === "featheredge" ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat label="Post spans" value={results.totalBays} />
            <Stat label="Posts" value={results.totalPosts} />
            <Stat label="4.8 m joints" value={results.stockJointPositions.length} />
            <Stat label="End stock cut" value={results.cutRailLength ? formatMillimetres(results.cutRailLength) : "None"} />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat label="Fence bays" value={results.totalBays} />
            <Stat label="Posts" value={results.totalPosts} />
            <Stat label="Average bay" value={formatMillimetres(results.averageBayWidth)} />
            <Stat label="Bay range" value={`${Math.round(results.minBayWidth)}-${Math.round(results.maxBayWidth)}`} />
          </div>
        )}
        {inputs.groundMode === "raked" && (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-forest-950 px-4 py-3 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-white/55">Rake angle</span>
            <span className="font-black">{results.rakeAngle.toFixed(2)} deg</span>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-timber-50 text-timber-600"><Trees size={19} /></span>
          <div>
            <p className="eyebrow">Takeoff</p>
            <h2 className="text-xl font-bold text-forest-950">Materials</h2>
          </div>
        </div>
        <div className="mt-5 divide-y divide-stone-100">
          <div className="flex items-center justify-between py-2.5 text-sm"><span className="text-stone-500">Posts</span><strong>{results.totalPosts}</strong></div>
          {inputs.fenceStyle === "panel" ? (
            <div className="flex items-center justify-between py-2.5 text-sm"><span className="text-stone-500">Panels</span><strong>{results.panelCount}</strong></div>
          ) : (
            <>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-stone-500">{inputs.fenceStyle === "featheredge" ? "4.8 m stock rails" : "Rails"}</span>
                <strong>{results.railCount}</strong>
              </div>
              {inputs.fenceStyle === "featheredge" && (
                <>
                  <div className="flex items-center justify-between py-2.5 text-sm"><span className="text-stone-500">Continuous rail runs</span><strong>3</strong></div>
                  <div className="flex items-center justify-between py-2.5 text-sm"><span className="text-stone-500">Rail joints</span><strong>{results.stockJointPositions.length * 3}</strong></div>
                </>
              )}
              {results.cutRailLength !== undefined && (
                <div className="flex items-center justify-between py-2.5 text-sm text-amber-800">
                  <span>Cut end rails</span><strong>3 x {Math.round(results.cutRailLength)} mm</strong>
                </div>
              )}
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-stone-500">Estimated boards</span>
                <strong>{results.estimatedBoardCount}</strong>
              </div>
            </>
          )}
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-stone-500">{inputs.fenceStyle === "featheredge" ? "4.8 m gravel boards" : "Gravel boards"}</span>
            <strong>{results.gravelBoardCount}</strong>
          </div>
          {inputs.fenceStyle === "featheredge" && results.cutRailLength !== undefined && (
            <div className="flex items-center justify-between py-2.5 text-sm text-amber-800">
              <span>Cut end gravel board</span><strong>1 x {Math.round(results.cutRailLength)} mm</strong>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs leading-5 text-stone-400">
          {inputs.fenceStyle === "featheredge"
            ? "Board allowance uses 20 featheredge boards per 2.4 m. Allow for waste and site conditions before ordering."
            : "Planning quantities only. Allow for waste, cuts and site conditions before ordering."}
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${results.warnings.length ? "bg-amber-50 text-amber-700" : "bg-forest-50 text-forest-700"}`}>
            {results.warnings.length ? <AlertTriangle size={19} /> : <CheckCircle2 size={19} />}
          </span>
          <div>
            <p className="eyebrow">Checks</p>
            <h2 className="text-xl font-bold text-forest-950">{results.warnings.length ? "Review on site" : "Layout looks sound"}</h2>
          </div>
        </div>
        {results.warnings.length ? (
          <ul className="mt-4 space-y-2">
            {results.warnings.map((warning) => (
              <li key={warning} className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-900">
                {warning}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm leading-6 text-stone-500">All calculated bays sit inside the preferred width range.</p>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-stone-100 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-600"><Ruler size={19} /></span>
          <div>
            <p className="eyebrow">From start</p>
            <h2 className="text-xl font-bold text-forest-950">Post centres</h2>
          </div>
        </div>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400">
              <tr><th className="px-5 py-2.5">Post</th><th className="px-5 py-2.5 text-right">Centre</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {results.posts.map((post) => (
                <tr key={post.index}>
                  <td className="px-5 py-2.5 font-semibold">{post.index + 1}<span className="ml-2 text-[10px] uppercase text-stone-400">{post.type.replace("-", " ")}</span></td>
                  <td className="px-5 py-2.5 text-right font-mono font-bold">{Math.round(post.centre)} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 border-t border-stone-100 bg-stone-50 px-5 py-3 text-xs text-stone-500">
          <ClipboardList size={14} /> Centres measured from the start datum of the run.
        </div>
      </Card>
    </div>
  );
}
