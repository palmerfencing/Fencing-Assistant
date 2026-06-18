import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { gateSchema, type GateFormInput, type GateFormValues } from "@/lib/validation/gate";
import { useGateStore } from "@/store/gateStore";
import type { GateInputs as GateInputValues } from "@/types/gate";

function NumberField({
  label, unit = "mm", error, registration
}: {
  label: string; unit?: string; error?: string; registration: object;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-forest-950">{label}</span>
      <div className="relative">
        <Input type="number" step="any" inputMode="decimal" className="pr-12" {...registration} />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-stone-400">{unit}</span>
      </div>
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export function GateInputs() {
  const { inputs, setInputs, reset } = useGateStore();
  const {
    register, watch, reset: resetForm, formState: { errors }
  } = useForm<GateFormInput, unknown, GateFormValues>({
    resolver: zodResolver(gateSchema),
    defaultValues: inputs,
    mode: "onChange"
  });

  useEffect(() => {
    const subscription = watch((values) => {
      // Keep the drawing responsive while the user is typing, even when a
      // different field currently has a validation error.
      const current = useGateStore.getState().inputs;
      const numberValue = (value: unknown, fallback: number) => {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : fallback;
      };
      const next: GateInputValues = {
        projectName: typeof values.projectName === "string" ? values.projectName : current.projectName,
        gateWidth: numberValue(values.gateWidth, current.gateWidth),
        gateHeight: numberValue(values.gateHeight, current.gateHeight),
        stileWidth: numberValue(values.stileWidth, current.stileWidth),
        railWidth: numberValue(values.railWidth, current.railWidth),
        topRailPosition: numberValue(values.topRailPosition, current.topRailPosition),
        middleRailPosition: numberValue(values.middleRailPosition, current.middleRailPosition),
        bottomRailPosition: numberValue(values.bottomRailPosition, current.bottomRailPosition),
        boardWidth: numberValue(values.boardWidth, current.boardWidth),
        boardOverlap: numberValue(values.boardOverlap, current.boardOverlap),
        braceDirection: values.braceDirection === "bottom-right" ? "bottom-right" : "bottom-left"
      };
      setInputs(next);
    });
    return () => subscription.unsubscribe();
  }, [setInputs, watch]);

  const handleReset = () => {
    reset();
    resetForm(useGateStore.getState().inputs);
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Measurements</p>
          <h2 className="mt-1 text-2xl font-bold text-forest-950">Gate details</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw size={15} /> Reset
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Project name</span>
          <Input {...register("projectName")} />
        </label>

        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">Gate</legend>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Width" error={errors.gateWidth?.message} registration={register("gateWidth")} />
            <NumberField label="Height" error={errors.gateHeight?.message} registration={register("gateHeight")} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">Timber frame</legend>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Stile width" error={errors.stileWidth?.message} registration={register("stileWidth")} />
            <NumberField label="Rail width" error={errors.railWidth?.message} registration={register("railWidth")} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-xs font-bold uppercase tracking-wider text-stone-400">Rail positions</legend>
          <p className="mb-3 text-xs leading-5 text-stone-500">Measured from the gate top to the top edge of each rail.</p>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Top rail" error={errors.topRailPosition?.message} registration={register("topRailPosition")} />
            <NumberField label="Middle rail" error={errors.middleRailPosition?.message} registration={register("middleRailPosition")} />
            <NumberField label="Bottom rail" error={errors.bottomRailPosition?.message} registration={register("bottomRailPosition")} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">Boards</legend>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Board width" error={errors.boardWidth?.message} registration={register("boardWidth")} />
            <NumberField label="Board overlap" error={errors.boardOverlap?.message} registration={register("boardOverlap")} />
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Brace direction</span>
          <select
            className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-100"
            {...register("braceDirection")}
          >
            <option value="bottom-left">Bottom Left → Top Right</option>
            <option value="bottom-right">Bottom Right → Top Left</option>
          </select>
        </label>
      </div>
    </Card>
  );
}
