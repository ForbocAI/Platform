<!-- COZY_CANOPY_PROTOCOL -->

```text
   /\_/\\
  ( o.o )
   > ^ <
```

---
# Playtest Automation

Last verified: 2026-03-17
Project: `/Users/seandinwiddie/GitHub/Forboc.AI/Platform`

This document describes the current automation surface and the real blockers in the repo. It is no longer a standing prompt to continue legacy playtesting.

## Current Baseline

Verified locally:

- `npm run lint` -> pass with 9 warnings
- `npm run build` -> fail
- `./node_modules/.bin/vitest run` -> fail

## Current Known Blockers

### Build

- `src/features/game/sdk/cortexService.ts` imports SDK exports that are not present in the installed `@forbocai/core` / `@forbocai/browser` packages.
- This blocks a clean production build and any trustworthy full-stack automation pass.

### Tests

- `__tests__/Home.spec.tsx` renders `src/app/page.tsx` without Redux `Provider`.
- audio boot touches `AudioContext`, which causes test-environment errors.

### URL Boot Options

Only `FORBOCAI_SDK=ON` is currently active from URL state.

The rest of the old automation-style query parameters are effectively inactive because:

- `src/features/core/store/getInitOptions.ts` returns `{}`
- `src/features/game/sdk/config.ts` returns fixed autoplay defaults

Do not rely on old docs or old assumptions about `deterministic`, `autoStart`, `autoFocus`, `autoSpeed`, or similar params until the parser is restored.

## Browser Automation Rule

If snapshot-based browser tooling is used:

1. take a fresh snapshot before each interaction
2. resolve the next element from the fresh snapshot
3. do one action per snapshot cycle

This app re-renders frequently enough that stale element refs are a real source of false failures.

## Stable Selector Surface

The following test ids are present in the current UI and are safe to target.

### Core Play Controls

- `auto-play-toggle`
- `move-north`
- `move-west`
- `move-east`
- `move-south`
- `map-toggle`
- `action-scan`
- `action-engage`
- `action-perform-inquiry`

### Narrative Controls

- `inquiry-input`
- `inquiry-submit`
- `facts-toggle`
- `facts-panel`
- `thread-list`
- `thread-{threadId}`
- `stage-selector`
- `stage-to-knowledge`
- `stage-to-conflict`
- `stage-to-endings`
- `vignette-controls`
- `fade-out-scene`

### Overlays and Panels

- `loading-retry`
- `concession-modal`
- `concession-accept-flee`
- `concession-accept-capture`
- `concession-reject`
- `inventory-panel`
- `trade-panel`
- `skills-panel`
- `companion-panel`
- `crafting-panel`

### Toggles and Utilities

- `inventory-toggle`
- `skills-toggle`
- `companion-toggle`
- `capabilities-toggle`
- `music-toggle`
- `text-to-speech-toggle`
- `volume-up`
- `volume-down`

### Trading and Inventory Actions

- `trade-vendor-{vendorId}`
- `trade-buy-{itemId}`
- `trade-sell-{itemId}`
- `inventory-equip-{itemId}`
- `inventory-unequip-{slot}`
- `inventory-use-{itemId}`
- `inventory-sacrifice-{itemId}`
- `craft-button-{formulaId}`

### Display Surfaces

- `player-header`
- `explored-map`
- `quests-panel`

## What To Validate Once Baseline Is Restored

After build/test health is repaired, the next meaningful automation pass should verify:

1. init flow and class selection
2. movement and map updates
3. scan, engage, inquiry, and vignette flows
4. inventory, trade, crafting, and companion flows
5. autoplay behavior and long-running stability
6. Lanternbough identity migration
   - metadata
   - visible copy
   - class roster
   - lore panels and logs

## Current Manual Smoke Sequence

Use this order after the technical baseline is fixed:

1. load the home route
2. initialize a run from class selection
3. test movement plus scan
4. test inquiry and facts
5. test trade and inventory actions
6. test crafting and companions
7. test death/concession if still applicable
8. run autoplay long enough to catch loop issues

## Maintenance Rule

Keep this file grounded in the actual repo state:

- remove stale params instead of preserving wishful documentation
- record verified failures with concrete file references
- only list selectors that truly exist in the current UI
