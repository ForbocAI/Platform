# Component structure

## Folder layout

Under `src/components/` use exactly three areas. **Maintain this folder structure** for all components:

- **components/elements/generic** — Reusable primitives with no game/narrative domain. Examples: `GameButton`, `NavButton`, `Modal`, `LoadingOverlay`, `StatBox`.
- **components/elements/unique** — Domain-specific components. Group by subdomain: `game/`, `narrative/`, `shared/`. Examples: `ActionDeck`, `RoomViewport`, `PlayerHeader`, `FactsPanel`, `OracleForm`, `Runes`, `VolumeControls`.
- **components/screens** — Full-page compositions. One folder per screen (e.g. `GameScreen/` with `index.tsx`, `GameScreenHeader.tsx`, etc.). No subdomain folders under `screens/`.

## Composition rules

1. **Screens**  
   **As much as possible**, screen components are made of **unique** and **generic** components. Build screens only from unique and generic elements. Prefer screen sub-components (e.g. `GameScreenHeader`, `GameScreenMain`) that themselves use unique/generic elements. Avoid large blocks of inline JSX in screen files; extract to unique components when it represents a distinct UI area.

2. **Unique elements**  
   **As much as possible**, unique components are made of **generic** components. Use `Modal` for dialogs and overlay panels, `GameButton`/`NavButton` for actions, `StatBox` for stat display, `LoadingOverlay` for loading states. Use raw `<button>` or `<div>` only when a generic doesn’t fit (e.g. icon-only, custom layout).

3. **Generic elements**  
   Stay domain-agnostic. No imports from `features/game`, `features/narrative`, or domain types. Accept only props that describe presentation (labels, callbacks, variants).

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
