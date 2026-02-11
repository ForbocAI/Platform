import type { CharacterClass, Spell, Stats } from "../types";

export const SPELLS: Record<string, Spell> = {
    "relic_strike": {
        id: "relic_strike",
        name: "Relic Strike",
        class: "Ashwalker",
        description: "Powerful melee strike with ancient relic.",
        damage: "1d8",
        effect: () => "Melee damage"
    },
    "ember_dash": {
        id: "ember_dash",
        name: "Ember Dash",
        class: "Ashwalker",
        description: "Rapid dash leaving ember trails.",
        effect: () => "Mobility boost"
    },
    "smoldering_arsenal": {
        id: "smoldering_arsenal",
        name: "Smoldering Arsenal",
        class: "Ashwalker",
        description: "Switch weapons to adapt to foes.",
        effect: () => "Weapon switch"
    },
    "ignition_burst": {
        id: "ignition_burst",
        name: "Ignition Burst",
        class: "Ashwalker",
        description: "Burst of fiery malevolence in radius.",
        damage: "2d6 Fire",
        effect: () => "AoE Fire Damage"
    },
    "inferno_step": {
        id: "inferno_step",
        name: "Inferno Step",
        class: "Ashwalker",
        description: "Step into ethereal plane, intangible.",
        effect: () => "Immunity duration"
    },
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
    "death_shard_strike": {
        id: "death_shard_strike",
        name: "Death Shard Strike",
        class: "Obsidian Warden",
        description: "Rapid flurry of crystalline poison shards.",
        damage: "2d6",
        effect: (_a: Stats, _d: Stats) => "Piercing"
    },
    "hellfire_explosion": {
        id: "hellfire_explosion",
        name: "Hellfire Explosion",
        class: "Doomguard",
        description: "Evoke fire from hell exploding nearby.",
        damage: "3d6 Fire",
        effect: () => "AoE Fire Damage"
    },
    "dreadful_charge": {
        id: "dreadful_charge",
        name: "Dreadful Charge",
        class: "Doomguard",
        description: "Bludgeoning charge closing gap.",
        damage: "1d10",
        effect: () => "Charge Damage"
    },
    "explosive_barrage": {
        id: "explosive_barrage",
        name: "Explosive Barrage",
        class: "Doomguard",
        description: "Barrage of ranged death attacks.",
        damage: "2d6 AoE",
        effect: (_a: Stats, _d: Stats) => "AoE"
    },
    "ripping_blade_slash": {
        id: "ripping_blade_slash",
        name: "Ripping Blade Slash",
        class: "Doomguard",
        description: "Searing jagged blade slash.",
        damage: "1d8",
        effect: (_a: Stats, _d: Stats) => "Fire/melee"
    },
    "eternal_flame": {
        id: "eternal_flame",
        name: "Eternal Flame",
        class: "Ashwalker",
        description: "Absorb residual life after killing, empower attacks.",
        effect: (_a: Stats, _d: Stats) => "Buff on kill"
    },
    "blazing_trail": {
        id: "blazing_trail",
        name: "Blazing Trail",
        class: "Ashwalker",
        description: "Leave magikal flames in wake.",
        effect: (_a: Stats, _d: Stats) => "Burning trail"
    },
    "ironclad_charge": {
        id: "ironclad_charge",
        name: "Ironclad Charge",
        class: "Iron Armored Guardian",
        description: "Powerful charge causing knockback and stun.",
        damage: "1d10",
        effect: () => "Knockback/Stun"
    },
    "steel_shield_block": {
        id: "steel_shield_block",
        name: "Steel Shield Block",
        class: "Iron Armored Guardian",
        description: "Block projectiles and reduce damage.",
        effect: () => "Block/DR"
    },
    "ethereal_phasing": {
        id: "ethereal_phasing",
        name: "Ethereal Phasing",
        class: "Aether Spirit",
        description: "Phase in/out of material plane.",
        effect: () => "Immunity"
    },
    "astral_bolt": {
        id: "astral_bolt",
        name: "Astral Bolt",
        class: "Aether Spirit",
        description: "Bolt of dark energy.",
        damage: "2d6",
        effect: () => "Slow"
    },
    "shotgun_barrage": {
        id: "shotgun_barrage",
        name: "Shotgun Barrage",
        class: "Thunder Trooper",
        description: "Rapid barrage of shotgun blasts.",
        damage: "3d6",
        effect: () => "Close-range devastation"
    },
    "grenade_assault": {
        id: "grenade_assault",
        name: "Grenade Assault",
        class: "Thunder Trooper",
        description: "Throw explosive projectiles.",
        damage: "2d8",
        effect: () => "AoE"
    },
    "spectral_grasp": {
        id: "spectral_grasp",
        name: "Spectral Grasp",
        class: "Voidwraith",
        description: "Ensnare and immobilize enemies.",
        damage: "1d6",
        effect: () => "Immobilize"
    },
    "haunting_moan": {
        id: "haunting_moan",
        name: "Haunting Moan",
        class: "Voidwraith",
        description: "Instill fear and reduce efficiency.",
        effect: () => "Fear debuff"
    },
    "electrical_charge": {
        id: "electrical_charge",
        name: "Electrical Charge",
        class: "Storm Titan",
        description: "Imbue melee attacks with atomic damage.",
        effect: () => "Extra Arcane Dmg"
    },
    "thunderous_slam": {
        id: "thunderous_slam",
        name: "Thunderous Slam",
        class: "Storm Titan",
        description: "Shockwaves that evaporate nearby enemies.",
        damage: "4d6",
        effect: () => "AoE Knockback"
    },
    "napalm_grenade": {
        id: "napalm_grenade",
        name: "Napalm Grenade Toss",
        class: "Flame Corps",
        description: "Fiery explosions with burning effect.",
        damage: "2d6",
        effect: () => "Burning Dot"
    },
    "inferno_overdrive": {
        id: "inferno_overdrive",
        name: "Inferno Overdrive",
        class: "Flame Corps",
        description: "Heightened state of pyrokinetic power.",
        effect: () => "Berserk state"
    }
};

export const LEVEL_SPELL_UNLOCKS: Partial<Record<CharacterClass, Partial<Record<number, string>>>> = {
    Ashwalker: {
        13: "smoldering_arsenal",
        14: "inferno_step",
        15: "eternal_flame",
        16: "blazing_trail",
    },
    "Obsidian Warden": { 14: "death_shard_strike" },
    Doomguard: { 14: "ripping_blade_slash" },
};

export function getSpellUnlockForLevel(characterClass: CharacterClass, level: number): string | null {
    const byClass = LEVEL_SPELL_UNLOCKS[characterClass];
    if (!byClass) return null;
    return byClass[level] ?? null;
}
