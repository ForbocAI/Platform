# Component structure

## Folder layout

**Maintain this folder structure** under `src/components/`:

- **components/elements/generic** — Reusable primitives; no game/narrative domain. Examples: `GameButton`, `NavButton`, `Modal`, `LoadingOverlay`, `StatBox`.
- **components/elements/unique** — Domain-specific components. Subfolders by subdomain: `game/`, `narrative/`, `shared/`. Examples: `ActionDeck`, `RoomViewport`, `PlayerHeader`, `FactsPanel`, `OracleForm`, `Runes`, `VolumeControls`.
- **components/screens** — Full-page screens. One folder per screen (e.g. `GameScreen/` with `index.tsx`, `GameScreenHeader.tsx`, etc.). No subdomain folders under `screens/`.

## Composition

- **Screens** — As much as possible, screen components are made of **unique** and **generic** components. Prefer screen sub-components (e.g. `GameScreenHeader`, `GameScreenMain`) that use unique/generic elements. Extract inline UI blocks into unique components.
- **Unique** — As much as possible, unique components are made of **generic** components (Modal, GameButton, NavButton, StatBox, LoadingOverlay). Use raw elements only when no generic fits.
- **Generic** — Stay domain-agnostic. No imports from `features/game` or `features/narrative`; no domain types.

## Imports

- Screens: import from `@/components/elements/unique` and `@/components/elements/generic` (or specific files).
- Unique: import from `@/components/elements/generic` and other unique elements as needed.
- Generic: no component imports from `components/`; only `lib/`, `features/` for non-domain utils if needed.

## Summary

| Layer    | Uses                    | Avoid                          |
|----------|-------------------------|--------------------------------|
| Screens  | unique + generic        | Inline domain UI, raw markup   |
| Unique   | generic + other unique  | Large inline blocks            |
| Generic  | (none from components)  | Domain types or feature imports |
