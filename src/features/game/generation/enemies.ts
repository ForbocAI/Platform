import type { Enemy } from "../types";

const ENEMY_TEMPLATES: Record<string, Partial<Enemy>> = {
    "Obsidian Warden": {
        characterClass: "Obsidian Warden",
        ac: 15,
        description: "A tower of black glass and malice.",
        maxHp: 60, spells: ["obsidian_surge", "death_shard_strike"]
    },
    "Doomguard": {
        characterClass: "Doomguard",
        ac: 14,
        description: "A shell of armor powered by sheer hate.",
        maxHp: 50, spells: ["hellfire_explosion", "dreadful_charge"]
    },
    "Ashwalker Renegade": {
        characterClass: "Ashwalker",
        ac: 13,
        description: "A fallen ranger turned to madness.",
        maxHp: 40, spells: ["ember_dash", "relic_strike"]
    },
    "Iron Armored Guardian": {
        characterClass: "Iron Armored Guardian",
        ac: 16,
        description: "Heavily armored medieval swordfest knight.",
        maxHp: 55, spells: ["ironclad_charge", "steel_shield_block"]
    },
    "Aether Spirit": {
        characterClass: "Aether Spirit",
        ac: 12,
        description: "A fleeting form of shimmering angles.",
        maxHp: 35, spells: ["ethereal_phasing", "astral_bolt"]
    },
    "Thunder Trooper": {
        characterClass: "Thunder Trooper",
        ac: 13,
        description: "A raining commando with a love of carnage.",
        maxHp: 45, spells: ["shotgun_barrage", "grenade_assault"]
    },
    "Storm Titan": {
        characterClass: "Storm Titan",
        ac: 18,
        description: "A hulking creature with quantum electric attacks.",
        maxHp: 120, spells: ["electrical_charge", "thunderous_slam"]
    },
    "Flame Corps Brute": {
        characterClass: "Flame Corps",
        ac: 14,
        description: "A large, brutish phallic creature with a grenade launcher.",
        maxHp: 65, spells: ["napalm_grenade", "inferno_overdrive"]
    },
    "Gravewalker": {
        characterClass: "Gravewalker",
        ac: 11,
        description: "A reanimated corpse, a dead wandering.",
        maxHp: 70, spells: []
    },
    "Shadowhorn Juggernaut": {
        characterClass: "Shadowhorn Juggernaut",
        ac: 14,
        description: "An agile, horned creature with powerful melee attacks.",
        maxHp: 60, spells: []
    },
    "Magma Leviathan": {
        characterClass: "Magma Leviathan",
        ac: 20,
        description: "A huge, massive lava creature from the core.",
        maxHp: 200, spells: []
    }
};

export function generateRandomEnemy(): Enemy {
    const enemyNames = Object.keys(ENEMY_TEMPLATES);
    const enemyName = enemyNames[Math.floor(Math.random() * enemyNames.length)];
    const template = ENEMY_TEMPLATES[enemyName];
    return {
        id: Math.random().toString(36).substring(7),
        name: enemyName,
        ...template,
        hp: template.maxHp || 10,
        maxStress: 100,
        stress: 0
    } as Enemy;
}
