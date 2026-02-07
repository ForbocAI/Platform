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

export interface Player extends Stats {
    level: number;
    characterClass: string;
    inventory: Item[];
}

export interface Enemy extends Stats {
    id: string;
    name: string;
    ac: number;
    description: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: "weapon" | "armor" | "consumable";
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

export type Biome = "Ethereal Marshlands" | "Toxic Wastes" | "Haunted Chapel" | "Obsidian Spire";
export type Direction = "North" | "South" | "East" | "West";

export interface Spell {
    id: string;
    name: string;
    description: string;
    attribute: Attribute;
    effect: (attacker: Stats, defender: Stats) => string;
}

export interface GameLogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: "combat" | "exploration" | "system";
}
