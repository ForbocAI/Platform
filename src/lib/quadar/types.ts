
export type Attribute = "Str" | "Agi" | "Arcane";

export interface Stats {
    Str: number;
    Agi: number;
    Arcane: number;
    maxHp: number;
    hp: number;
    maxStress: number;
    stress: number;
    ac: number;
}

export type EquipmentSlot = "mainHand" | "armor" | "relic";

export interface Equipment {
    mainHand?: Item;
    armor?: Item;
    relic?: Item;
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
    | "Flame Corps";

export interface Player extends Stats {
    id: string;
    name: string;
    level: number;
    characterClass: CharacterClass;
    ac: number; // Armor class for enemy attacks
    inventory: Item[];
    equipment: Equipment;
    spells: string[]; // IDs of learned spells
    surgeCount: number; // For Loom of Fate
    /** Currency (qvht/forboc): "what we spend spirit on. Currency becomes." Primary trade medium. */
    spirit: number;
    /** Price of revelation (qvht: "price paid in blood and sacrifice"). Ritual / high-tier cost. */
    blood: number;
}

export interface Enemy extends Stats {
    id: string;
    name: string;
    characterClass: CharacterClass;
    ac: number;
    description: string;
    spells: string[];
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: "weapon" | "armor" | "consumable" | "relic";
    bonus?: Partial<Stats>;
    /** For consumables: e.g. "heal_10", "stress_-5" */
    effect?: string;
    /** Spirit cost to buy (qvht: spirit as currency). Sell grants spirit. */
    value?: number;
    /** Optional blood price for ritual / revelation wares (qvht: "price paid in blood"). */
    bloodPrice?: number;
}

/** Friendly or neutral NPC (e.g. Fellow Ranger). */
export interface Npc {
    id: string;
    name: string;
    description: string;
}

/** Nomadic trader (quadar.md: Rangers and Merchants). Can barter wares. */
export interface Merchant extends Npc {
    /** Items the merchant offers for trade. */
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
    /** Fellow rangers, recruits, or other non-hostile NPCs (Familiar). */
    allies?: Npc[];
    /** Nomadic traders who barter wares (quadar.md: Rangers and Merchants). */
    merchants?: Merchant[];
}

export type Biome = "Ethereal Marshlands" | "Toxic Wastes" | "Haunted Chapel" | "Obsidian Spire" | "Quadar Tower";

export type StageOfScene = "To Knowledge" | "To Conflict" | "To Endings";
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
    type: "combat" | "exploration" | "system" | "loom" | "narrative";
}

export interface LoomResult {
    answer: "Yes" | "No";
    qualifier?: "and" | "but" | "unexpectedly";
    description: string;
    roll: number;
    surgeUpdate: number; // How much to add/reset to surge count
    /** When qualifier is "unexpectedly", the d20 result 1–20 for Table 2. */
    unexpectedEventIndex?: number;
    unexpectedEventLabel?: string;
}

// --- Speculum Threads (quadar_ familiar) ---

export type ThreadStage = "To Knowledge" | "To Conflict" | "To Endings";

export interface Thread {
    id: string;
    name: string;
    stage?: ThreadStage;
    visitedSceneIds: string[];
    relatedNpcIds: string[];
    facts: string[];
    createdAt: number;
    updatedAt?: number;
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

export interface Fact {
    id: string;
    sourceQuestion?: string;
    sourceAnswer?: string;
    text: string;
    isFollowUp: boolean;
    /** Chipping (incremental) vs cutting (direct) question. */
    questionKind?: QuestionKind;
    timestamp: number;
}

export type VignetteStage = "Exposition" | "Rising Action" | "Climax" | "Epilogue";

export interface Vignette {
    id: string;
    theme: string;
    stage: VignetteStage;
    threadIds: string[];
    createdAt: number;
}

// --- Combat concessions (Familiar) ---

export type ConcessionOutcome = "flee" | "knocked_away" | "captured" | "other";

export interface Concession {
    offered: boolean;
    outcome?: ConcessionOutcome;
    narrative?: string;
}

// --- Question heuristics (Chipping vs Cutting) ---

export type QuestionKind = "chipping" | "cutting";

// --- Unexpectedly effect (Table 2 mechanical result) ---

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
    /** Enter Stage Left: add PC/NPC to scene (e.g. Fellow Ranger). */
    applyEnterStageLeft?: boolean;
    suggestNewMainThreadId?: string;
    suggestNextStage?: StageOfScene;
}
