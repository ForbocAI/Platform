import type { Spell } from "../../types";

export const MYSTICAL_CLASS_SPELLS: Record<string, Spell> = {
    // Iron Armored Guardian
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
};
