import type { Actor, StatsComponent, InventoryComponent, AIComponent } from "./entities/types";
export type { Actor, StatsComponent, InventoryComponent, AIComponent };

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

export type AgentClass =
    | "Ashwalker"
    | "Obsidian Warden"
    | "Doomguard"
    | "Iron Armored Guardian"
    | "Aether Spirit"
    | "Thunder Trooper"
    | "Cyberflux Guardian"
    | "Voidwraith"
    | "Storm Titan"
    | "Flame Corps"
    | "Byssalspawn"
    | "Aksov Hexe-Spinne"
    | "Twilight Weaver"
    | "Gravewalker"
    | "Shadowhorn Juggernaut"
    | "Magma Leviathan"
    | "Abyssal Overfiend"
    | "Aetherwing Herald";

export interface AgentPlayer extends Actor {
    // Note: Actor already contains id, faction, stats, inventory, capabilities, etc.
    name: string; // To be moved to profile/metadata component
    agentClass: AgentClass;
    surgeCount: number;
    blueprints: CraftingFormula[];
    companions?: Companion[];
}

export interface Companion extends Actor {
    soulId?: string; // Neural signature record
    name: string;
    role: "Warrior" | "Scout" | "Mystic";
}

export interface CraftingFormula {
    id: string;
    ingredients: { name: string; quantity: number }[];
    produces: Item;
}

export interface AgentNPC extends Actor {
    soulId?: string; // Neural signature record
    name: string;
    description: string;
    lastActionTime?: number;
    lastDamageTime?: number;
}

export type EquipmentSlot = "mainHand" | "armor" | "relic";

export interface Item {
    id: string;
    name: string;
    description: string;
    type: "weapon" | "armor" | "consumable" | "relic" | "resource" | "contract";
    bonus?: Partial<StatsComponent> & { ac?: number };
    effect?: string;
    cost?: { primary: number; secondary?: number };
    contractDetails?: {
        targetName: string;
        role: "Warrior" | "Scout" | "Mystic";
        description: string;
        maxHp: number;
    };
}

export interface Vendor {
    id: string;
    name: string;
    description?: string;
    specialty?: string;
    wares: Item[];
}
export type Biome =
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

export interface Area {
    id: string;
    title: string;
    description: string;
    biome: Biome;
    regionalType: string;
    hazards: string[];
    exits: Record<Direction, string | null>;
    npcs: AgentNPC[];
    allies?: { id: string; name: string }[];
    vendors?: Vendor[];
    groundLoot?: Item[];
    isBaseCamp?: boolean;
    features?: AreaFeature[];
    isMarketplace?: boolean;
}

export type AreaFeature =
    | { type: "resource_plot"; resourceId?: string; progress: number; ready: boolean }
    | { type: "work_station"; kind: string };

export type RegionalType =
    | "Marshlands"
    | "Toxic Wastes"
    | "Chapel"
    | "Spire"
    | "Tower"
    | "Installation"
    | "Fortress"
    | "Dungeon"
    | "Metal Fungi"
    | "Depths"
    | "Static Sea"
    | "Alchemy Haven"
    | "Lore Abyss"
    | "Shadowlands"
    | "Temple"
    | "Ruins"
    | "Nexus"
    | "Abyss"
    | "Chamber";
export type Direction = "North" | "South" | "East" | "West";

export interface Capability {
    id: string;
    name: string;
    description: string;
    agentClass: AgentClass;
    magnitude?: string; // e.g. "2d6"
    effect: (attacker: StatsComponent, defender: StatsComponent) => string;
}

export interface GameLogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: "combat" | "exploration" | "system" | "oracle" | "dialogue";
    portraitUrl?: string;
}

/** Quest kinds from playtest scope: reconnaissance, rescue, hostiles, merchant. */
export type QuestKind = "reconnaissance" | "rescue" | "hostiles" | "vendor";

export interface ActiveQuest {
    id: string;
    kind: QuestKind;
    /** Short label for UI (e.g. "Scan 5 sectors"). */
    label: string;
    /** Target value to complete (e.g. 5 scans, 3 hostiles cleared, or 1 ally found). */
    target: number;
    /** Current progress. */
    progress: number;
    /** When target is met, quest is complete. */
    complete: boolean;
}

export interface SessionScore {
    areasExplored: number;
    areasScanned: number;
    npcsDefeated: number;
    vendorTrades: number;
    questsCompleted: number;
    resourcesEarned: number;
    startTime: number;
    endTime: number | null;
}

export interface InquiryResponse {
    answer: "Yes" | "No";
    qualifier?: "and" | "but" | "unexpectedly";
    description: string;
    roll: number;
    surgeUpdate: number;
    unexpectedRoll?: number;
    unexpectedEvent?: string;
}

export type StageOfScene = "To Knowledge" | "To Conflict" | "To Endings";
export type VignetteStage = "Exposition" | "Rising Action" | "Climax" | "Epilogue";

export type UnexpectedlyEffectType =
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

export interface UnexpectedlyEffect {
    type: UnexpectedlyEffectType;
    label: string;
    applySetChange?: boolean;
    applyEnteringRed?: boolean;
    applyEnterStageLeft?: boolean;
    suggestNextStage?: StageOfScene;
}

export interface Fact {
    id: string;
    sourceQuestion?: string;
    sourceAnswer?: string;
    text: string;
    isFollowUp: boolean;
    questionKind?: string;
    timestamp: number;
}

export interface Thread {
    id: string;
    name: string;
    stage: StageOfScene;
    visitedSceneIds: string[];
    relatedNpcIds: string[];
    facts: string[];
    createdAt: number;
}

export interface SceneRecord {
    id: string;
    locationAreaId: string;
    mainThreadId: string;
    stageOfScene: StageOfScene;
    participantIds: string[];
    status: "active" | "faded";
    openedAt: number;
    closedAt?: number;
}

export interface Vignette {
    id: string;
    theme: string;
    stage: VignetteStage;
    threadIds: string[];
    createdAt: number;
}
