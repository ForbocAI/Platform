<!-- COZY_CANOPY_PROTOCOL -->

```text
   .--.
  (o  o)
   |  |
   |__|
  /____\
```

---
# Bot and Autoplay System

Last verified: 2026-03-17

## Overview

Platform uses a shared decision system for:

- player autoplay
- NPC ticks
- companion ticks

The architecture is sound in principle: perception, decision, and actuation are already separated. The main remaining problems are transition debt and startup reliability.

## Current File Layout

- `src/features/game/mechanics/systems/ai/awareness.ts`
  - perception layer
- `src/features/game/mechanics/systems/ai/behaviorTree/`
  - decision nodes and behavior tree runner
- `src/features/game/mechanics/systems/ai/BotOrchestrator.ts`
  - central scheduler for player, NPC, and companion ticks
- `src/features/game/middleware/autoplayListener.ts`
  - listener-based poll startup
- `src/features/game/mechanics/orchestrators/autoplay.ts`
  - player autoplay thunk
- `src/features/game/mechanics/orchestrators/agency.ts`
  - generic agent tick behavior

## Current Decision Stack

The behavior tree currently resolves in roughly this order:

1. SDK directive override
2. vignette/special narrative handling
3. rival overrides
4. survival
5. base camp tasks
6. equipment management
7. companion prep
8. combat
9. loot
10. economy
11. quest pursuit
12. recon
13. exploration
14. idle fallback

## Perception Model

`computeAwareness()` currently gathers:

- nearby NPC presence
- vendors and trade affordability
- hazards and dangerous-area status
- HP and stress ratios
- healing/stress items
- base-camp opportunities
- route safety and unvisited exits
- quest progress
- recent action history
- companion contract availability

That is already a strong generic base for Lanternbough. The logic should be preserved while the lore gets swapped out.

## Orchestration Model

`BotOrchestrator.ts` currently:

- owns one player autoplay schedule
- owns per-agent schedules for NPCs and companions
- clears schedules before dispatching tick thunks
- updates continuously from a polling loop

This is the right general shape for a unified bot runtime.

## Current Problems

### Duplicate Poll Registration

`autoplayListener.ts` starts the poll on both:

- `app/bootstrap`
- `game/initialize/fulfilled`

There is no guard preventing multiple `setInterval` registrations.

### Duplicate SDK Init

SDK init is attempted in both:

- `src/app/BootstrapGate.tsx`
- `src/features/game/middleware/autoplayListener.ts`

This should be reduced to one clear initialization path.

### Build Break in SDK Layer

`src/features/game/sdk/cortexService.ts` currently breaks `npm run build`, so any docs claiming a healthy SDK-first autoplay pipeline would be misleading.

### Old Identity Leakage

Some bot config names and comments still carry Quadar-era identity:

- `NPC_RANGER_CONFIG`
- resource assumptions tied to Spirit/Blood
- class-driven behavior shaped around old class names

These should become more neutral over time.

## Transition Rules for Lanternbough

- keep the bot files mechanic-focused, not lore-focused
- prefer generic resource and role concepts at the AI layer
- put cozy fantasy specificity in data, copy, and content tables
- avoid teaching the AI with hard-coded grimdark assumptions in comments or naming

## Practical Next Steps

1. repair the SDK import contract
2. add a singleton guard around autoplay polling
3. remove duplicate SDK init
4. update config naming away from Quadar-specific role assumptions
5. revisit behavior priorities once Lanternbough classes and economy are defined
