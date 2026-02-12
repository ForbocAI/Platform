import type { Spell, Stats } from "../../types";

export const OBSIDIAN_WARDEN_SPELLS: Record<string, Spell> = {
    "obsidian_surge": {
        id: "obsidian_surge",
        name: "Obsidian Surge",
        class: "Obsidian Warden",
        description: "Channel latent power for strength/speed.",
        effect: (_attacker) => "Buff stats"
    },
    "petrified_diamond_embrace": {
        id: "petrified_diamond_embrace",
        name: "Petrified Diamond Embrace",
        class: "Obsidian Warden",
        description: "Encase in diamond shell, invulnerable.",
        effect: () => "Invulnerability"
    },
    "dark_crystal_shielding": {
        id: "dark_crystal_shielding",
        name: "Dark Crystal Shielding",
        class: "Obsidian Warden",
        description: "Form protective abyssal crystal shields.",
        effect: (_a: Stats, _d: Stats) => "Reduce incoming damage"
    },
    "shatterstrike_slam": {
        id: "shatterstrike_slam",
        name: "Shatterstrike Slam",
        class: "Obsidian Warden",
        description: "Slam obsidian form into ground, shockwaves damage and knockback.",
        damage: "3d6",
        effect: () => "AoE Knockback"
    },
    "reflective_aura": {
        id: "reflective_aura",
        name: "Reflective Aura",
        class: "Obsidian Warden",
        description: "Project aura reflecting ranged attacks.",
        effect: () => "Reflect Ranged"
    },
    "resurgence_ritual": {
        id: "resurgence_ritual",
        name: "Resurgence Ritual",
        class: "Obsidian Warden",
        description: "Allies perform ritual to revive fallen Warden.",
        effect: () => "Revive"
    },
    "crystalline_echo": {
        id: "crystalline_echo",
        name: "Crystalline Echo",
        class: "Obsidian Warden",
        description: "Leave black echoes that attack enemies.",
        effect: () => "Summon Echo"
    },
    "sinister_resonance": {
        id: "sinister_resonance",
        name: "Sinister Resonance",
        class: "Obsidian Warden",
        description: "Disrupt rival magik attacks with resonance.",
        effect: () => "Magic Resist"
    },
    "ethereal_siren_imprisonment": {
        id: "ethereal_siren_imprisonment",
        name: "Ethereal Siren Imprisonment",
        class: "Obsidian Warden",
        description: "Trap opponents in alien crystal bindings.",
        effect: () => "Immobilize"
    },
    "death_shard_strike": {
        id: "death_shard_strike",
        name: "Death Shard Strike",
        class: "Obsidian Warden",
        description: "Rapid flurry of crystalline poison shards.",
        damage: "2d6",
        effect: (_a: Stats, _d: Stats) => "Piercing"
    },
};
