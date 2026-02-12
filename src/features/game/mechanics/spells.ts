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
    "sword_attacks": {
        id: "sword_attacks",
        name: "Sword Attack",
        class: "Doomguard",
        description: "Standard sword strike.",
        damage: "1d8",
        effect: () => "Melee Damage"
    },
    "ranged_explosive_attacks": {
        id: "ranged_explosive_attacks",
        name: "Ranged Explosive",
        class: "Doomguard",
        description: "Explosive projectile thrown at range.",
        damage: "2d6",
        effect: () => "AoE Damage"
    },
    "shielded_bastion_stance": {
        id: "shielded_bastion_stance",
        name: "Shielded Bastion Stance",
        class: "Doomguard",
        description: "Defensive stance reducing incoming damage.",
        effect: () => "Defense Buff"
    },
    "infernal_overdrive_assault": {
        id: "infernal_overdrive_assault",
        name: "Infernal Overdrive Assault",
        class: "Doomguard",
        description: "Enhance attack speed and fury.",
        effect: () => "Attack Speed Buff"
    },
    "demonic_resilience": {
        id: "demonic_resilience",
        name: "Demonic Resilience",
        class: "Doomguard",
        description: "Regenerate health gradually.",
        effect: () => "Regeneration"
    },
    "dark_ward_aura": {
        id: "dark_ward_aura",
        name: "Dark Ward Aura",
        class: "Doomguard",
        description: "Defensive bonus to nearby allies.",
        effect: () => "Aura Buff"
    },
    "cursed_chains": {
        id: "cursed_chains",
        name: "Cursed Chains",
        class: "Doomguard",
        description: "Restrict movement of enemies.",
        effect: () => "Immobilize"
    },
    "dreadlords_command": {
        id: "dreadlords_command",
        name: "Dreadlord's Command",
        class: "Doomguard",
        description: "Inspire allies, boosting morale.",
        effect: () => "Buff Allies"
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
    // Batch 3: Tech & Biomes
    // Thunder Trooper
    "emp_grenade": {
        id: "emp_grenade",
        name: "EMP Grenade",
        class: "Thunder Trooper",
        description: "Disables mechanical foes and deals area damage.",
        damage: "2d6",
        effect: () => "AoE Stun"
    },
    "jetpack_maneuver": {
        id: "jetpack_maneuver",
        name: "Jetpack Maneuver",
        class: "Thunder Trooper",
        description: "Boosts evasion significantly.",
        effect: () => "Buff Evasion"
    },

    // Cyberflux Guardian
    "energy_surge": {
        id: "energy_surge",
        name: "Energy Surge",
        class: "Cyberflux Guardian",
        description: "A blast of raw energy.",
        damage: "3d6",
        effect: () => "None"
    },
    "nano_repair_matrix": {
        id: "nano_repair_matrix",
        name: "Nano-Repair Matrix",
        class: "Cyberflux Guardian",
        description: "Self-repair systems activated.",
        effect: () => "Heal"
    },

    // Flame Corps
    "napalm_grenade_new": { // Renamed to avoid conflict
        id: "napalm_grenade_new",
        name: "Napalm Grenade",
        class: "Flame Corps",
        description: "Explodes and burns enemies over time.",
        damage: "1d6",
        effect: () => "AoE Burn"
    },
    "inferno_overdrive_new": { // Renamed to avoid conflict
        id: "inferno_overdrive_new",
        name: "Inferno Overdrive",
        class: "Flame Corps",
        description: "Significantly boosts damage output but causes stress.",
        effect: () => "Buff Damage"
    },

    // Storm Titan
    "electrical_charge_new": { // Renamed to avoid conflict
        id: "electrical_charge_new",
        name: "Electrical Charge",
        class: "Storm Titan",
        description: "A jolt of electricity.",
        damage: "2d8",
        effect: () => "None"
    },
    "thunderous_slam_new": { // Renamed to avoid conflict
        id: "thunderous_slam_new",
        name: "Thunderous Slam",
        class: "Storm Titan",
        description: "Massive area damage.",
        damage: "2d6",
        effect: () => "AoE Stun"
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
    },
    "sword_sweeps": {
        id: "sword_sweeps",
        name: "Sword Sweeps",
        class: "Iron Armored Guardian",
        description: "Sweep attack hitting multiple adversaries.",
        damage: "1d8",
        effect: () => "AoE Melee"
    },
    "guardian_explosive_barrage": {
        id: "guardian_explosive_barrage",
        name: "Explosive Barrage (Guardian)",
        class: "Iron Armored Guardian",
        description: "Launch explosive projectiles at distant foes.",
        damage: "2d6",
        effect: () => "AoE Ranged"
    },
    "stalwart_formation": {
        id: "stalwart_formation",
        name: "Stalwart Formation",
        class: "Iron Armored Guardian",
        description: "Defensive formation, reduce damage.",
        effect: () => "Defense Buff"
    },
    "lance_thrust": {
        id: "lance_thrust",
        name: "Lance Thrust",
        class: "Iron Armored Guardian",
        description: "Precise thrust piercing armor.",
        damage: "1d10",
        effect: () => "Piercing"
    },
    "siege_breaker_slam": {
        id: "siege_breaker_slam",
        name: "Siege Breaker Slam",
        class: "Iron Armored Guardian",
        description: "Devastating ground slam, causing tremors.",
        damage: "2d8",
        effect: () => "AoE Stun"
    },
    "fortified_resilience": {
        id: "fortified_resilience",
        name: "Fortified Resilience",
        class: "Iron Armored Guardian",
        description: "Reduce effectiveness of debuffs.",
        effect: () => "Resist Debuffs"
    },
    "ironforge_bastion": {
        id: "ironforge_bastion",
        name: "Ironforge Bastion",
        class: "Iron Armored Guardian",
        description: "Impenetrable barrier, temporary invulnerability.",
        effect: () => "Invulnerability"
    },
    "warforged_determination": {
        id: "warforged_determination",
        name: "Warforged Determination",
        class: "Iron Armored Guardian",
        description: "Increase offensive and defensive capabilities.",
        effect: () => "Buff All"
    },
    // Aether Spirit
    "abysmal_burst": {
        id: "abysmal_burst",
        name: "Abysmal Burst",
        class: "Aether Spirit",
        description: "Unleash void energy, damaging and confusing foes.",
        damage: "2d6",
        effect: () => "AoE Confuse"
    },
    "spectral_wail": {
        id: "spectral_wail",
        name: "Spectral Wail",
        class: "Aether Spirit",
        description: "A horrifying scream that terrifies enemies.",
        damage: "1d4",
        effect: () => "AoE Fear"
    },
    // Voidwraith
    "shadowmeld_stalk": {
        id: "shadowmeld_stalk",
        name: "Shadowmeld Stalk",
        class: "Voidwraith",
        description: "Fade into the shadows, becoming harder to hit.",
        effect: () => "Buff Evasion"
    },
    "soul_siphon": {
        id: "soul_siphon",
        name: "Soul Siphon",
        class: "Voidwraith",
        description: "Drain life force from the enemy to heal yourself.",
        damage: "1d8",
        effect: () => "Life Steal"
    },
    // Twilight Weaver
    "shadowstep_ambush": {
        id: "shadowstep_ambush",
        name: "Shadowstep Ambush",
        class: "Twilight Weaver",
        description: "Teleport behind foe for a critical strike.",
        damage: "3d6",
        effect: () => "High Crit"
    },
    "dark_web_entanglement": {
        id: "dark_web_entanglement",
        name: "Dark Web Entanglement",
        class: "Twilight Weaver",
        description: "Weave shadows to bind an enemy.",
        damage: "1d4",
        effect: () => "Immobilize"
    },
    "twilight_bolt": {
        id: "twilight_bolt",
        name: "Twilight Bolt",
        class: "Twilight Weaver",
        description: "A bolt of twilight energy.",
        damage: "1d8",
        effect: () => "None"
    },

    // Batch 4: The Monstrosities
    // Byssalspawn
    "eldritch_devouring_gaze": {
        id: "eldritch_devouring_gaze",
        name: "Eldritch Devouring Gaze",
        class: "Byssalspawn",
        description: "Consume life force with an alien gaze.",
        damage: "1d8",
        effect: () => "Drain/Debuff"
    },
    "tendril_grapple_assault": {
        id: "tendril_grapple_assault",
        name: "Tendril Grapple Assault",
        class: "Byssalspawn",
        description: "Extend shadowy tendrils to crush and bind.",
        damage: "2d6",
        effect: () => "Immobilize"
    },
    "abysmal_torrent": {
        id: "abysmal_torrent",
        name: "Abysmal Torrent",
        class: "Byssalspawn",
        description: "Unleash projectiles of dark abyssal energy.",
        damage: "2d6",
        effect: () => "AoE Ranged"
    },
    "dimensional_phasing": {
        id: "dimensional_phasing",
        name: "Dimensional Phasing",
        class: "Byssalspawn",
        description: "Phase into ethereal state to avoid harm.",
        effect: () => "Buff Evasion"
    },

    // Aksov Hexe-Spinne
    "rocket_barrage": {
        id: "rocket_barrage",
        name: "Rocket Barrage",
        class: "Aksov Hexe-Spinne",
        description: "Unleash a barrage of explosive hell rockets.",
        damage: "3d6",
        effect: () => "AoE Fire"
    },
    "chrome_volley": {
        id: "chrome_volley",
        name: "Chrome Volley",
        class: "Aksov Hexe-Spinne",
        description: "Fire guided death missiles at a target.",
        damage: "2d8",
        effect: () => "Homing/Precise"
    },
    "jet_propulsion": {
        id: "jet_propulsion",
        name: "Jet Propulsion",
        class: "Aksov Hexe-Spinne",
        description: "Activate anti-gravity for aerial advantage.",
        effect: () => "Buff Evasion/Speed"
    },
    "cluster_bomb_deployment": {
        id: "cluster_bomb_deployment",
        name: "Cluster Bomb Deployment",
        class: "Aksov Hexe-Spinne",
        description: "Carpet bomb an area with biochemical explosives.",
        damage: "2d6",
        effect: () => "AoE Poison"
    },

    // Batch 5: Enemy & Boss Spells
    // Gravewalker
    "necrotic_strike": {
        id: "necrotic_strike",
        name: "Necrotic Strike",
        class: "Gravewalker",
        description: "A melee strike infused with necrotic energy.",
        damage: "1d8",
        effect: () => "Debuff"
    },
    "rotting_grasp": {
        id: "rotting_grasp",
        name: "Rotting Grasp",
        class: "Gravewalker",
        description: "Extend a decaying grasp that rots flesh over time.",
        damage: "1d6",
        effect: () => "DoT Rot"
    },
    "bone_shatter": {
        id: "bone_shatter",
        name: "Bone Shatter",
        class: "Gravewalker",
        description: "Unleash a bone-shattering shockwave that staggers enemies.",
        damage: "2d6",
        effect: () => "AoE Stagger"
    },

    // Shadowhorn Juggernaut
    "horn_charge": {
        id: "horn_charge",
        name: "Horn Charge",
        class: "Shadowhorn Juggernaut",
        description: "Charge with incredible speed, goring the target with shadow horns.",
        damage: "2d8",
        effect: () => "Piercing"
    },
    "seismic_stomp": {
        id: "seismic_stomp",
        name: "Seismic Stomp",
        class: "Shadowhorn Juggernaut",
        description: "Crush the ground to create a fiery quake that burns nearby foes.",
        damage: "2d6",
        effect: () => "AoE Knockdown"
    },
    "shadow_rush": {
        id: "shadow_rush",
        name: "Shadow Rush",
        class: "Shadowhorn Juggernaut",
        description: "Rush through shadows with blinding speed.",
        damage: "1d10",
        effect: () => "Buff Speed"
    },

    // Magma Leviathan
    "molten_breath": {
        id: "molten_breath",
        name: "Molten Breath",
        class: "Magma Leviathan",
        description: "Exhale a scorching stream of molten lava.",
        damage: "3d6",
        effect: () => "Burn"
    },
    "lava_slam": {
        id: "lava_slam",
        name: "Lava Slam",
        class: "Magma Leviathan",
        description: "Slam the ground with immense force, generating lava waves.",
        damage: "2d8",
        effect: () => "AoE"
    },
    "magma_eruption": {
        id: "magma_eruption",
        name: "Magma Eruption",
        class: "Magma Leviathan",
        description: "Trigger a cataclysmic eruption of lava and sulfur.",
        damage: "3d8",
        effect: () => "AoE Ultimate"
    },

    // Abyssal Overfiend
    "void_tentacles": {
        id: "void_tentacles",
        name: "Void Tentacles",
        class: "Abyssal Overfiend",
        description: "Summon dark tentacles from the void to entangle and crush.",
        damage: "2d8",
        effect: () => "Immobilize"
    },
    "chaos_gaze": {
        id: "chaos_gaze",
        name: "Chaos Gaze",
        class: "Abyssal Overfiend",
        description: "Release a devastating gaze of chaos that pierces all defenses.",
        damage: "3d8",
        effect: () => "Pierce"
    },
    "netherstorm": {
        id: "netherstorm",
        name: "Netherstorm",
        class: "Abyssal Overfiend",
        description: "Conjure a storm of chaotic energies that rains destruction.",
        damage: "4d6",
        effect: () => "AoE Ultimate"
    },

    // Aetherwing Herald
    "celestial_beam": {
        id: "celestial_beam",
        name: "Celestial Beam",
        class: "Aetherwing Herald",
        description: "Release a beam of ethereal light that pierces through targets.",
        damage: "2d6",
        effect: () => "Ranged Pierce"
    },
    "spectral_tempest": {
        id: "spectral_tempest",
        name: "Spectral Tempest",
        class: "Aetherwing Herald",
        description: "Summon a swirling spectral storm of glass shards.",
        damage: "2d8",
        effect: () => "AoE"
    },
    "dimensional_rift": {
        id: "dimensional_rift",
        name: "Dimensional Rift",
        class: "Aetherwing Herald",
        description: "Create evil rifts that damage and displace enemies.",
        damage: "2d6",
        effect: () => "Displacement"
    },
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
