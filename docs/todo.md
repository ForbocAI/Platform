<!-- COZY_CANOPY_PROTOCOL -->

```text
  /\_/\ 
 ( -.- )
  > ^ <
```

---
# Platform TODO

Last updated: 2026-03-17

This file tracks active repo-level work. Classified docs hold broader planning, but this file should remain useful on its own inside the Platform repo.

## Immediate Blockers

- [ ] Fix `src/features/game/sdk/cortexService.ts` so `npm run build` succeeds.
- [ ] Fix `__tests__/Home.spec.tsx` to render with Redux `Provider`.
- [ ] Guard or mock `AudioContext` so Vitest does not log runtime listener failures.
- [ ] Add a singleton guard to `src/features/game/middleware/autoplayListener.ts`.
- [ ] Remove duplicate SDK init between `BootstrapGate.tsx` and `autoplayListener.ts`.
- [ ] Re-implement `src/features/core/store/getInitOptions.ts`.

## Lanternbough Identity Reset

- [x] Replace legacy branding in `src/app/layout.tsx`.
- [ ] Replace old class roster in `src/features/game/mechanics/classes.ts`.
- [x] Rewrite visible lore strings across `src/features/game/content.ts` and related data sources.
- [x] Update UI labels from legacy economy language to Lanternbough economy language.
- [ ] Rewrite `docs/LORE.md`-aligned runtime copy so the repo and docs stop disagreeing.

## Gameplay and Systems

- [ ] Revisit autoplay priorities after the new economy and class roster are in place.
- [x] Replace old narrative thread seeds like `Reconnaissance` with Lanternbough equivalents.
- [ ] Audit trade, crafting, and companion copy for cozy fantasy tone.
- [x] Review hazard naming so challenge remains readable without legacy framing.

## UI and UX

- [x] Update metadata, title, and structured data to match the new game identity.
- [ ] Replace old aesthetic cues in shared presentation where they conflict with the cozy direction.
- [ ] Keep component APIs lore-agnostic while moving story specificity into content and copy.

## Docs

- [ ] Keep `docs/ARCHITECTURE.md` and `docs/COMPONENTS.md` aligned with the actual source tree.
- [ ] Keep `docs/PLAYTEST_AUTOMATION.md` honest about real selectors and real blockers.
- [ ] Keep `docs/bot.md` aligned with the actual AI file layout.

## Verification Gate

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `./node_modules/.bin/vitest run`
- [ ] Manual smoke check after the identity reset starts landing
