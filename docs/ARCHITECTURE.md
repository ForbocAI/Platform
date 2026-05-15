<!-- COZY_CANOPY_PROTOCOL -->

```text
      /\        
     /**\       
    /****\   /\ 
   /      \ /**\
  /  /\    /    \
 /__/  \__/______\
```

---
# Platform Architecture

Last verified: 2026-03-21
Project: `/Users/seandinwiddie/GitHub/Forboc.AI/Platform`
Design target: Lanternbough cozy-fantasy rewrite

## Core Rule

Engineering should stay lore-agnostic.

- file names, folders, functions, state fields, and internal identifiers should describe mechanics
- lore belongs in UI copy, content data, docs, art, and presentation
- the current codebase still contains legacy-era names in some places, but that is transition debt, not the target standard

## Top-Level `src/` Layout

- `app/`
  - Next.js app router entrypoints, layout, providers, and bootstrap gate
- `components/`
  - UI only
  - split into `elements/generic`, `elements/unique`, and `screens`
- `features/`
  - domain logic, state, thunks, reducers, listeners, AI, and content
- `lib/`
  - cross-cutting helpers and browser-safe SDK placeholders only

## Current Runtime Composition

### App Layer

- `src/app/layout.tsx`
  - root metadata, analytics, providers, and app shell
- `src/app/StoreProvider.tsx`
  - Redux provider wiring
- `src/app/BootstrapGate.tsx`
  - client-side startup hook that currently triggers SDK init
- `src/app/page.tsx`
  - renders `GameScreen`

### Component Layer

- `src/components/elements/generic/`
  - reusable primitives like buttons, modals, stat displays, and loading overlay
- `src/components/elements/unique/`
  - game, narrative, and shared UI built from generic elements
- `src/components/screens/`
  - page-level compositions such as `GameScreen` and `ClassSelectionScreen`

### Feature Layer

- `src/features/core/`
  - store setup, RTK Query base API, shared hooks, UI slice
- `src/features/game/`
  - entities, mechanics, store, middleware, SDK bridge, content
- `src/features/audio/`
  - audio slice, listeners, playback, and browser audio context helpers
- `src/features/narrative/`
  - thread/fact/vignette state and helpers

## Game Feature Layering

The current `features/game` structure is already close to the right separation:

- `entities/`
  - area, player, vendor, and related world-model construction
- `store/`
  - slice, selectors, and state type exports
- `mechanics/orchestrators/`
  - async thunks and multi-step gameplay flows
- `mechanics/transformations/`
  - reducer-side state changes
- `mechanics/systems/`
  - AI, combat helpers, item behavior, world generation
- `sdk/`
  - runtime bridge to `@forbocai/*`
- `middleware/`
  - autoplay orchestration and listener wiring

This is the architecture to keep. The main work is cleaning identity drift, not inventing a different runtime shape.

## Boot Flow

1. `src/app/layout.tsx` renders the provider stack.
2. `src/features/core/store/index.ts` dispatches `app/bootstrap` on the client.
3. `src/features/core/store/listeners.ts` responds to bootstrap and may initialize the game.
4. `src/features/game/middleware/autoplayListener.ts` initializes `BotOrchestrator`, starts a poll loop, and also triggers SDK init.
5. `src/app/BootstrapGate.tsx` separately triggers SDK init again.

## Architecture Risks

### Resolved (2026-03-21)

1. **SDK Build Contract** — `cortexService.ts` now uses dynamic imports with `.catch(() => null)` fallback. Build passes.
2. **Duplicate SDK Initialization** — addressed between `BootstrapGate.tsx` and `autoplayListener.ts`.
3. **URL Boot Parsing** — `getInitOptions.ts` now parses all 9 URL parameters.

### Open

1. **Poll Teardown** — `autoplayListener.ts` has a `pollStarted` guard that prevents duplicate intervals, but the `setInterval` is never cleared via `clearInterval`.

## Lanternbough Architecture Rules

As the rewrite continues:

- keep `features/` organized by mechanic, not by lore faction
- keep resource handling generic at the engineering layer
- avoid file or function names tied to specific classes, gods, or biomes
- put cozy/fairy-tale specificity in content tables, copy, portraits, and UI labels

## Practical Next Steps

1. ~~Fix `cortexService.ts` so the repo builds again.~~ Done.
2. ~~Remove duplicate SDK init and duplicate poll registration.~~ Done.
3. ~~Replace legacy branding in `src/app/layout.tsx`.~~ Done.
4. Keep the current reducer/thunk/system split while swapping in Lanternbough content.
5. Add `clearInterval` teardown to `autoplayListener.ts`.
