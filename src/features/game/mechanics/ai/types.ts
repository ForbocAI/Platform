/**
 * Shared AI types for the behavior system.
 *
 * Aligned with Forboc/client/src/features/entities/characters/bots/botTypes.ts.
 * SDK integration point: `CortexDirective` will be populated by the ForbocAI SDK
 * once integrated (see system-todo.md §1.2, Priority Node 0).
 */

import type { AgentPlayer, AgentNPC, Area, Item, Companion, ActiveQuest } from '../../types';

// ── Capabilities ──

/** Available capability modules that can be composed onto an agent */
export type AgentCapability =
    | 'awareness'     // Detect threats, vendors, loot
    | 'combat'        // Attack behavior
    | 'flee'          // Run from threats
    | 'explore'       // Area navigation
    | 'trade'         // Buy/sell with vendors
    | 'craft'         // Base camp crafting/harvesting
    | 'heal'          // Use consumables
    | 'equip'         // Gear management
    | 'inquiry'       // Perform system inquiry / ask technical question
    | 'loot'          // Pick up ground items
    | 'capability'    // Capability activation (combat/utility)
    | 'quest'         // Quest awareness and progression
    | 'serve';        // Obey commands (companion behavior)

// ── Traits ──

/** Personality traits that modify behavior intensity (0-1 scale) */
export interface AgentTraits {
    aggression: number;   // How eagerly agent engages in combat
    curiosity: number;    // How much agent explores vs stays put
    caution: number;      // How quickly agent heals/flees
    resourcefulness: number; // How much agent trades/crafts
    inquiryFrequency: number; // How often agent performs system inquiries
}

// ── Configuration ──

/** Complete agent configuration (static per agent type) */
export interface AgentConfig {
    id: string;
    type: 'player' | 'companion' | 'npc';
    capabilities: AgentCapability[];
    traits: AgentTraits;
}

// ── Awareness ──

/** Result of scanning the environment for decisions */
export interface AwarenessResult {
    hasNPCs: boolean;
    npcCount: number;
    primaryNPC: AgentNPC | null;
    hasVendors: boolean;
    hasGroundLoot: boolean;
    hasReadyCrops: boolean;
    hasCraftableRecipes: boolean;
    isBaseCamp: boolean;
    availableExits: string[];     // Direction names
    unvisitedExits: string[];     // Exits leading to unexplored areas
    safeExits: string[];           // Exits leading to safe areas (no dangerous hazards when compromised)
    baseCampExits: string[];       // Exits leading to base camp (prioritized when compromised)
    recentlyScanned: boolean;     // Was current area scanned recently?
    inCombat: boolean;            // Are we mid-fight? (looked at recent combat logs)
    recentDamage: number;         // Total damage taken from recent log entries
    areaHazardCount: number;      // Number of active hazards in the area
    isDangerousArea: boolean;     // Area has damage-dealing hazards (Toxic Air, etc.)
    hpRatio: number;              // 0-1
    stressRatio: number;          // 0-1
    hasHealingItem: boolean;
    hasStressItem: boolean;
    hasUnequippedGear: boolean;
    surgeCount: number;
    canAffordTrade: boolean;
    shouldSellExcess: boolean;
    primaryResourceBalance: number;
    secondaryResourceBalance: number;
    /** Player has at least one signed companion (player.companions?.length > 0) */
    hasSignedCompanion: boolean;
    /** At least one vendor in the area sells a contract item */
    vendorHasContract: boolean;
    /** Can afford the cheapest contract in the area's vendor wares */
    canAffordContract: boolean;
    justRespawned: boolean;        // Player just respawned - needs preparation before exploring
    hasActiveVignette: boolean;    // Is there a narrative vignette overlay active?
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
    | 'cast_capability'
    | 'engage'
    | 'loot'
    | 'sell'
    | 'buy'
    | 'scan'
    | 'perform_inquiry'
    | 'ask_inquiry'
    | 'advance_vignette'
    | 'move'
    | 'idle';

export interface AgentAction {
    type: AgentActionType;
    /** Contextual payload (direction, item ID, capability ID, etc.) */
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
