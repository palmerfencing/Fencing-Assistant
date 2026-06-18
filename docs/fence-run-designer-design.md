# Fence Run Designer

## Goal

Design a new `Fence Run Designer` feature for the existing Fencing Site Assistant app without implementing it yet.

The feature should help a contractor plan a full fence line, not just a single element. It should answer practical site questions such as:

- How many bays fit in the available run?
- Where should posts land?
- Which bay widths are awkward or non-compliant?
- How does the layout change on slopes or with stepped sections?
- What panels, boards, gravel boards, and posts are needed before pricing?

The feature should feel like the next tool in the same family as the current Gate Calculator:

- left side: editable inputs
- middle: live visual layout
- right side: actionable outputs

It should remain a planning and design tool first. Detailed purchasing cost logic belongs later in `Material Estimator` and `Quote Builder`.

## Product Position

### What this feature is

A visual planner for laying out one fence run made up of posts, bays, and infill sections.

### What this feature is not

- not a full-job estimator across multiple disconnected runs
- not a quote builder
- not a structural engineering tool
- not a terrain survey replacement
- not a stock cutting optimiser in v1

## Primary Users

### Main user

A fencing contractor or installer working from a site measurement, rough sketch, or customer brief.

### Secondary user

A homeowner or office estimator who needs a sensible layout before material takeoff.

## Core Jobs To Be Done

1. Start with a total run length and quickly see a workable post-and-bay layout.
2. Compare equal bays versus custom bay widths.
3. Plan around constraints such as end conditions, gates, corners, steps, and slope changes.
4. Produce a clear visual plan that can be checked on site or shared with a customer.
5. Generate a clean summary that can later feed the material estimator.

## V1 Scope

### Included

- single straight fence run
- configurable start and end conditions
- equal bay auto-layout
- manual bay width overrides
- post count and post centre positions
- support for common infill styles:
  - panel fencing
  - closeboard bays
  - featheredge board-on-rail bays
- support for level, stepped, and raked/sloped layout modes
- gate opening inserted into the run
- visual preview of the run
- summary outputs and export-ready layout data

### Excluded from v1

- multiple connected runs in one project
- curved runs
- fully freeform drag-and-drop geometry
- underground/post footing engineering checks
- pricing and margin logic
- inventory ordering suggestions
- advanced waste optimisation

## Information Architecture

Add a new route:

- `/fence-run-designer`

Add a new dashboard card:

- `Fence Run Designer`

Update top navigation to include:

- `Gate Calculator`
- `Fence Run Designer`

## Page Structure

Follow the existing two-to-three-column pattern used in the gate calculator.

### Left column: Inputs

Use grouped cards or one stacked card with sections:

1. Project
   - project name
   - notes
   - measurement units (keep mm internally)
2. Run setup
   - total run length
   - fence height
   - layout mode: equal bays / custom bays
   - fence style
3. Posts
   - post width
   - preferred max bay width
   - preferred min bay width
   - end post type at start
   - end post type at end
4. Ground and height
   - ground mode: level / stepped / raked
   - total fall across run or per-bay drops
   - ground clearance
5. Openings and interruptions
   - optional gate opening
   - optional service gap / feature gap
6. Bay editor
   - auto-generated list of bays
   - per-bay width override
   - per-bay height/drop adjustment when stepped

### Center column: Visual designer

This is the heart of the feature.

Use a large interactive preview canvas similar to the existing Konva-based gate drawing. The user should be able to:

- pan
- zoom
- switch overlays on and off
- select a bay from the canvas
- see dimensions directly on the run

Recommended preview layers:

- baseline/run line
- post rectangles
- bay fills or infill blocks
- gate opening
- slope or step indicators
- dimension lines
- bay labels
- warnings

Recommended view modes:

- `Plan layout`
  - straight-on elevation style view
- `Setting out`
  - simplified post-centre and dimension view
- `Levels`
  - highlights step drops or rake angle

### Right column: Outputs

This column should stay concise and practical.

Suggested cards:

1. Layout summary
   - total run length
   - total bays
   - total posts
   - average bay width
   - widest and narrowest bay
2. Warnings
   - bays over preferred width
   - bays under preferred width
   - awkward remainder
   - stepped drop inconsistency
   - gate too close to end
3. Materials summary
   - posts
   - panels or bays
   - rails
   - gravel boards
   - boards estimate
4. Setting-out dimensions
   - post centre positions from start
   - clear opening sizes
5. Export actions
   - export PDF
   - export PNG
   - future: send to material estimator

## Suggested User Flow

1. User enters project name, run length, height, fence style, and preferred bay width.
2. App proposes an equal-bay layout automatically.
3. User reviews the live drawing and sees post count and bay widths.
4. User optionally adds a gate opening or changes end conditions.
5. User adjusts individual bays if the auto-layout is not practical.
6. User switches to stepped or raked mode if the site is not level.
7. App updates the geometry, warnings, and summary in real time.
8. User exports a drawing or hands the design off to a future estimator flow.

## Interaction Model

### Auto layout first

Default to a strong first answer. The app should produce a sensible layout as soon as enough measurements exist, rather than waiting for the user to manually define every bay.

### Manual control second

Once auto-layout exists, the user can override specific bays. Manual edits should be visibly marked so the user understands which values are locked and which remain auto-balanced.

### Clear warning behaviour

Warnings should be advisory, not blocking, except for impossible geometry.

Examples:

- `Bay 4 exceeds preferred maximum width by 82 mm`
- `Remaining end bay is below minimum width`
- `Gate opening plus posts exceeds total run length`

## Data Model Proposal

Keep the same pattern as the gate feature:

- `types` file
- `zustand` store
- pure calculation engine
- validation schema

### Inputs

```ts
export type FenceStyle = "panel" | "closeboard" | "featheredge";
export type GroundMode = "level" | "stepped" | "raked";
export type LayoutMode = "equal-bays" | "custom-bays";
export type EndCondition = "end-post" | "return-wall" | "existing-post";

export interface FenceRunGateOpening {
  enabled: boolean;
  width: number;
  positionMode: "start-bay" | "end-bay" | "between-bays";
  afterBayIndex: number;
}

export interface FenceBayOverride {
  width?: number;
  stepDrop?: number;
  locked?: boolean;
}

export interface FenceRunInputs {
  projectName: string;
  totalRunLength: number;
  fenceHeight: number;
  fenceStyle: FenceStyle;
  layoutMode: LayoutMode;
  groundMode: GroundMode;
  postWidth: number;
  minBayWidth: number;
  preferredBayWidth: number;
  maxBayWidth: number;
  gravelBoardHeight: number;
  groundClearance: number;
  totalFall: number;
  startCondition: EndCondition;
  endCondition: EndCondition;
  gateOpening: FenceRunGateOpening;
  bayOverrides: FenceBayOverride[];
}
```

### Results

```ts
export interface FenceBayResult {
  index: number;
  width: number;
  clearWidth: number;
  height: number;
  stepDrop: number;
  xStart: number;
  xEnd: number;
  warning?: string;
  source: "auto" | "manual";
}

export interface FencePostResult {
  index: number;
  x: number;
  width: number;
  type: "start" | "intermediate" | "end" | "gate-side";
}

export interface FenceRunResults {
  bays: FenceBayResult[];
  posts: FencePostResult[];
  totalPosts: number;
  totalBays: number;
  averageBayWidth: number;
  minBayWidth: number;
  maxBayWidth: number;
  panelCount: number;
  gravelBoardCount: number;
  railCount: number;
  estimatedBoardCount?: number;
  warnings: string[];
}
```

## Calculation Strategy

### 1. Base available length

Compute the usable layout length from:

- total run length
- required post widths
- gate opening width if present
- end condition deductions where needed

### 2. Equal-bay solver

For v1, the solver should aim for:

- bay widths close to preferred width
- no bay smaller than minimum
- no bay larger than maximum where possible
- smallest practical remainder

Recommended approach:

1. estimate bay count from preferred width
2. try nearby bay counts above and below
3. score each candidate
4. choose the lowest-penalty layout

Suggested scoring priorities:

- impossible layouts rejected
- under-minimum bays heavily penalised
- over-maximum bays heavily penalised
- large deviation from preferred width mildly penalised
- asymmetric leftover bay strongly penalised unless user chose custom mode

### 3. Manual bay rebalance

If some bays are locked manually:

- subtract locked bay widths
- redistribute remaining length over unlocked bays
- preserve total run length

### 4. Ground behaviour

#### Level

All bays share the same top and bottom reference.

#### Stepped

Each bay may have a step drop. The preview should show vertical jumps between bays.

#### Raked

The fence line follows one continuous slope. Outputs should include:

- total fall
- fall per bay
- indicative rake angle

## Visual Design Direction

Stay consistent with the current UI:

- warm site-friendly palette
- card-based layout
- strong measurement labels
- practical, workshop-style language

### Recommended additions

- selected bay highlighted in timber or forest accent
- warnings in muted amber rather than aggressive red
- overlay chips for:
  - dimensions
  - posts
  - levels
  - labels

### Mobile behaviour

Preserve the current mobile-first approach:

- inputs first
- preview second
- outputs third

On smaller screens:

- keep the preview swipeable/pannable
- make the bay editor collapsible
- keep the summary sticky only if it does not crowd the viewport

## Key UI Components

New components likely needed:

- `FenceRunInputs`
- `FenceRunPreview`
- `FenceRunSummary`
- `FenceBayEditor`
- `FenceWarnings`
- `FenceSettingOutTable`

New modules likely needed:

- `src/types/fenceRun.ts`
- `src/store/fenceRunStore.ts`
- `src/lib/validation/fenceRun.ts`
- `src/lib/calculations/fenceRun.ts`
- `src/lib/exportFenceRunPdf.ts`
- `src/pages/FenceRunDesigner/FenceRunDesignerPage.tsx`

## Export Design

Keep export behaviour parallel with the gate tool.

### PDF should include

- app header
- project name
- date
- run preview image
- layout summary
- bay schedule
- post centre setting-out dimensions
- warnings

### PNG export should include

- clean preview snapshot
- optional dimensions overlay

## Boundaries With Future Features

### Material Estimator later consumes

- total posts
- total bays
- rail count
- gravel board count
- estimated board count
- gate opening metadata

### Quote Builder later consumes

- project name
- chosen fence style
- measured quantities
- warnings or notes

This keeps the run designer focused on layout truth, not commercial logic.

## Phased Delivery Plan

### Phase 1

- route and navigation
- inputs for straight level run
- equal-bay auto-layout
- basic preview
- summary card

### Phase 2

- manual bay overrides
- gate opening support
- warnings panel
- setting-out dimensions

### Phase 3

- stepped and raked modes
- richer export
- integration handoff to future estimator

## Open Questions

These should be resolved before implementation starts:

1. Should v1 prioritise panel fencing only, or include featheredge/closeboard from day one?
2. How should gate placement be expressed: by bay insertion, absolute distance, or both?
3. Do end conditions need to affect geometry in v1, or can they remain metadata only?
4. For stepped runs, do users need per-bay drop entry immediately, or is total fall enough for the first release?
5. Is the preview meant to be purely elevation-based, or should a lightweight plan view also exist later?

## Recommended Decision

If speed matters, the best v1 is:

- single straight run
- level ground first
- equal bay solver
- manual bay override list
- optional gate opening
- setting-out export

That version would already be useful on real jobs and fits the existing architecture cleanly without overreaching into estimator territory.
