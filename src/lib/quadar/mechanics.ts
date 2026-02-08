
import { CharacterClass, Spell, Stats } from "./types";

export const SPELLS: Record<string, Spell> = {
    // --- Ashwalker (Ranger/Rogue) Spells ---
    "relic_strike": {
        id: "relic_strike",
        name: "Relic Strike",
        class: "Ashwalker",
        description: "Powerful melee strike with ancient relic.",
        damage: "1d8 + STR",
        effect: (attacker, _defender) => `${attacker.Str} damage`
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

    // --- Obsidian Warden Spells ---
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

    // --- Doomguard Spells ---
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
        damage: "1d10 + STR",
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
        damage: "1d8 + STR",
        effect: (_a: Stats, _d: Stats) => "Fire/melee"
    },

    // --- Ashwalker (more from quadar.md) ---
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
    }
};

export const CLASS_TEMPLATES: Record<CharacterClass, {
    baseStats: { Str: number, Agi: number, Arcane: number, maxHp: number, maxStress: number },
    startingSpells: string[]
}> = {
    "Ashwalker": {
        baseStats: { Str: 12, Agi: 16, Arcane: 14, maxHp: 120, maxStress: 100 },
        startingSpells: ["relic_strike", "ember_dash", "ignition_burst"]
    },
    "Obsidian Warden": {
        baseStats: { Str: 18, Agi: 8, Arcane: 10, maxHp: 200, maxStress: 80 },
        startingSpells: ["obsidian_surge", "petrified_diamond_embrace", "dark_crystal_shielding"]
    },
    "Doomguard": {
        baseStats: { Str: 16, Agi: 10, Arcane: 12, maxHp: 180, maxStress: 90 },
        startingSpells: ["hellfire_explosion", "dreadful_charge", "explosive_barrage"]
    },
    // Defaults for others to prevent crashes, implement full list later
    "Iron Armored Guardian": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Aether Spirit": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Thunder Trooper": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Voidwraith": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Cyberflux Guardian": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Byssalspawn": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Twilight Weaver": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Storm Titan": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Aksov Hexe-Spinne": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
    "Flame Corps": { baseStats: { Str: 10, Agi: 10, Arcane: 10, maxHp: 100, maxStress: 100 }, startingSpells: [] },
};

export const UNEXPECTEDLY_TABLE = [
    "Foreshadowing: Set a thread to be the main thread for the next scene.",
    "Tying Off: The main thread resolves or substantially moves forward.",
    "To Conflict: The next scene centers on a conflict.",
    "Costume Change: An NPC drastically changes their mind, motivations, or alliances.",
    "Key Grip: Set the location or general elements for the next scene.",
    "To Knowledge: The next scene centers on lore or investigation.",
    "Framing: An NPC or object becomes critical to the main thread.",
    "Set Change: Scene continues in another location.",
    "Upstaged: An NPC makes a big move/goes into Overdrive.",
    "Pattern Change: The main thread gets modified drastically (Hard Left).",
    "Limelit: The rest of the scene goes great for the PCs.",
    "Entering the Red: Threat of danger or combat arrives.",
    "To Endings: The next scene resolves or substantially moves forward a thread.",
    "Montage: Timeframe changes to a montage of actions.",
    "Enter Stage Left: A PC or NPC arrives fresh in the scene.",
    "Cross-stitch: Choose another thread to be the main thread.",
    "Six Degrees: A meaningful connection forms between two PCs/NPCs.",
    "Re-roll/Reserved",
    "Re-roll/Reserved",
    "Re-roll/Reserved"
];
