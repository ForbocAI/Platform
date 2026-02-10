
import { CharacterClass, Spell, Stats, Item } from "./types";

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
    },
    // --- Iron Armored Guardian Spells ---
    "ironclad_charge": {
        id: "ironclad_charge",
        name: "Ironclad Charge",
        class: "Iron Armored Guardian",
        description: "Powerful charge causing knockback and stun.",
        damage: "1d10 + STR",
        effect: () => "Knockback/Stun"
    },
    "steel_shield_block": {
        id: "steel_shield_block",
        name: "Steel Shield Block",
        class: "Iron Armored Guardian",
        description: "Block projectiles and reduce damage.",
        effect: () => "Block/DR"
    },
    // --- Aether Spirit Spells ---
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
        damage: "2d6 + ARCANE",
        effect: () => "Slow"
    },
    // --- Thunder Trooper Spells ---
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
    // --- Voidwraith Spells ---
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
    // --- Storm Titan Spells ---
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
    // --- Flame Corps Spells ---
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

/** Spells unlocked at level (beyond starting spells). Level -> spellId for each class that has level unlocks. */
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

/** Skills (passive/active) unlocked at level. Level -> skillId per class. */
export const LEVEL_SKILL_UNLOCKS: Partial<Record<CharacterClass, Partial<Record<number, string>>>> = {
    Ashwalker: { 12: "keen_senses", 14: "ember_veil", 16: "scout_instinct" },
    "Obsidian Warden": { 13: "stone_skin", 15: "warden_resolve", 17: "obsidian_aura" },
    Doomguard: { 13: "battle_fervor", 15: "hellfire_blood", 17: "dread_presence" },
    "Iron Armored Guardian": { 12: "iron_will", 14: "shield_bash" },
    "Aether Spirit": { 12: "astral_sight", 14: "phase_step" },
};

export function getSkillUnlockForLevel(characterClass: CharacterClass, level: number): string | null {
    const byClass = LEVEL_SKILL_UNLOCKS[characterClass];
    if (!byClass) return null;
    return byClass[level] ?? null;
}

/** All skills unlocked for a class from level 1 up to and including `level`. Used to seed player.skills at init. */
export function getSkillsForLevels(characterClass: CharacterClass, level: number): string[] {
    const skills: string[] = [];
    for (let l = 1; l <= level; l++) {
        const skill = getSkillUnlockForLevel(characterClass, l);
        if (skill && !skills.includes(skill)) skills.push(skill);
    }
    return skills;
}

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
    "Iron Armored Guardian": {
        baseStats: { Str: 17, Agi: 9, Arcane: 8, maxHp: 170, maxStress: 100 },
        startingSpells: ["ironclad_charge", "steel_shield_block"]
    },
    "Aether Spirit": {
        baseStats: { Str: 8, Agi: 15, Arcane: 18, maxHp: 90, maxStress: 120 },
        startingSpells: ["ethereal_phasing", "astral_bolt"]
    },
    "Thunder Trooper": {
        baseStats: { Str: 13, Agi: 13, Arcane: 10, maxHp: 110, maxStress: 100 },
        startingSpells: ["shotgun_barrage", "grenade_assault"]
    },
    "Voidwraith": {
        baseStats: { Str: 10, Agi: 14, Arcane: 16, maxHp: 80, maxStress: 150 },
        startingSpells: ["spectral_grasp", "haunting_moan"]
    },
    "Cyberflux Guardian": {
        baseStats: { Str: 14, Agi: 14, Arcane: 15, maxHp: 140, maxStress: 110 },
        startingSpells: []
    },
    "Byssalspawn": {
        baseStats: { Str: 15, Agi: 12, Arcane: 16, maxHp: 130, maxStress: 130 },
        startingSpells: []
    },
    "Twilight Weaver": {
        baseStats: { Str: 11, Agi: 18, Arcane: 14, maxHp: 100, maxStress: 100 },
        startingSpells: []
    },
    "Storm Titan": {
        baseStats: { Str: 20, Agi: 10, Arcane: 18, maxHp: 250, maxStress: 120 },
        startingSpells: ["electrical_charge", "thunderous_slam"]
    },
    "Aksov Hexe-Spinne": {
        baseStats: { Str: 12, Agi: 15, Arcane: 17, maxHp: 120, maxStress: 110 },
        startingSpells: []
    },
    "Flame Corps": {
        baseStats: { Str: 15, Agi: 11, Arcane: 14, maxHp: 150, maxStress: 100 },
        startingSpells: ["napalm_grenade", "inferno_overdrive"]
    },
    "Gravewalker": {
        baseStats: { Str: 16, Agi: 8, Arcane: 12, maxHp: 160, maxStress: 200 },
        startingSpells: []
    },
    "Shadowhorn Juggernaut": {
        baseStats: { Str: 16, Agi: 17, Arcane: 10, maxHp: 140, maxStress: 100 },
        startingSpells: []
    },
    "Magma Leviathan": {
        baseStats: { Str: 22, Agi: 8, Arcane: 16, maxHp: 300, maxStress: 150 },
        startingSpells: []
    },
    "Abyssal Overfiend": {
        baseStats: { Str: 25, Agi: 15, Arcane: 25, maxHp: 500, maxStress: 200 },
        startingSpells: []
    },
    "Aetherwing Herald": {
        baseStats: { Str: 12, Agi: 18, Arcane: 16, maxHp: 120, maxStress: 100 },
        startingSpells: []
    },
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

export const ITEMS: Item[] = [
    // Consumables
    {
        id: "ember_salve",
        name: "Ember Salve",
        description: "A soothing paste of crushed embers. Heals 20 HP, relieves 10 Stress.",
        type: "consumable",
        effect: "heal_20_stress_10",
        cost: { spirit: 5 }
    },
    {
        id: "spirit_echo",
        name: "Spirit Echo",
        description: "A captured whisper. Relieves 30 Stress.",
        type: "consumable",
        effect: "stress_30",
        cost: { spirit: 8 }
    },
    {
        id: "blood_vial",
        name: "Vial of Old Blood",
        description: "Thick, dark blood. Heals 50 HP but adds 10 Stress.",
        type: "consumable",
        effect: "heal_50_stress_add_10",
        cost: { spirit: 10, blood: 2 }
    },
    // Weapons
    {
        id: "obsidian_dagger",
        name: "Obsidian Dagger",
        description: "Razor sharp volcanic glass. +2 Agi.",
        type: "weapon",
        bonus: { Agi: 2 },
        cost: { spirit: 15 }
    },
    {
        id: "iron_greatsword",
        name: "Iron Greatsword",
        description: "Heavy and brutal. +4 Str, -2 Agi.",
        type: "weapon",
        bonus: { Str: 4, Agi: -2 },
        cost: { spirit: 25 }
    },
    // Armor
    {
        id: "reinforced_plate",
        name: "Reinforced Plate",
        description: "Solid protection. +4 AC, -2 Agi.",
        type: "armor",
        bonus: { ac: 4, Agi: -2 },
        cost: { spirit: 30 }
    },
    {
        id: "shadow_cloak",
        name: "Shadow Cloak",
        description: "Woven from shadows. +2 AC, +2 Agi.",
        type: "armor",
        bonus: { ac: 2, Agi: 2 },
        cost: { spirit: 25 }
    },
    // Relics
    {
        id: "ancient_battery",
        name: "Ancient Battery",
        description: "Hums with power. +4 Arcane.",
        type: "relic",
        bonus: { Arcane: 4 },
        cost: { spirit: 40, blood: 5 }
    }
];
