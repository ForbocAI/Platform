
export type Attribute = "Str" | "Agi" | "Arcane";

export interface Stats {
    Str: number;
    Agi: number;
    Arcane: number;
    maxHp: number;
    hp: number;
    maxStress: number;
    stress: number;
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
    spells: string[]; // IDs of learned spells
    surgeCount: number; // For Loom of Fate
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
}

export interface Room {
    id: string;
    title: string;
    description: string;
    biome: Biome;
    hazards: string[];
    exits: Record<Direction, string | null>; // Maps direction to room ID
    enemies: Enemy[];
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
    type: "combat" | "exploration" | "system" | "loom";
}

export interface LoomResult {
    answer: "Yes" | "No";
    qualifier?: "and" | "but" | "unexpectedly";
    description: string;
    roll: number;
    surgeUpdate: number; // How much to add/reset to surge count
}
