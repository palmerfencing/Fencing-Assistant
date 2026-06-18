import { Lock, RotateCcw, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFenceRunStore } from "@/store/fenceRunStore";
import type { FenceRunInputs as FenceRunInputValues, FenceRunResults } from "@/types/fenceRun";

const selectClassName =
  "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-forest-950 outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-100";

function NumberField({
  label,
  value,
  onChange,
  unit = "mm",
  min = 0
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-forest-950">{label}</span>
      <div className="relative">
        <Input
          type="number"
          min={min}
          step="any"
          inputMode="decimal"
          className="pr-12"
          value={Number.isFinite(value) ? value : ""}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-stone-400">
          {unit}
        </span>
      </div>
    </label>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400">{children}</h3>;
}

export function FenceRunInputs({
  results,
  selectedBay,
  onSelectBay
}: {
  results: FenceRunResults;
  selectedBay: number | null;
  onSelectBay: (index: number) => void;
}) {
  const { inputs, patchInputs, setBayOverride, initialiseOverrides, clearOverrides, reset } = useFenceRunStore();
  const patchNumber = (key: keyof FenceRunInputValues, value: number) => patchInputs({ [key]: value });
  const customising = inputs.bayOverrides.length > 0;
  const isFeatheredge = inputs.fenceStyle === "featheredge";

  const startCustomising = () => {
    initialiseOverrides(results.totalBays, results.bays.map((bay) => bay.width));
    onSelectBay(selectedBay ?? 0);
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Run setup</p>
          <h2 className="mt-1 text-2xl font-bold text-forest-950">Site details</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          <RotateCcw size={15} /> Reset
        </Button>
      </div>

      <div className="mt-6 space-y-7">
        <fieldset>
          <SectionTitle>Project</SectionTitle>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Project name</span>
              <Input value={inputs.projectName} onChange={(event) => patchInputs({ projectName: event.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Site notes</span>
              <textarea
                className="min-h-20 w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
                placeholder="Access, boundary or customer notes..."
                value={inputs.notes}
                onChange={(event) => patchInputs({ notes: event.target.value })}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <SectionTitle>Fence</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Run length"
              value={inputs.totalRunLength / 1000}
              onChange={(value) => patchNumber("totalRunLength", value * 1000)}
              unit="m"
            />
            <NumberField label="Fence height" value={inputs.fenceHeight} onChange={(value) => patchNumber("fenceHeight", value)} />
          </div>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-sm font-semibold">Infill style</span>
            <select
              className={selectClassName}
              value={inputs.fenceStyle}
              onChange={(event) => {
                const fenceStyle = event.target.value as FenceRunInputValues["fenceStyle"];
                patchInputs(fenceStyle === "featheredge"
                  ? {
                      fenceStyle,
                      fenceHeight: 1800,
                      minBayWidth: 2400,
                      preferredBayWidth: 2400,
                      maxBayWidth: 2400,
                      gravelBoardHeight: 150,
                      bayOverrides: []
                    }
                  : { fenceStyle });
              }}
            >
              <option value="panel">Panel fencing</option>
              <option value="closeboard">Closeboard bays</option>
              <option value="featheredge">Featheredge on rails</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <SectionTitle>Posts and bays</SectionTitle>
          {isFeatheredge ? (
            <div className="rounded-2xl border border-forest-100 bg-forest-50 p-4">
              <p className="text-sm font-bold text-forest-950">Fixed featheredge standard</p>
              <p className="mt-1 text-xs leading-5 text-forest-700">
                Posts stay at 2.4 m centres. Any remainder becomes a cut end bay with three cut rails.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <span className="rounded-xl bg-white px-3 py-2 font-semibold">Centres <strong className="float-right">2.4 m</strong></span>
                <span className="rounded-xl bg-white px-3 py-2 font-semibold">Stock rails <strong className="float-right">4.8 m</strong></span>
              </div>
              <div className="mt-3">
                <NumberField label="Post width" value={inputs.postWidth} onChange={(value) => patchNumber("postWidth", value)} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Post width" value={inputs.postWidth} onChange={(value) => patchNumber("postWidth", value)} />
              <NumberField label="Target bay" value={inputs.preferredBayWidth} onChange={(value) => patchNumber("preferredBayWidth", value)} />
              <NumberField label="Minimum bay" value={inputs.minBayWidth} onChange={(value) => patchNumber("minBayWidth", value)} />
              <NumberField label="Maximum bay" value={inputs.maxBayWidth} onChange={(value) => patchNumber("maxBayWidth", value)} />
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">{isFeatheredge ? "Run start" : "Start"}</span>
              <select
                className={selectClassName}
                value={inputs.startCondition}
                onChange={(event) => patchInputs({ startCondition: event.target.value as FenceRunInputValues["startCondition"] })}
              >
                <option value="end-post">{isFeatheredge ? "Start post" : "End post"}</option>
                <option value="existing-post">Existing post</option>
                <option value="return-wall">Return wall</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">End</span>
              <select
                className={selectClassName}
                value={inputs.endCondition}
                onChange={(event) => patchInputs({ endCondition: event.target.value as FenceRunInputValues["endCondition"] })}
              >
                <option value="end-post">End post</option>
                <option value="existing-post">Existing post</option>
                <option value="return-wall">Return wall</option>
              </select>
            </label>
          </div>
          {isFeatheredge && inputs.startCondition === "end-post" && (
            <p className="mt-2 rounded-xl bg-timber-50 px-3 py-2 text-xs leading-5 text-timber-600">
              Rails and gravel boards begin at the outside face of the start post. The first post centre is {Math.round(inputs.postWidth / 2)} mm from the run datum.
            </p>
          )}
        </fieldset>

        <fieldset>
          <SectionTitle>Ground and levels</SectionTitle>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Ground mode</span>
            <select
              className={selectClassName}
              value={inputs.groundMode}
              onChange={(event) => patchInputs({ groundMode: event.target.value as FenceRunInputValues["groundMode"] })}
            >
              <option value="level">Level</option>
              <option value="stepped">Stepped</option>
              <option value="raked">Raked / sloped</option>
            </select>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NumberField
              label="Total fall"
              value={inputs.totalFall}
              onChange={(value) => patchNumber("totalFall", value)}
              min={0}
            />
            <NumberField
              label="Ground gap"
              value={inputs.groundClearance}
              onChange={(value) => patchNumber("groundClearance", value)}
            />
          </div>
        </fieldset>

        <fieldset>
          <SectionTitle>Gate opening</SectionTitle>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
            <span>
              <span className="block text-sm font-bold text-forest-950">Include a gate</span>
              <span className="block text-xs text-stone-500">Adds a clear opening and two gate-side posts.</span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-forest-700"
              checked={inputs.gateOpening.enabled}
              onChange={(event) => patchInputs({
                gateOpening: { ...inputs.gateOpening, enabled: event.target.checked }
              })}
            />
          </label>
          {inputs.gateOpening.enabled && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <NumberField
                label="Clear width"
                value={inputs.gateOpening.width}
                onChange={(value) => patchInputs({ gateOpening: { ...inputs.gateOpening, width: value } })}
              />
              <NumberField
                label="After bay"
                value={inputs.gateOpening.afterBayIndex}
                onChange={(value) => patchInputs({ gateOpening: { ...inputs.gateOpening, afterBayIndex: Math.round(value) } })}
                unit=""
              />
            </div>
          )}
        </fieldset>

        <fieldset>
          <div className="mb-3 flex items-center justify-between gap-3">
            <SectionTitle>Bay editor</SectionTitle>
            {customising && !isFeatheredge && (
              <button type="button" className="text-xs font-bold text-forest-700 hover:text-forest-950" onClick={clearOverrides}>
                Return to auto
              </button>
            )}
          </div>
          {isFeatheredge ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-500">
              Featheredge bays are calculated automatically at fixed 2.4 m centres and cannot be manually rebalanced.
            </div>
          ) : !customising ? (
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-timber-400 bg-timber-50 px-4 py-4 text-sm font-bold text-timber-600 transition hover:border-timber-600"
              onClick={startCustomising}
              disabled={!results.isValid}
            >
              <Unlock size={16} /> Customise individual bays
            </button>
          ) : (
            <div className="space-y-2">
              {results.bays.map((bay) => {
                const override = inputs.bayOverrides[bay.index] ?? {};
                const isSelected = selectedBay === bay.index;
                return (
                  <div
                    key={bay.index}
                    className={`rounded-2xl border p-3 transition ${isSelected ? "border-timber-400 bg-timber-50" : "border-stone-200 bg-white"}`}
                  >
                    <button
                      type="button"
                      className="mb-2 flex w-full items-center justify-between text-left"
                      onClick={() => onSelectBay(bay.index)}
                    >
                      <span className="text-sm font-bold">Bay {bay.index + 1}</span>
                      <span className="text-xs font-semibold text-stone-500">{Math.round(bay.width)} mm</span>
                    </button>
                    <div className="flex gap-2">
                      <Input
                        aria-label={`Bay ${bay.index + 1} width`}
                        type="number"
                        value={Math.round(override.locked ? override.width ?? bay.width : bay.width)}
                        disabled={!override.locked}
                        onChange={(event) => setBayOverride(bay.index, { width: Number(event.target.value) })}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant={override.locked ? "default" : "outline"}
                        title={override.locked ? "Unlock bay" : "Lock bay width"}
                        onClick={() => setBayOverride(bay.index, {
                          locked: !override.locked,
                          width: override.width ?? bay.width
                        })}
                      >
                        {override.locked ? <Lock size={16} /> : <Unlock size={16} />}
                      </Button>
                    </div>
                    {inputs.groundMode === "stepped" && (
                      <div className="mt-2">
                        <NumberField
                          label="Step after bay"
                          value={override.stepDrop ?? bay.stepDrop}
                          onChange={(value) => setBayOverride(bay.index, { stepDrop: value })}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>
      </div>
    </Card>
  );
}
