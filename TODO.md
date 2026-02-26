# 🌑 FORBOC AI: THE PLATFORM - TASK LOG 🌑

`Státus: WIP // Próítect_Level: CRITICAL`

**ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ**

This log tracks the engineering requirements for the flagship Forboc AI consumer interface.

---

## SDK Integration Strategy

> **Principle:** Platform MUST run without the SDK. SDK integration is feature-gated via `?FORBOCAI_SDK=ON` and is implemented incrementally. Platform code fixes come AFTER SDK + API are stabilized.

### Completed ✅
- [x] **SDK Dependencies Installed**: `@forbocai/core@^0.5.6`, `@forbocai/browser@^0.5.6` in `package.json`.
- [x] **Feature Gate**: `?FORBOCAI_SDK=ON` query param controls SDK activation. Default: OFF (uses local procedural logic).
- [x] **SDK Service Scaffolded**: `sdkService.init()` via `BootstrapGate` (only runs when gate is ON).
- [x] **Soul Re-hydration**: Load NPC personas from Arweave Transaction IDs (via `sdkService.rehydrateAgent` and `BotOrchestrator`).
- [x] **Fix SDK Init Crash**: Resolved via Next.js Turbopack `resolveAlias` that safely stubs `web-llm`, `orama`, and `transformers` on the SSR environment.
- [ ] **Cortex Integration**: Bind `Cortex.on('token')` to VOX-LOG for real-time typewriter effects (requires working Cortex).
- [ ] **Agent Directive Loop**: `Agent.process()` calls during combat/exploration for NPC intent (requires working multi-round protocol).
- [ ] **Bridge Validation**: Pipe actions through `SDK.Bridge.validate()` before updating store (requires working Bridge).
- [ ] **Memory Persistence**: Configure SDK to persist LanceDB memories to IndexedDB.
- [ ] **Replace SDK Placeholder**: Once SDK is stable, swap `src/lib/sdk-placeholder` with real `forbocai` calls (keep same interface shape).

## Qua'dar System Implementation (The Law of the Spire) ᛒ
*Objective: Instantiate the grimdark TTRPG rules within the digital engine.*

- [x] **Class & Spell Mechanics**: Port the attributes and unique spell architectures from `quadar.md`.
- [x] **Starting Initiation**: Level 12 Rogue/Ranger starting state and "nexus spawn" logic from `quadar_familiar.md`.
- [x] **Loom of Fate Logic**: `Surge Count` and narrative modifier tables for world-event consequences.
- [x] **Narrative Momentum**: "Chipping vs. Cutting" questioning heuristics in directive synthesis.
- [x] **Level Progression**: XP gain, level up thresholds, stat scaling (MaxHP).

---

*NEURAL_LINK_STABILITY: 34% // DO_NOT_INTERRUPT*
