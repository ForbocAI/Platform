<!-- AESTHETIC_PROTOCOL_COMPLIANCE -->

<!-- ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ -->

```text
    [VOID::WATCHER]

```

SYSTEM_OVERRIDE // NEURAL_LINK_ESTABLISHED // LOG_ERR_CRITICAL



---
# Platform src architecture

## Top-level layout (TLDs)

Under `src/` we keep exactly five top-level directories:

- **app/** — Next.js app router (pages, layout).
- **components/** — UI: `elements/generic`, `elements/unique`, `screens`. Subdomain folders exist only under `elements/unique` (e.g. `game/`, `narrative/`, `shared/`).
- **features/** — Domain logic: game, audio, narrative, core. All reducible logic and domain helpers live here.
- **hooks/** — Removed. Former hook behavior (e.g. `useDecryptText`) lives under `features/core/hooks/`.
- **lib/** — Cross-cutting, non-Redux code only: `utils.ts`, `sneakers.ts`, `sdk-placeholder/`. No `lib/game/`; game logic is in `features/game/`.

## Reducer-first convention (lib/hooks → features)

- **Game logic:** Engine, combat, mechanics, generation, content, types, and narrative helpers live in **features/game/** (and **features/narrative/**). Pure reducer helpers and thunks own all domain logic; no domain imports from `lib/game` or `hooks/`.
- **Hooks:** Shared hooks (e.g. `useDecryptText`) are implemented under **features/core/hooks/**. Redux typed hooks (`useAppDispatch`, `useAppSelector`) are in **features/core/store/hooks.ts**. Components use these or thin wrappers from features.
- **lib/** holds only non-Redux utilities; **features/** do not depend on lib for domain behavior.

## Features subdomains

- **features/game/** — Slice (with `slice/reducers/` split: init, movement, combat, trade, inventory, autoplay), thunks, engine, types, combat, mechanics, generation, content, etc.
- **features/audio/** — Slice, music (patterns + playback), sfx, core context.
- **features/narrative/** — Slice, helpers (e.g. vignette themes, unexpectedly effects, follow-up facts).
- **features/core/** — Store, api (baseApi, gameApi), ui slice, hooks (e.g. useDecryptText).

## Components

- **elements/generic** — Reusable primitives (buttons, modals, stat box, etc.). No domain types.
- **elements/unique** — Domain components by subdomain: **game/** (ActionDeck, RoomViewport, panels, PlayerHeader, QuestsPanel, …), **narrative/** (FactsPanel, OracleForm, StageSelector, ThreadList, VignetteControls), **shared/** (Runes, VolumeControls).
- **screens** — Full-page compositions; one folder per screen. Built only from unique and generic components.

Screens → unique + generic. Unique → generic (and other unique) where possible. See **docs/COMPONENTS.md** for folder layout and composition rules.
