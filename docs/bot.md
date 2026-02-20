# Bot & Autoplay System

## Overview

The Platform uses a unified AI system for NPCs (Servitors, Enemies) and the Autoplay feature ("Ghost Agent"). The architecture is designed to be compatible with the future **ForbocAI SDK**.

**Key Principles:**
1.  **Unified Brain**: All agents (Player Autoplay, NPCs) use the same Behavior Tree logic.
2.  **SDK-First**: The system is designed to consume SDK Directives (`CortexDirective`) as the highest-priority decision node.
3.  **Mock Pipeline**: Currently, a mock SDK implementation in `src/lib/sdk-placeholder` simulates the `Observe -> Reason -> Act` loop.

---

## architecture

### 1. Perception (`awareness.ts`)
*   **Role**: The "Eyes & Ears". reliably reads Redux state and outputs an `AwarenessResult`.
*   ** SDK Alignment**: Maps 1:1 to the SDK `Observation` protocol.

### 2. Decision (`behaviorTree/`)
*   **Role**: The "Brain". A prioritized Behavior Tree with modular node architecture.
*   **Structure**:
    *   **Node 0 (Priority)**: **SDK Cortex Directive** (injected from `src/lib/sdk-placeholder/cortexDirective.ts`)
    *   **Node 1**: Survival (Heal, Flee, Post-Respawn Preparation)
    *   **Node 2**: Base Camp (Harvest, Craft)
    *   **Node 3**: Equipment (Gear Management)
    *   **Node 4**: Combat (Engage, Spell)
    *   **Node 5**: Loot (Pick Up Items)
    *   **Node 6**: Economy (Strategic Trading)
    *   **Node 6.5**: Quest Prioritization (Active Quest Pursuit)
    *   **Node 7**: Recon (Scan, Perform Inquiry with Cooldowns)
    *   **Node 8**: Exploration (Move with Proactive Pathfinding & Fallback Strategy)
    *   **Node 9**: Idle
*   **Modular Architecture**: Split into `nodesSurvival.ts`, `nodesAction.ts`, `nodesQuest.ts`, `cooldowns.ts`, and `helpers.ts` for maintainability.

### 3. Actuation (`autoplay.ts`)
*   **Role**: The "Hands". Executes the `AgentAction` via Redux thunks.

---

## SDK Integration Status

*   **Mock SDK**: located in `src/lib/sdk-placeholder/`
*   **Cortex Directive**: implemented in `cortexDirective.ts`
*   **Wiring**: The autoplay thunk (`autoplay.ts`) calls `getSDKDirective()` and passes it to `runBehaviorTree`.

**TODO for Full Integration**:
1.  Replace `getSDKDirective()` with actual `SDK.Cortex.processObservation()` + `SDK.Cortex.generateAction()`.
2.  Ensure `cortexMapper` (to be created) correctly transforms game state to SDK `Observation`.

---

## Deployment

**⚠️ Manual Deployment Required**: After committing and pushing changes, deployment to Vercel must be done manually using:

```bash
vercel --prod --yes
```

This ensures builds are tested locally before deployment and prevents automatic deployments from breaking production.

## Testing & Automation (`autoplayListener.ts`)

The system supports URL parameters for automated testing ("Ghost Mode"):

| Parameter | Values | Description |
| :--- | :--- | :--- |
| `autoStart` | `1` | Automatically initializes game and starts autoplay loop. |
| `autoFocus` | `combat` | Forces AI to only perform combat actions. |
| `autoFocus` | `explore` | Forces AI to only explore (move, scan, loot). |
| `autoFocus` | `trade` | Forces AI to trade with merchants. |
| `autoFocus` | `heal` | Forces AI to focus on survival/healing. |
| `autoFocus` | `baseCamp` | Forces AI to work in the base camp. |
| `autoSpeed` | `fast`, `slow` | `fast` = 1s ticks, `slow` = 5s ticks. Default ~2.8s. |
| `deterministic` | `1` | Forces seeded RNG for reproducible runs. |

**Example Test URL**:
`http://localhost:3000/?deterministic=1&autoStart=1&autoFocus=combat&autoSpeed=fast`

---

## Recent Progress

### 2026-02-12: Macro-Level Bot Improvements

- **Action Cooldowns & Throttling**: Implemented cooldown system (`cooldowns.ts`) to prevent action spam. Buy/sell actions have 3-action cooldowns, inquiry actions have 5-action cooldowns, scan has 2-action cooldown. Added loop detection to break repetitive action patterns.
- **Quest Prioritization Node**: Created dedicated quest node (`nodesQuest.ts`) that actively pursues incomplete objectives. Prioritizes quests by progress ratio and type (reconnaissance > hostiles > merchant > rescue). Bot now actively seeks quest objectives rather than completing them incidentally.
- **Strategic Resource Management**: Enhanced economy node with goal-driven trading:
  - Priority 1: Sell excess inventory (always)
  - Priority 2: Buy healing items when HP < 60% and inventory empty
  - Priority 3: Buy upgrades when spirit >= 20
  - Respects cooldowns to prevent trading loops
- **Exploration Fallback Strategy**: Added intelligent fallback when all rooms are explored:
  - Returns to base camp if not already there
  - Seeks combat for XP when HP is good
  - Moves to safe areas when HP is low
  - Patrols randomly as last resort
- **Action Memory & State Tracking**: Added `lastActionType` and `actionHistory` to `AwarenessResult`. Bot now tracks recent actions (last 10) to inform decision-making and prevent loops.
- **Enhanced Exploration Efficiency**: Improved pathfinding to prioritize unvisited exits when not compromised, use safe exits when compromised, and better handle explored vs unexplored room decisions.

### 2026-02-11: Core Survival & Awareness

- **Proactive Pathfinding**: ✅ **COMPLETED** - Agents evaluate adjacent rooms for safety before entering. When compromised (HP < 50%), agents avoid unexplored rooms and prioritize `baseCampExits` and `safeExits`. Added evacuation logic for dangerous rooms.
- **Combat Persistence**: Refactored `behaviorTree.ts` to ensure agents commit to combat until the target is defeated or the agent's health is critical. Verified by "Defeat hostiles" quest completions.
- **Hazard Awareness**: Implemented real-time detection of damage-dealing environments (Toxic Air, Radioactive Decay, Void Instability, Extreme Cold, Scorching Heat). Agents prioritize evacuating hazardous rooms when HP is below 50%.
- **Smarter Trading**: Updated `actuate('buy')` to prioritize healing consumables over equipment when the player's inventory lacks healing resources.
- **Enhanced Awareness**: Added `inCombat`, `recentDamage`, `isDangerousRoom`, `safeExits`, `baseCampExits`, and `justRespawned` fields to `AwarenessResult` for more granular decision metrics.
- **Self-Preservation**: Fixed flee thresholds and added a "Return to Base Camp" fallback state for when HP is critical and no healing items remain.
- **Resurrection Chain Handling**: ✅ **COMPLETED** - Added post-respawn preparation logic that equips gear, scans environment, heals if needed, and evacuates dangerous rooms before exploring.
- **Class-Specific SDK Focus**: ✅ **COMPLETED** - Implemented class-specific modifiers in `classModifiers.ts` that adjust healing thresholds, aggression, spell preferences, and buying behavior based on character class (Ashwalker, Doomguard, Obsidian Warden, etc.).
- **Technical Debt**: ✅ **COMPLETED** - Resolved file size violations by splitting large files:
  - `spells.ts` (710 lines) → 7 modular files by class/category
  - `cortexDirective.ts` (415 lines) → 6 specialized modules
  - `behaviorTree.ts` (380 lines) → 4 modular nodes
  - `combat.ts` (316 lines) → refactored with helper functions (262 lines)

## Left To Be Done

1. **Full SDK v1.0 Integration**: Replace mock `getSDKDirective` pipeline with the actual ForbocAI SDK calls (`processObservation` -> `generateAction`). ---Saved for later, as the SDK is not yet ready.
2. **Healing Priority Tuning**: Fine-tune survival node priorities when bot is at low HP but engaged in combat. Consider whether healing should interrupt combat more aggressively or if current behavior (fighting until HP < 25%) is optimal.
3. **Quest-Specific Pathfinding**: Enhance quest node to use pathfinding hints (e.g., seek rooms with merchants for merchant quests, seek unexplored areas for reconnaissance quests).
4. **Advanced Cooldown Strategies**: Consider dynamic cooldowns based on game state (e.g., longer cooldowns when inventory is full, shorter when resources are abundant).
5. **Exploration Memory**: Track recently visited rooms to avoid immediate backtracking and improve exploration efficiency.

## Architecture Notes

### File Structure
- `src/features/game/mechanics/ai/`
  - `types.ts` - Core AI types and interfaces
  - `awareness.ts` - Perception system (computes `AwarenessResult`)
  - `behaviorTree/` - Decision system (modular nodes)
    - `index.ts` - Main behavior tree runner
    - `nodesSurvival.ts` - Survival, base camp, equipment nodes
    - `nodesAction.ts` - Combat, loot, economy, recon, exploration nodes
    - `nodesQuest.ts` - Quest prioritization node
    - `cooldowns.ts` - Action cooldown utilities
    - `helpers.ts` - Shared helper functions
- `src/lib/sdk-placeholder/` - Mock SDK implementation
  - `cortexDirective.ts` - Main entry point
  - `directiveGeneration.ts` - Action generation logic
  - `classModifiers.ts` - Class-specific behavior modifiers
  - `observation.ts` - State observation mapping
  - `config.ts` - Configuration utilities
  - `types.ts` - SDK placeholder types