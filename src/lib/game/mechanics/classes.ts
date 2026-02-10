import type { CharacterClass } from "../types";

type ClassTemplate = {
    baseStats: { Str: number; Agi: number; Arcane: number; maxHp: number; maxStress: number };
    startingSpells: string[];
};

export const CLASS_TEMPLATES: Record<CharacterClass, ClassTemplate> = {
    "Ashwalker": { baseStats: { Str: 12, Agi: 16, Arcane: 14, maxHp: 120, maxStress: 100 }, startingSpells: ["relic_strike", "ember_dash", "ignition_burst"] },
    "Obsidian Warden": { baseStats: { Str: 18, Agi: 8, Arcane: 10, maxHp: 200, maxStress: 80 }, startingSpells: ["obsidian_surge", "petrified_diamond_embrace", "dark_crystal_shielding"] },
    "Doomguard": { baseStats: { Str: 16, Agi: 10, Arcane: 12, maxHp: 180, maxStress: 90 }, startingSpells: ["hellfire_explosion", "dreadful_charge", "explosive_barrage"] },
    "Iron Armored Guardian": { baseStats: { Str: 17, Agi: 9, Arcane: 8, maxHp: 170, maxStress: 100 }, startingSpells: ["ironclad_charge", "steel_shield_block"] },
    "Aether Spirit": { baseStats: { Str: 8, Agi: 15, Arcane: 18, maxHp: 90, maxStress: 120 }, startingSpells: ["ethereal_phasing", "astral_bolt"] },
    "Thunder Trooper": { baseStats: { Str: 13, Agi: 13, Arcane: 10, maxHp: 110, maxStress: 100 }, startingSpells: ["shotgun_barrage", "grenade_assault"] },
    "Voidwraith": { baseStats: { Str: 10, Agi: 14, Arcane: 16, maxHp: 80, maxStress: 150 }, startingSpells: ["spectral_grasp", "haunting_moan"] },
    "Cyberflux Guardian": { baseStats: { Str: 14, Agi: 14, Arcane: 15, maxHp: 140, maxStress: 110 }, startingSpells: [] },
    "Byssalspawn": { baseStats: { Str: 15, Agi: 12, Arcane: 16, maxHp: 130, maxStress: 130 }, startingSpells: [] },
    "Twilight Weaver": { baseStats: { Str: 11, Agi: 18, Arcane: 14, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Storm Titan": { baseStats: { Str: 20, Agi: 10, Arcane: 18, maxHp: 250, maxStress: 120 }, startingSpells: ["electrical_charge", "thunderous_slam"] },
    "Aksov Hexe-Spinne": { baseStats: { Str: 12, Agi: 15, Arcane: 17, maxHp: 120, maxStress: 110 }, startingSpells: [] },
    "Flame Corps": { baseStats: { Str: 15, Agi: 11, Arcane: 14, maxHp: 150, maxStress: 100 }, startingSpells: ["napalm_grenade", "inferno_overdrive"] },
    "Gravewalker": { baseStats: { Str: 16, Agi: 8, Arcane: 12, maxHp: 160, maxStress: 200 }, startingSpells: [] },
    "Shadowhorn Juggernaut": { baseStats: { Str: 16, Agi: 17, Arcane: 10, maxHp: 140, maxStress: 100 }, startingSpells: [] },
    "Magma Leviathan": { baseStats: { Str: 22, Agi: 8, Arcane: 16, maxHp: 300, maxStress: 150 }, startingSpells: [] },
    "Abyssal Overfiend": { baseStats: { Str: 25, Agi: 15, Arcane: 25, maxHp: 500, maxStress: 200 }, startingSpells: [] },
    "Aetherwing Herald": { baseStats: { Str: 12, Agi: 18, Arcane: 16, maxHp: 120, maxStress: 100 }, startingSpells: [] },
};
