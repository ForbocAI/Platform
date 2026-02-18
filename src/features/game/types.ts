export interface Stats {
    maxHp: number;
    hp: number;
    maxStress: number;
    stress: number;
    ac?: number;
    activeEffects?: StatusEffect[];
}

export interface StatusEffect {
    id: string; // e.g. "shield_block"
    name: string;
    type: "buff" | "debuff";
    statModifiers?: Partial<Stats>;
    duration: number; // turns
    description: string;
    damagePerTurn?: number;
    damageBonus?: number;
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
    skills?: string[]; // IDs of unlocked skills (passive/active)
    surgeCount: number; // For yes/no oracle
    ac?: number;
    equipment?: Partial<Record<EquipmentSlot, Item | null>>;
    spirit?: number;
    blood?: number;
    xp: number;
    maxXp: number;
    recipes: Recipe[];
    servitors?: Servitor[];
}

export interface Servitor {
    id: string;
    name: string;
    role: "Warrior" | "Scout" | "Mystic";
    hp: number;
    maxHp: number;
    description: string;
}

export interface Recipe {
    id: string;
    ingredients: { name: string; quantity: number }[];
    produces: Item;
}

export interface Enemy extends Stats {
    id: string;
    name: string;
    characterClass: CharacterClass;
    ac: number;
    description: string;
    spells: string[];
    lastAttackTime?: number; // Timestamp of last attack action
    lastDamageTime?: number; // Timestamp of last damage taken
}

export type EquipmentSlot = "mainHand" | "armor" | "relic";

export interface Item {
    id: string;
    name: string;
    description: string;
    type: "weapon" | "armor" | "consumable" | "relic" | "resource" | "contract";
    bonus?: Partial<Stats> & { ac?: number };
    effect?: string;
    cost?: { spirit: number; blood?: number };
    contractDetails?: {
        servitorName: string;
        role: "Warrior" | "Scout" | "Mystic";
        description: string;
        maxHp: number;
    };
}

export interface Merchant {
    id: string;
    name: string;
    description?: string;
    specialty?: "Weaponsmith" | "Alchemist" | "Relic Hunter" | string;
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
    /** Materials and items scattered on the ground; player can pick up. */
    groundLoot?: Item[];
    isBaseCamp?: boolean;
    features?: RoomFeature[];
    isMarketplace?: boolean;
}

export type RoomFeature =
    | { type: "farming_plot"; crop?: "mushroom"; progress: number; ready: boolean }
    | { type: "crafting_station"; kind: "alchemy" | "smithing" };

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
    type: "combat" | "exploration" | "system" | "oracle" | "dialogue";
    portraitUrl?: string;
}

/** Quest kinds from playtest scope: reconnaissance, rescue, hostiles, merchant. */
export type QuestKind = "reconnaissance" | "rescue" | "hostiles" | "merchant";

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
    roomsExplored: number;
    roomsScanned: number;
    enemiesDefeated: number;
    merchantTrades: number;
    questsCompleted: number;
    spiritEarned: number;
    startTime: number;
    endTime: number | null;
}

export interface OracleResult {
    answer: "Yes" | "No";
    qualifier?: "and" | "but" | "unexpectedly";
    description: string;
    roll: number;
    surgeUpdate: number; // How much to add/reset to surge count
    unexpectedRoll?: number; // The d20 roll if 'unexpectedly' occurred
    unexpectedEvent?: string; // The text description of the unexpected event
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
