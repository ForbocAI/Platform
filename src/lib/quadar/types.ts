
export type Attribute = "Str" | "Agi" | "Arcane";

export interface Stats {
    Str: number;
    Agi: number;
    Arcane: number;
    maxHp: number;
    hp: number;
    maxStress: number;
    stress: number;
    ac?: number;
}

export type CharacterClass =
    | "Obsidian Warden"
    | "Doomguard"
    | "Ashwalker" // Rogue/Ranger
    | "Iron Armored Guardian"
    | "Aether Spirit"
    | "Thunder Trooper"
    | "Voidwraith"
    | "Cyberflux Guardian"
    | "Byssalspawn"
    | "Twilight Weaver"
    | "Storm Titan"
    | "Aksov Hexe-Spinne"
    | "Flame Corps"
    | "Gravewalker"
    | "Shadowhorn Juggernaut"
    | "Magma Leviathan"
    | "Abyssal Overfiend"
    | "Aetherwing Herald";

export interface Player extends Stats {
    id: string;
    name: string;
    level: number;
    characterClass: CharacterClass;
    inventory: Item[];
    spells: string[]; // IDs of learned spells
    surgeCount: number; // For Loom of Fate
    ac?: number;
    equipment?: Partial<Record<EquipmentSlot, Item | null>>;
    spirit?: number;
    blood?: number;
}

export interface Enemy extends Stats {
    id: string;
    name: string;
    characterClass: CharacterClass;
    ac: number;
    description: string;
    spells: string[];
}

export type EquipmentSlot = "mainHand" | "armor" | "relic";

export interface Item {
    id: string;
    name: string;
    description: string;
    type: "weapon" | "armor" | "consumable" | "relic";
    bonus?: Partial<Stats> & { ac?: number };
    effect?: string;
    cost?: { spirit: number; blood?: number };
}

export interface Merchant {
    id: string;
    name: string;
    description?: string;
    wares: Item[];
}

export interface Room {
    id: string;
    title: string;
    description: string;
    biome: Biome;
    hazards: string[];
    exits: Record<Direction, string | null>; // Maps direction to room ID
    enemies: Enemy[];
    allies?: { id: string; name: string }[];
    merchants?: Merchant[];
}

export type Biome = "Ethereal Marshlands" | "Toxic Wastes" | "Haunted Chapel" | "Obsidian Spire" | "Quadar Tower" | "Military Installation" | "Eldritch Fortress" | "Labyrinthine Dungeon";
export type Direction = "North" | "South" | "East" | "West";

export interface Spell {
    id: string;
    name: string;
    description: string;
    class: CharacterClass;
    damage?: string; // e.g. "2d6"
    effect: (attacker: Stats, defender: Stats) => string;
}

export interface GameLogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: "combat" | "exploration" | "system" | "loom";
}

export interface LoomResult {
    answer: "Yes" | "No";
    qualifier?: "and" | "but" | "unexpectedly";
    description: string;
    roll: number;
    surgeUpdate: number; // How much to add/reset to surge count
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
    locationRoomId: string;
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
