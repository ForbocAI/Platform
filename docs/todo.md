# Platform TODO — Full Playtest & Architecture Improvement

---

## Master Checklist

### Phase 1: Browser Playtest (ACTIVE)
- [x] Load `http://localhost:3000` and take initial screenshots
- [x] Test Init flow (class selection → game start)
- [ ] Test Movement (N/S/E/W), Map toggle
- [ ] Test SCAN, ENGAGE, COMMUNE, Oracle
- [ ] Test Trading, Inventory, Sacrifice, Currency
- [ ] Test Combat (melee + spells), Death/Concession, Respawn
- [ ] Test Hazards, Level generation, NPCs
- [ ] Test Vignette, Facts, Stage selector
- [ ] Test Crafting/Farming (Base Camp)
- [ ] Test Quests, Session scoring, Level progression
- [x] Test Autoplay (full, focused modes)
- [x] Test Servitors
- [x] 2-Minute Global Soak Test (2026-02-20): Stable, 0 hydration errors.
- [x] Screenshot/document all findings

### Phase 2: Gameplay Improvements
- [ ] Fix any bugs found in Phase 1
- [ ] Improve autoplay intelligence
- [ ] Add mushroom variety (per request: different effects)
- [ ] Balance improvements based on design docs
- [ ] Lore UX improvements (Quadar, Forboc, Qvht alignment)

### Phase 0/3: Architecture Audit & Refactoring (ACTIVE)
- [x] Audit for lore-specific names (Oracle, Kamenal, Ranger)
- [x] Deep Audit of Forboc ECS reference (`client/src/features`)
- [x] Phase 1: Universal Entity Model
    - [x] Define `Actor` & `Component` interfaces in `entities/types.ts`
    - [x] Standardize and migrate `AgentPlayer` / `AgentNPC` to `Actor`
- [x] Phase 2: Lore-Agnostic Renaming
    - [x] Rename `oracle.ts` thunks to `inquiry.ts`
    - [x] Rename `Ranger` -> `Agent` globally in logic identifiers
    - [x] Rename `Kamenal` -> `Identity / Primary-Agent` in state
- [ ] Phase 3: Directory Realignment (ECS Domain Mapping)
    - [ ] Move `slice/` -> `store/`
    - [ ] Move logic to `mechanics/orchestrators` and `mechanics/systems`
    - [ ] Move pure state changes to `mechanics/transformations`
- [ ] Phase 4: Component Normalization
    - [ ] Refactor unique components in `features/game/ui` to use generic helpers

### Phase 4: Documentation
- [ ] Update PLAYTEST_AUTOMATION.md with findings
- [ ] Update bot.md
- [ ] Final build verification

---

> **Context for any agent continuing this work:**  
> This doc is the single source of truth for what has been done, what's in progress, and what remains.  
> The game is **Qua'dar** — an esoteric single-player RPG running as a Next.js 16 app at `http://localhost:3000`.  
> Reference the prompt at the bottom of `docs/PLAYTEST_AUTOMATION.md` for the full task description.

---

## What was just completed (2026-02-19)

### SDK Import Fix
**Problem:** The Platform was importing `@forbocai/browser@0.4.10` which used `@xenova/transformers` (deprecated). This caused a `TypeError: Cannot convert undefined or null to object` on startup because Turbopack couldn't resolve the module's Node.js internals.

**What we did:**
1. Updated `package.json` to use `"latest"` for `@forbocai/core` and `@forbocai/browser`
2. Ran `npm install @forbocai/browser@0.5.4 @forbocai/core@0.5.4` (need explicit version because `npm install` with `"latest"` still reads lockfile)
3. Verified `@xenova/transformers` is gone from `node_modules`

**SDK Model Abstraction Fix:**
**Problem:** After fixing the import, a second error appeared: `ModelNotFoundError: Cannot find model record in appConfig for smollm2-135m`. The SDK was passing the user-supplied friendly name `'smollm2-135m'` directly to WebLLM, but WebLLM needs the exact model ID `SmolLM2-135M-Instruct-q0f16-MLC`.

**What we did (in `/Users/seandinwiddie/GitHub/sdk`):**
1. Made `model` optional in `CortexConfig` (`packages/core/src/types.ts`) — game devs never specify a model
2. Added `MODEL_ALIASES` map + `resolveModelId()` in `packages/browser/src/cortex.ts`:
   ```typescript
   const MODEL_ALIASES: Record<string, string> = {
       'smollm2-135m':  'SmolLM2-135M-Instruct-q0f16-MLC',  // NOTE: q0f16, NOT q4f16_1
       'smollm2-360m':  'SmolLM2-360M-Instruct-q4f16_1-MLC',
       'smollm2-1.7b':  'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
       'llama3-8b':     'Llama-3.1-8B-Instruct-q4f16_1-MLC',
   };
   ```
3. Removed `model` parameter from Platform's `cortexService.ts` — now just `createCortex({ apiUrl })`
4. Removed `model` from public docs `installation.mdx` — now just `createCortex()`
5. User rebuilt and republished SDK as `v0.5.4`

**Files changed:**
- `/Users/seandinwiddie/GitHub/sdk/packages/core/src/types.ts` — `model` is now `model?: string`
- `/Users/seandinwiddie/GitHub/sdk/packages/browser/src/cortex.ts` — added `MODEL_ALIASES`, `resolveModelId()`, `DEFAULT_MODEL`
- `/Users/seandinwiddie/GitHub/Forboc.AI/Platform/package.json` — `@forbocai/core` and `@forbocai/browser` set to `"latest"`
- `/Users/seandinwiddie/GitHub/Forboc.AI/Platform/src/features/game/sdk/cortexService.ts` — removed `model: 'smollm2-135m'` from `createCortex()` call
- `/Users/seandinwiddie/GitHub/forbocai/fern/docs/pages/npm/installation.mdx` — removed `model` from quick-start example

**Current SDK state on NPM:** `@forbocai/browser@0.5.4`, `@forbocai/core@0.5.4`

> **IMPORTANT:** When running `npm install` with `"latest"` in package.json, npm may cache old versions via the lockfile. To force the latest, run: `npm install @forbocai/browser@latest @forbocai/core@latest` (or specify the exact version like `@0.5.4`).

---

## Current Phase: Phase 1 — Browser Playtest

### What to do
Systematically test every single-player flow in the game via the browser at `http://localhost:3000`. Use URL params for focused testing. Take screenshots. Document findings.

### How to test (step by step)

**1. Init flow:**
```
http://localhost:3000/?deterministic=1
```
- Should show: Ashwalker (Kamenal), Level 12, HP 120/120, Spirit 20, Blood 0
- Room: "Testing Grounds" (SDK fallback mode) or "Store Room" (if SDK loads)
- If stuck on "INITIALIZING...", click the Retry button (`data-testid="loading-retry"`)

**2. Movement:**
- Click N/S/E/W buttons (`data-testid="move-north"`, etc.)
- Room title and description should change
- Neural Log should show "Moved [direction]"

**3. SCAN:**
- Click "Scan sector" (`data-testid="action-scan"`)
- Neural Log shows `[SCAN RESULT]` with Location, Biome, Hazards, Hostiles, Allies, Exits
- Quest "Scan 5 sectors" should increment

**4. ENGAGE (Combat):**
```
http://localhost:3000/?deterministic=1&forceEnemy=1
```
- Click "Engage enemy" (`data-testid="action-engage"`)
- Should see combat log with damage numbers
- Enemy HP decreases; if enemy dies: +50 XP, +5 Spirit, +2 Blood

**5. COMMUNE:**
- Click "Commune with void" (`data-testid="action-commune"`)
- Log shows Oracle answer, Facts panel gets entry, +1 Spirit

**6. Oracle:**
- Type in "Ask Oracle..." input (`data-testid="oracle-input"`), click Send (`data-testid="oracle-submit"`)
- Log shows question + Oracle answer with Roll and Surge

**7. Trading:**
```
http://localhost:3000/?deterministic=1&forceMerchant=1
```
- Click "Trade" on merchant → TradePanel opens
- Buy deducts Spirit; Sell adds Spirit
- Buy disabled when insufficient Spirit/Blood

**8. Inventory / Equipment / Sacrifice:**
- Click "Items" (`data-testid="inventory-toggle"`)
- Equip/Unequip items; stats should update
- Use consumables (heal/stress relief)
- Sacrifice items for Spirit

**9. Death / Concession:**
```
http://localhost:3000/?deterministic=1&lowHp=1&forceEnemy=1
```
- ENGAGE until player dies
- Concession modal appears; Reject → respawn

**10. Autoplay:**
```
http://localhost:3000/?deterministic=1&autoStart=1&autoSpeed=fast
```
- Game should auto-play: moving, scanning, fighting, looting, trading
- Watch for crashes or stuck states over 5+ minutes

**11. Crafting / Farming (Base Camp):**
```
http://localhost:3000/?autoStart=1&autoFocus=baseCamp
```
- Autoplay should enter base camp, harvest mushrooms, craft items

**12. Servitors:**
```
http://localhost:3000/?deterministic=1&forceMerchant=1&forceEnemy=1
```
- Buy Contract from merchant → Use in Inventory → Servitor joins
- ENGAGE → Servitor participates in combat

### Initial playtest findings (2026-02-19)

**Init state verified (`?deterministic=1`):**
- ✅ Ashwalker (Kamenal), Level 12, 120/120 HP, 20 Spirit, 0 Blood
- ✅ Quests seeded: Scan 5, Find Fellow Agent, Defeat 3, Trade 2
- ✅ Action Deck: SCAN, ENGAGE, COMMUNE, Navigation, Capabilities, Skills, Items
- ✅ Vignette: "Sacrificing Chambers · Exposition"
- ⚠️ Room description says "The SDK modules failed to load. Operating in local fallback mode." — expected if no WebGPU.
- ✅ Reducer Determinism & Hydration: Fixed (2026-02-20). Neural Log no longer stalls.
- **TODO:** Global soak test for all biomes/loops.

### Autoplay stuck bug — FIXED (2026-02-19)

**Root cause:** In `src/features/game/slice/thunks/autoplay.ts`, the `runAutoplayTick` thunk calls `sdkService.getAgent()` → `agent.process()`. When the SDK Cortex (WebLLM) fails to initialize (no WebGPU in the test browser), `agent.process()` calls `cortex.complete()` which tries to use a null engine. This either throws or hangs as a never-resolving Promise.

**The hang is the critical part:** The `runAutoplayTick` thunk has a `try/catch` for thrown errors, but if the Promise hangs forever (never resolves, never rejects), the thunk never reaches its `return` statement (line 276). This means:
- `game/runAutoplayTick/fulfilled` never fires
- The `uiSlice` extraReducer that sets `autoplayNextTickAt` never runs
- `BotOrchestrator.orchestratePlayer()` sees `autoplayNextTickAt == null` and does nothing
- **Autoplay permanently stops after the first tick**

**Fix applied:** Added a `Promise.race()` with a 5-second timeout around the entire SDK call:
```typescript
const sdkPromise = (async () => {
  const agent = await sdkService.getAgent();
  const observation = toObservation(state.game);
  dispatch(setAgentPondering('player-autoplay'));
  const response = await agent.process(observation.content, state.game as any);
  dispatch(clearAgentPondering('player-autoplay'));
  return response;
})();
const timeoutPromise = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error('SDK timeout')), 5000)
);
const response = await Promise.race([sdkPromise, timeoutPromise]);
```

Now when the SDK hangs, the timeout rejects after 5s, the catch block fires, and the thunk falls through to the pure behavior tree. The thunk completes normally and `autoplayNextTickAt` is rescheduled.

**File changed:** `src/features/game/slice/thunks/autoplay.ts` (lines 223-253)

### Cortex init hang — FIXED (2026-02-19)

**Root cause (deeper):** The autoplay timeout fix above wasn't enough because `cortex.init()` itself in `cortexService.ts` was hanging the main thread. When WebLLM creates a WebWorker for WebGPU and the browser doesn't support it (e.g. headless, no GPU), the `init()` Promise never resolves AND it blocks the event loop. This caused:
- Browser click timeouts (connection resets)  
- The entire game to freeze
- Autoplay ticks never firing because the thunk was blocked before reaching the behavior tree

**Fix applied:** In `src/features/game/sdk/cortexService.ts`:
1. Added a `Promise.race()` with 10-second timeout around `cortex.init()`
2. On failure, set `this.cortex = null` so all downstream methods (`consultOracle`, `generateStartArea`, `agent.process`) use their fallback/mock paths
3. This means: Cortex init will either succeed within 10 seconds or fail gracefully, and the game operates in pure local fallback mode

**File changed:** `src/features/game/sdk/cortexService.ts` (lines 55-69)

**File changed:** `src/features/game/sdk/cortexService.ts` (lines 55-69)

### Autoplay stuck on Vignette — FIXED (2026-02-19)

**Root cause:** Even with SDK timeouts, the autoplay bot would perform one SCAN and then get stuck because the game automatically starts a "Vignette" (exposition overlay). The behavior tree lacked a node to perceive or handle vignettes, so it would return `idle`. Since `handleVignetteProgression` was only called as a side effect of movement/commune, and the bot was stuck at `idle`, it would never progress.

**Fix applied:**
1.  **AI Types:** Added `hasActiveVignette` to `AwarenessResult` and `advance_vignette` to `AgentActionType`.
2.  **Awareness:** Updated `computeAwareness` to detect active vignettes from the narrative slice.
3.  **Behavior Tree:** Added `nodeVignette` as a high-priority Node 0.5 (just after SDK/Rival overrides).
4.  **Actuator:** Updated `actuate.ts` in the autoplay thunk to handle the `advance_vignette` action by calling `handleVignetteProgression`.

**Files changed:**
- `src/features/game/mechanics/ai/types.ts`
- `src/features/game/mechanics/ai/awareness.ts`
- `src/features/game/mechanics/ai/behaviorTree/nodesSurvival.ts`
- `src/features/game/mechanics/ai/behaviorTree/index.ts`
- `src/features/game/slice/thunks/autoplay.ts`

### AI Orchestrator dead code — FIXED (2026-02-19)

**Root cause:** A typo in `src/features/game/middleware/autoplayListener.ts` prevented the `BotOrchestrator` from ever starting. It was listening for `game/initializeGame/fulfilled` but the actual thunk action type is `game/initialize/fulfilled`. This meant the `setInterval` that drives the AI loop was never created.

**Fix applied:** Corrected the action type in the listener predicate.

---

## Phase 2: Gameplay Improvements (after playtest)

### What to do
Based on playtest findings, fix bugs and make improvements:

1. **Mushroom system expansion** — Add more mushroom types with different effects:
   - Current: Glowing Mushroom, Chromatic Cap, Void Morel, Chthonic Truffle, Ember Puffball, Static Lichen
   - Add: varieties with unique buffs (damage boost, armor, speed, mana regen, etc.)
   - Inspiration: cozy farming sim meets Mortal Shell / Diablo / Cyberpunk
   - File: `src/features/game/mechanics/materials.ts` — mushroom definitions
   - File: `src/features/game/content.ts` — WARE_POOL and item data

2. **Autoplay intelligence** — Improve bot decision-making:
   - File: `src/features/game/mechanics/ai/` — the AI behavior tree
   - Reference: `/Users/seandinwiddie/GitHub/Forboc/client/src/features/mechanics/` — the Forboc ECS reference
   - Bot should use all game features: crafting, Oracle, vignettes, servitors, etc.
   - Bot and NPCs should share the same logic

3. **Lore UX improvements** — Add Qvht/Forboc/Quadar flavor:
   - Reference: `/Users/seandinwiddie/GitHub/Forboc/notes/quadar.md` — world, characters, classes, spells
   - Reference: `/Users/seandinwiddie/GitHub/Forboc/notes/quadar_ familiar.md` — d100/d20 tables, modifiers, Speculum
   - Reference: `/Users/seandinwiddie/Documents/GitHub/qvht.github.io` — spirit/blood/sacrifice cosmology
   - Reference: `/Users/seandinwiddie/Documents/GitHub/forboc.github.io` — grimdark cyberpunk noir style

4. **Balance** — Verify XP/currency/combat values against design doc tables

---

## Phase 0 & 3: Architecture Audit (status check last)

### What's already done
- `src/components/elements/generic/` — 6 generic components (GameButton, LoadingOverlay, Modal, NavButton, StatBox)
- `src/components/elements/unique/` — game-specific and narrative-specific components
- `src/components/screens/` — screen-level components
- `src/features/game/mechanics/` — partially ECS-aligned (ai/, capabilities/, classes, hazards, etc.)
- `src/features/game/entities/` — entity definitions
- `src/features/game/slice/` — Redux state with reducers/ and thunks/

### What remains
- **Lore-agnostic naming:** Audit file/function/variable names. Keep lore in UI strings and data content, NOT in engineering identifiers. Example: `oracle.ts` → `divination.ts` or `query.ts`; but the UI can still say "Ask the Oracle..."
- **ECS restructuring:** Compare current `features/game/` structure vs Forboc reference ECS:
  ```
  Forboc ECS reference:
  features/
  ├── entities/          (characters, components, environments, session)
  ├── mechanics/         (factories, orchestrators, services, transformations, systems, utils)
  ├── session/           (session management)
  ├── settings/          (config)
  ├── store/             (Redux)
  └── ui/                (game UI components)
  ```
- **Component refactoring:** Move more unique components into generic. Screen components should only compose generic + unique. Unique should only compose generic.
- **Subdomain refactoring by line count:** Largest files first. Check with:
  ```bash
  find src/features/game -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -20
  ```

### Key architectural rules (from condensed.md)
- FP/Redux, reducer-first architecture
- No automated tests (Jest/Cypress), backend, db, or Expo
- Web client only
- All state changes through Redux reducers
- Use createSlice / createAsyncThunk

---

## Key file locations

| What | Where |
|------|-------|
| Game logic | `src/features/game/` |
| Redux slices | `src/features/game/slice/` |
| AI / Autoplay | `src/features/game/mechanics/ai/` |
| Combat | `src/features/game/combat.ts` |
| Content / Items | `src/features/game/content.ts` |
| Types | `src/features/game/types.ts` |
| SDK service | `src/features/game/sdk/cortexService.ts` |
| Components (generic) | `src/components/elements/generic/` |
| Components (unique) | `src/components/elements/unique/` |
| Screens | `src/components/screens/` |
| Playtest docs | `docs/PLAYTEST_AUTOMATION.md` |
| Currency docs | `docs/CURRENCY_AUDIT.md` |
| Bot docs | `docs/bot.md` |
| This file | `docs/todo.md` |

## Key reference locations (outside Platform)

| What | Where |
|------|-------|
| SDK source | `/Users/seandinwiddie/GitHub/sdk/` |
| Forboc ECS reference | `/Users/seandinwiddie/GitHub/Forboc/client/src/features/` |
| Game design (Familiar) | `/Users/seandinwiddie/GitHub/Forboc/notes/quadar_ familiar.md` |
| Game world (Quadar) | `/Users/seandinwiddie/GitHub/Forboc/notes/quadar.md` |
| Code standards | `/Users/seandinwiddie/GitHub/Forboc/notes/ref/standards/technology-maintenance/condensed.md` |
| Qvht lore | `/Users/seandinwiddie/Documents/GitHub/qvht.github.io/` |
| Forboc lore | `/Users/seandinwiddie/Documents/GitHub/forboc.github.io/` |
| Classified docs | `/Users/seandinwiddie/GitHub/Forboc.AI/classified/docs/` |
| Public docs (Fern) | `/Users/seandinwiddie/GitHub/forbocai/fern/docs/` |

---

## URL params for testing

| Param | Effect |
|-------|--------|
| `?deterministic=1` | Fixed start: Ranger/Ashwalker, Lvl 12, 120 HP, basic gear, no random NPCs |
| `?forceEnemy=1` | Adds enemy to starting room |
| `?forceMerchant=1` | Adds merchant to starting room |
| `?lowHp=1` | Sets HP to 5 (combine with forceEnemy for death testing) |
| `?autoStart=1` | Auto-start autoplay after init |
| `?autoFocus=<mode>` | `combat`, `explore`, `trade`, `heal`, `oracle`, `loot`, `baseCamp`, `full` |
| `?autoSpeed=<speed>` | `fast` (1s→200ms), `slow` (5s→500ms), `normal` (2.8s→200ms) |
| `?simulateInitError=1` | Forces init failure for retry testing |
