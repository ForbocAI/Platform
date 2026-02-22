/**
 * Universal Entity Model (ECS Alignment)
 * 
 * Standardized interfaces for entities (Actors) and their components,
 * following the Forboc ECS reference architecture.
 */

export type Faction = 'player' | 'enemy' | 'neutral' | 'ally';

/**
 * Effect Interface
 * Standardized status effect/buff/debuff model.
 */
export interface Effect {
    effectId: string;
    type: string;
    magnitude: number;
    remainingDurationMs: number;
    sourceEntityId: string;
    [key: string]: unknown;
}

/**
 * Stats Component
 * CORE: Standard RPG attributes.
 */
export interface StatsComponent {
    hp: number;
    maxHp: number;
    stress: number;
    maxStress: number;
    level?: number;
    xp?: number;
    maxXp?: number;
    speed: number;
    defense: number;
    damage: number;
    invulnerable: number;
}

/**
 * Inventory Component
 * OPTIONAL: For actors that can carry items and weapons.
 */
export interface InventoryComponent {
    weapons: string[];
    currentWeaponIndex: number;
    items: unknown[];
    equipment: Record<string, unknown>;
    spirit: number; // Primary currency
    blood: number;  // Special currency
}

/**
 * AI Component
 * OPTIONAL: For autonomous actors (Bots, NPCs, Enemies).
 */
export interface AIComponent {
    behaviorState: 'idle' | 'patrol' | 'combat' | 'flee' | 'search';
    targetId?: string | null;
    memory: Record<string, unknown>;
    awareness: Record<string, unknown> | null;
}

/**
 * Capability Component
 * OPTIONAL: For actors that have learned abilities/skills.
 */
export interface CapabilityComponent {
    learned: string[]; // IDs of learned capabilities
}

/**
 * Universal Actor Interface
 * A unified model that can represent any sentient or active entity in the game.
 */
export interface Actor {
    // Identity
    id: string;
    type: string;
    faction: Faction;

    // Position (Componentized logically)
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    isGrounded: boolean;
    facingRight: boolean;

    // Visual State
    state: string;
    frame: number;
    animTimer: number;

    // Core Components
    stats: StatsComponent;
    inventory: InventoryComponent;
    capabilities: CapabilityComponent;
    activeEffects: Effect[]; // Status effects

    // Optional Components
    ai?: AIComponent;

    // Flags
    active: boolean;
}
