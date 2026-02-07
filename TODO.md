# 🌑 FORBOC AI: THE PLATFORM - TASK LOG 🌑

`Státus: WIP // Próítect_Level: CRITICAL`

**ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ**

This log tracks the engineering requirements for the flagship Forboc AI consumer interface.

---

## 1. SDK Integration (Core Neural Link) ⚠️
*Objective: Replace the mock engine with the actual ForbocAI SDK.*

- [ ] **Install ForbocAI SDK**: `pnpm install forbocai`.
- [ ] **Initialize Cortex**: Set up `Cortex.init()` in `src/app/layout.tsx` to pre-load local SLM weights (WebGPU).
- [ ] **Create SDK Service**: Implement `src/lib/sdk/cortexService.ts` to manage agent instances.
- [ ] **Pipe Awareness to SDK**: Connect the current Quadar engine observations to `SDK.Memory.store()`.

## 2. Neuro-Symbolic Interaction 🧠
*Objective: Transform static text logs into living dialogue.*

- [ ] **Generative Dialogue UI**: Bind `Cortex.on('token')` to the VOX-LOG Receptacle for real-time typewriter effects.
- [ ] **Agent Directive Loop**: Implement `Agent.process()` calls during combat and exploration to determine NPC intent.
- [ ] **Pondering Animations**: Trigger NPC "Thinking" states in the UI based on `Cortex.on('thinking')`.

## 3. The Bridge (Action Validation) ⚔️
*Objective: Ensure AI actions obey the laws of physics.*

- [ ] **Action Schema Definition**: Define `ProtocolAction` types in `src/lib/quadar/types.ts`.
- [ ] **Validate Actuation**: Pipe user and AI actions through `SDK.Bridge.validate()` before updating Redux/Zustand store.
- [ ] **System Correction**: Implement UI feedback for "Corrected Actions" returned by the Bridge.

## 4. World State Persistence 💾
*Objective: Ensure memories endure the void.*

- [ ] **IndexedDB Vector Sync**: Configure SDK to persist LanceDB memories to `IndexedDB`.
- [ ] **Soul Re-hydration**: Support loading NPC personas and memories from IPFS CIDs.

## 5. Qua'dar System Implementation (The Law of the Spire) ᛒ
*Objective: Instantiate the grimdark TTRPG rules within the digital engine.*

- [ ] **Class & Spell Mechanics**: Port the attributes and unique spell architectures (e.g., *Obsidian Surge*, *Hellfire Explosion*) from `quadar.md`.
- [ ] **Starting Initiation**: Implement the Level 12 Rogue/Ranger starting state and "nexus spawn" logic from `quadar_familiar.md`.
- [ ] **Loom of Fate Logic**: Integrate the `Surge Count` and narrative modifier tables for determining world-event consequences.
- [ ] **Narrative Momentum**: Implement the "Chipping vs. Cutting" questioning heuristics in the SDK's directive synthesis to maintain genre consistency.

---

*NEURAL_LINK_STABILITY: 34% // DO_NOT_INTERRUPT*
