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
    offensiveAssets?: string[];
    currentAssetIndex?: number;
    genericAssets?: unknown[];
    equipment: Record<string, unknown>;
    primaryResource?: number; // Primary currency
    secondaryResource?: number;  // Special currency

    // Legacy Migration Fields
    weapons: string[];
    currentWeaponIndex: number;
    items: Asset[];
    spirit: number;
    blood: number;
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
    soulId?: string; // Legacy Migration

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

// --- GAME SPECIFIC TYPES ORCHESTRATION ---

export type ActorArchetype = string;

export interface StatusEffect {
    id: string; // e.g. "shield_block"
    name: string;
    type: "buff" | "debuff";
    statModifiers?: Partial<StatsComponent>;
    duration: number; // turns
    description: string;
    damagePerTurn?: number;
    damageBonus?: number;
}

export type Direction = "North" | "South" | "East" | "West";

export interface PlayerActor extends Omit<Actor, 'activeEffects'> {
    activeEffects?: StatusEffect[];
    name: string;
    archetype: ActorArchetype;
    entropyModifier: number;
    blueprints: CraftingFormula[];
    companions?: Companion[];
    justRespawned?: boolean;
    agentClass?: string; // Legacy Migration
    surgeCount?: number; // Legacy Migration
}

export interface Companion extends Actor {
    signatureId?: string; // Neural signature record (formerly soulId)
    name: string;
    role: "Warrior" | "Scout" | "Mystic";
    description?: string;
}

export interface CraftingFormula {
    id: string;
    ingredients: { name: string; quantity: number }[];
    produces: Asset;
}

export interface NonPlayerActor extends Omit<Actor, 'activeEffects'> {
    activeEffects?: StatusEffect[];
    signatureId?: string; // Neural signature record (formerly soulId)
    name: string;
    description: string;
    lastActionTime?: number;
    lastDamageTime?: number;
    agentClass?: string; // Legacy Migration
}

export type AssetSlot = "mainHand" | "armor" | "relic";

export interface Asset {
    id: string;
    name: string;
    description: string;
    type: "weapon" | "armor" | "consumable" | "relic" | "resource" | "contract";
    bonus?: Partial<StatsComponent> & { defense?: number };
    effect?: string;
    cost?: { primary: number; secondary?: number };
    contractDetails?: {
        targetName: string;
        role: "Warrior" | "Scout" | "Mystic";
        description: string;
        maxHp: number;
    };
}

export interface ExchangeHub {
    id: string;
    name: string;
    description?: string;
    specialty?: string;
    displayType?: string;
    wares: Asset[];
}

export type EnvironmentType =
    | "Meadows"
    | "Mud Paths"
    | "Rune Stones"
    | "The Tree"
    | "Lanternbough"
    | "Trading Posts"
    | "Mushroom Chapel"
    | "Root Warrens"
    | "Mushroom Rings"
    | "Underground Springs"
    | "Creek Crossings"
    | "Herb Gardens"
    | "Overgrown Ruins"
    | "Narrow Paths"
    | "Canopy Platforms"
    | "Troll Bridges"
    | "Otherwild Reaches"
    | "Root Drops"
    | "Seasonal Shifts";

export interface Sector {
    id: string;
    title: string;
    description: string;
    environment?: EnvironmentType; // Optional for Legacy Migration
    regionalType: string;
    hazards: string[];
    exits: Record<string, string | null>;
    npcs: NonPlayerActor[];
    allies?: { id: string; name: string }[];
    vendors?: ExchangeHub[];
    groundLoot?: Asset[];
    isBaseCamp?: boolean;
    features?: SiteFeature[];
    isMarketplace?: boolean;
    biome?: string; // Legacy Migration
}

export type SiteFeature =
    | { type: "resource_plot"; resourceId?: string; progress: number; ready: boolean }
    | { type: "work_station"; kind: string };

export interface Capability {
    id: string;
    name: string;
    description: string;
    archetype?: ActorArchetype; // Optional for Legacy Migration
    agentClass?: string; // Legacy Migration
    magnitude?: string; // e.g. "2d6"
    effect: (attacker: StatsComponent, defender: StatsComponent) => string;
}

export interface SignalEntry {
    id: string;
    timestamp: number;
    message: string;
    type: "combat" | "exploration" | "system" | "oracle" | "dialogue";
    portraitUrl?: string;
}

export interface Bark {
    id: string;
    actorId: string; // The ID of the NPC or Player
    text: string;
    type: 'combat' | 'ambient' | 'system';
    createdAt: number;
}

export interface DialogueSession {
    agentId: string;
    persona: string;
    transcript: { speaker: 'agent' | 'player'; text: string; timestamp: number }[];
    isPondering: boolean;
}

// --- LEGACY TYPE MIGRATION ALIASES ---
export type Area = Sector;
export type Biome = string;
export type Vendor = ExchangeHub;
export type Item = Asset;
export type AreaFeature = SiteFeature;
export type EquipmentSlot = AssetSlot;
export type AgentClass = string;
export type GameLogEntry = SignalEntry;
export type AreaCoordinates = { x: number, y: number };
