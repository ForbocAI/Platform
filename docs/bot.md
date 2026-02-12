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

### 2. Decision (`behaviorTree.ts`)
*   **Role**: The "Brain". A prioritized Behavior Tree.
*   **Structure**:
    *   **Node 0 (Priority)**: **SDK Cortex Directive** (injected from `src/lib/sdk-placeholder/cortexDirective.ts`)
    *   **Node 1**: Survival (Heal, Flee)
    *   **Node 2**: Base Camp (Harvest, Craft)
    *   **Node 3**: Equipment
    *   **Node 4**: Combat (Engage, Spell)
    *   **Node 5**: Loot
    *   **Node 6**: Economy
    *   **Node 7**: Recon (Scan)
    *   **Node 8**: Exploration (Move)
    *   **Node 9**: Idle

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