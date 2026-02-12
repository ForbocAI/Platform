/**
 * Shared AI types for the behavior system.
 *
 * Aligned with Forboc/client/src/features/entities/characters/bots/botTypes.ts.
 * SDK integration point: `CortexDirective` will be populated by the ForbocAI SDK
 * once integrated (see system-todo.md §1.2, Priority Node 0).
 */

import type { Player, Enemy, Room, Item, Servitor, ActiveQuest } from '../../types';

// ── Capabilities ──

/** Available capability modules that can be composed onto an agent */
export type AgentCapability =
    | 'awareness'     // Detect threats, merchants, loot
    | 'combat'        // Attack behavior
    | 'flee'          // Run from threats
    | 'explore'       // Room navigation
    | 'trade'         // Buy/sell with merchants
    | 'craft'         // Base camp crafting/harvesting
    | 'heal'          // Use consumables
    | 'equip'         // Gear management
    | 'oracle'        // Commune / ask oracle
    | 'loot'          // Pick up ground items
    | 'spell'         // Spell casting
    | 'quest'         // Quest awareness and progression
    | 'serve';        // Obey commands (servitor behavior)

// ── Traits ──

/** Personality traits that modify behavior intensity (0-1 scale) */
export interface AgentTraits {
    aggression: number;   // How eagerly agent engages in combat
    curiosity: number;    // How much agent explores vs stays put
    caution: number;      // How quickly agent heals/flees
    resourcefulness: number; // How much agent trades/crafts
    mysticism: number;    // How often agent communes with oracle
}

// ── Configuration ──

/** Complete agent configuration (static per agent type) */
export interface AgentConfig {
    id: string;
    type: 'player' | 'servitor' | 'npc';
    capabilities: AgentCapability[];
    traits: AgentTraits;
}

// ── Awareness ──

/** Result of scanning the environment for decisions */
export interface AwarenessResult {
    hasEnemies: boolean;
    enemyCount: number;
    primaryEnemy: Enemy | null;
    hasMerchants: boolean;
    hasGroundLoot: boolean;
    hasReadyCrops: boolean;
    hasCraftableRecipes: boolean;
    isBaseCamp: boolean;
    availableExits: string[];     // Direction names
    unvisitedExits: string[];     // Exits leading to unexplored rooms
    safeExits: string[];           // Exits leading to safe rooms (no dangerous hazards when compromised)
    baseCampExits: string[];       // Exits leading to base camp (prioritized when compromised)
    recentlyScanned: boolean;     // Was current room scanned recently?
    inCombat: boolean;            // Are we mid-fight? (looked at recent combat logs)
    recentDamage: number;         // Total damage taken from recent log entries
    roomHazardCount: number;      // Number of active hazards in the room
    isDangerousRoom: boolean;     // Room has damage-dealing hazards (Toxic Air, etc.)
    hpRatio: number;              // 0-1
    stressRatio: number;          // 0-1
    hasHealingItem: boolean;
    hasStressItem: boolean;
    hasUnequippedGear: boolean;
    surgeCount: number;
    canAffordTrade: boolean;
    shouldSellExcess: boolean;
    spiritBalance: number;
    bloodBalance: number;
    justRespawned: boolean;        // Player just respawned - needs preparation before exploring
    // Action history tracking (for cooldowns and loop prevention)
    lastActionType: AgentActionType | null;  // Last action taken
    actionHistory: Array<{ type: AgentActionType; timestamp: number }>;  // Recent action history (last 10 actions)
    // Quest awareness
    incompleteQuests: ActiveQuest[];  // Quests that are not yet complete
    questProgress: Record<string, number>;  // Quest ID -> progress ratio (0-1)
}

// ── Actions ──

/** High-level action the behavior tree decides to take */
export type AgentActionType =
    | 'respawn'
    | 'harvest'
    | 'craft'
    | 'heal'
    | 'reduce_stress'
    | 'equip_weapon'
    | 'equip_armor'
    | 'flee'
    | 'cast_spell'
    | 'engage'
    | 'loot'
    | 'sell'
    | 'buy'
    | 'scan'
    | 'commune'
    | 'ask_oracle'
    | 'move'
    | 'idle';

export interface AgentAction {
    type: AgentActionType;
    /** Contextual payload (direction, item ID, spell ID, etc.) */
    payload?: Record<string, unknown>;
    /** Why this action was chosen (for logging/debugging) */
    reason: string;
}

// ── SDK Integration Point ──

/**
 * Cortex Directive — injected by the ForbocAI SDK.
 * When present, this overrides the behavior tree (Priority Node 0).
 * See system-todo.md §1.2.
 */
export interface CortexDirective {
    type: AgentActionType;
    payload?: Record<string, unknown>;
    priority: number;
    source: 'sdk';
}
