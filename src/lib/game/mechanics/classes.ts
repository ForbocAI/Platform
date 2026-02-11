import type { CharacterClass } from "@/features/game/types";

type ClassTemplate = {
    baseStats: { maxHp: number; maxStress: number };
    startingSpells: string[];
};

export const CLASS_TEMPLATES: Record<CharacterClass, ClassTemplate> = {
    "Ashwalker": { baseStats: { maxHp: 120, maxStress: 100 }, startingSpells: ["relic_strike", "ember_dash", "ignition_burst"] },
    "Obsidian Warden": { baseStats: { maxHp: 200, maxStress: 80 }, startingSpells: ["obsidian_surge", "petrified_diamond_embrace", "dark_crystal_shielding"] },
    "Doomguard": { baseStats: { maxHp: 180, maxStress: 90 }, startingSpells: ["hellfire_explosion", "dreadful_charge", "explosive_barrage"] },
    "Iron Armored Guardian": { baseStats: { maxHp: 170, maxStress: 100 }, startingSpells: ["ironclad_charge", "steel_shield_block"] },
    "Aether Spirit": { baseStats: { maxHp: 90, maxStress: 120 }, startingSpells: ["ethereal_phasing", "astral_bolt"] },
    "Thunder Trooper": { baseStats: { maxHp: 110, maxStress: 100 }, startingSpells: ["shotgun_barrage", "grenade_assault"] },
    "Voidwraith": { baseStats: { maxHp: 80, maxStress: 150 }, startingSpells: ["spectral_grasp", "haunting_moan"] },
    "Cyberflux Guardian": { baseStats: { maxHp: 140, maxStress: 110 }, startingSpells: [] },
    "Byssalspawn": { baseStats: { maxHp: 130, maxStress: 130 }, startingSpells: [] },
    "Twilight Weaver": { baseStats: { maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Storm Titan": { baseStats: { maxHp: 250, maxStress: 120 }, startingSpells: ["electrical_charge", "thunderous_slam"] },
    "Aksov Hexe-Spinne": { baseStats: { maxHp: 120, maxStress: 110 }, startingSpells: [] },
    "Flame Corps": { baseStats: { maxHp: 150, maxStress: 100 }, startingSpells: ["napalm_grenade", "inferno_overdrive"] },
    "Gravewalker": { baseStats: { maxHp: 160, maxStress: 200 }, startingSpells: [] },
    "Shadowhorn Juggernaut": { baseStats: { maxHp: 140, maxStress: 100 }, startingSpells: [] },
    "Magma Leviathan": { baseStats: { maxHp: 300, maxStress: 150 }, startingSpells: [] },
    "Abyssal Overfiend": { baseStats: { maxHp: 500, maxStress: 200 }, startingSpells: [] },
    "Aetherwing Herald": { baseStats: { maxHp: 120, maxStress: 100 }, startingSpells: [] },
};
