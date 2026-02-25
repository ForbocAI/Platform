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
    weapons: any[];
    currentWeaponIndex: number;
    items: any[];
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
    wares: Asset[];
}

export type EnvironmentType =
    | "Ethereal Marshlands"
    | "Toxic Wastes"
    | "Haunted Chapel"
    | "Obsidian Spire"
    | "Quadar Tower"
    | "Military Installation"
    | "Eldritch Fortress"
    | "Labyrinthine Dungeon"
    | "Chromatic-Steel Fungi"
    | "Chthonic Depths"
    | "Static Sea of All Noise"
    | "Twilight Alchemy Haven"
    | "Abyss of Infernal Lore"
    | "Precipice of the Shadowlands"
    | "Rune Temples"
    | "Crumbling Ruins"
    | "Dimensional Nexus"
    | "Cavernous Abyss"
    | "The Sterile Chamber";

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

/** Objective categories from playtest scope. */
export type ObjectiveCategory = "reconnaissance" | "rescue" | "hostiles" | "vendor";

export interface OperationalObjective {
    id: string;
    kind: ObjectiveCategory;
    /** Short label for UI. */
    label: string;
    /** Target value to complete. */
    target: number;
    /** Current progress. */
    progress: number;
    /** When target is met, objective is complete. */
    complete: boolean;
}

export interface PerformanceMetrics {
    [key: string]: any; // Legacy Migration
    sectorsExplored?: number;
    sectorsScanned?: number;
    actorsDefeated?: number;
    hubTrades?: number;
    objectivesCompleted?: number;
    resourcesEarned: number;
    startTime: number;
    endTime: number | null;

    // Legacy Migration Fields
    areasExplored: number;
    areasScanned: number;
    npcsDefeated: number;
    vendorTrades: number;
    questsCompleted: number;
}

export interface QueryResult {
    [key: string]: any; // Legacy Migration
    answer: "Yes" | "No";
    qualifier?: "and" | "but" | "unexpectedly";
    description: string;
    roll: number;
    entropyUpdate?: number; // Optional for Legacy Migration
    mutationRoll?: number;
    mutationEvent?: string;
}

export type ProgressionPhase = "PhaseA" | "PhaseB" | "PhaseC";
export type EpisodePhase = "Exposition" | "Rising Action" | "Climax" | "Epilogue";

export type MutationType =
    | "foreshadowing"
    | "tying_off"
    | "to_conflict"
    | "costume_change"
    | "key_grip"
    | "to_knowledge"
    | "framing"
    | "set_change"
    | "upstaged"
    | "pattern_change"
    | "limelit"
    | "entering_the_red"
    | "to_endings"
    | "montage"
    | "enter_stage_left"
    | "cross_stitch"
    | "six_degrees"
    | "reroll_reserved";

export interface MutationModifier {
    [key: string]: any; // Legacy Migration
    type: MutationType;
    label: string;
    applySetChange?: boolean;
    applyEnteringRed?: boolean;
    applyEnterStageLeft?: boolean;
    suggestNextPhase?: ProgressionPhase;
}

export interface DataPoint {
    id: string;
    sourceQuestion?: string;
    sourceAnswer?: string;
    text: string;
    isFollowUp: boolean;
    questionKind?: string;
    timestamp: number;
}

export interface NarrativeStream {
    [key: string]: any; // Legacy Migration
    id: string;
    name?: string;
    phase?: ProgressionPhase;
    visitedSegmentIds?: string[];
    relatedActorIds?: string[];
    dataPoints?: string[];
    createdAt?: number;
}

export interface SegmentRecord {
    [key: string]: any; // Legacy Migration
    id: string;
    locationSectorId?: string;
    mainStreamId?: string;
    progressionPhase?: ProgressionPhase;
    participantIds?: string[];
    status?: "active" | "faded";
    openedAt?: number;
    closedAt?: number;
}

export interface NarrativeNode {
    [key: string]: any; // Legacy Migration
    id: string;
    theme?: string;
    phase?: EpisodePhase;
    streamIds?: string[];
    createdAt?: number;
}

// --- LEGACY TYPE MIGRATION ALIASES ---
export type Area = Sector;
export type Biome = string;
export type Vendor = ExchangeHub;
export type Item = Asset;
export type AreaFeature = SiteFeature;
export type EquipmentSlot = AssetSlot;
export type AgentClass = string;
export type ActiveQuest = OperationalObjective;
export type SessionScore = PerformanceMetrics;
export type Fact = DataPoint;
export type GameLogEntry = SignalEntry;
export type InquiryResponse = QueryResult;
export type SceneRecord = SegmentRecord;
export type StageOfScene = "To Knowledge" | "To Conflict" | "To Endings";
export type Thread = NarrativeStream;
export type UnexpectedlyEffect = MutationModifier;
export type Vignette = NarrativeNode;
export type VignetteStage = EpisodePhase;
export type AreaCoordinates = { x: number, y: number };
