import type { Capability, StatsComponent } from "../../types";

export const MYSTICAL_CLASS_CAPABILITIES: Record<string, Capability> = {
    // Iron Armored Guardian
    "ironclad_charge": {
        id: "ironclad_charge",
        name: "Ironclad Charge",
        agentClass: "Iron Armored Guardian",
        description: "Powerful charge causing knockback and stun.",
        magnitude: "1d10",
        effect: () => "Knockback/Stun"
    },
    "steel_shield_block": {
        id: "steel_shield_block",
        name: "Steel Shield Block",
        agentClass: "Iron Armored Guardian",
        description: "Block projectiles and reduce damage.",
        effect: () => "Block/DR"
    },
    "sword_sweeps": {
        id: "sword_sweeps",
        name: "Sword Sweeps",
        agentClass: "Iron Armored Guardian",
        description: "Sweep attack hitting multiple adversaries.",
        magnitude: "1d8",
        effect: () => "AoE Melee"
    },
    "guardian_explosive_barrage": {
        id: "guardian_explosive_barrage",
        name: "Explosive Barrage (Guardian)",
        agentClass: "Iron Armored Guardian",
        description: "Launch explosive projectiles at distant foes.",
        magnitude: "2d6",
        effect: () => "AoE Ranged"
    },
    "stalwart_formation": {
        id: "stalwart_formation",
        name: "Stalwart Formation",
        agentClass: "Iron Armored Guardian",
        description: "Defensive formation, reduce damage.",
        effect: () => "Defense Buff"
    },
    "lance_thrust": {
        id: "lance_thrust",
        name: "Lance Thrust",
        agentClass: "Iron Armored Guardian",
        description: "Precise thrust piercing armor.",
        magnitude: "1d10",
        effect: () => "Piercing"
    },
    "siege_breaker_slam": {
        id: "siege_breaker_slam",
        name: "Siege Breaker Slam",
        agentClass: "Iron Armored Guardian",
        description: "Devastating ground slam, causing tremors.",
        magnitude: "2d8",
        effect: () => "AoE Stun"
    },
    "fortified_resilience": {
        id: "fortified_resilience",
        name: "Fortified Resilience",
        agentClass: "Iron Armored Guardian",
        description: "Reduce effectiveness of debuffs.",
        effect: () => "Resist Debuffs"
    },
    "ironforge_bastion": {
        id: "ironforge_bastion",
        name: "Ironforge Bastion",
        agentClass: "Iron Armored Guardian",
        description: "Impenetrable barrier, temporary invulnerability.",
        effect: () => "Invulnerability"
    },
    "warforged_determination": {
        id: "warforged_determination",
        name: "Warforged Determination",
        agentClass: "Iron Armored Guardian",
        description: "Increase offensive and defensive capabilities.",
        effect: () => "Buff All"
    },
    // Aether Spirit
    "ethereal_phasing": {
        id: "ethereal_phasing",
        name: "Ethereal Phasing",
        agentClass: "Aether Spirit",
        description: "Phase in/out of material plane.",
        effect: () => "Immunity"
    },
    "astral_bolt": {
        id: "astral_bolt",
        name: "Astral Bolt",
        agentClass: "Aether Spirit",
        description: "Bolt of dark energy.",
        magnitude: "2d6",
        effect: () => "Slow"
    },
    "abysmal_burst": {
        id: "abysmal_burst",
        name: "Abysmal Burst",
        agentClass: "Aether Spirit",
        description: "Unleash void energy, damaging and confusing foes.",
        magnitude: "2d6",
        effect: () => "AoE Confuse"
    },
    "spectral_wail": {
        id: "spectral_wail",
        name: "Spectral Wail",
        agentClass: "Aether Spirit",
        description: "A horrifying scream that terrifies enemies.",
        magnitude: "1d4",
        effect: () => "AoE Fear"
    },
    // Voidwraith
    "spectral_grasp": {
        id: "spectral_grasp",
        name: "Spectral Grasp",
        agentClass: "Voidwraith",
        description: "Ensnare and immobilize enemies.",
        magnitude: "1d6",
        effect: () => "Immobilize"
    },
    "haunting_moan": {
        id: "haunting_moan",
        name: "Haunting Moan",
        agentClass: "Voidwraith",
        description: "Instill fear and reduce efficiency.",
        effect: () => "Fear debuff"
    },
    "shadowmeld_stalk": {
        id: "shadowmeld_stalk",
        name: "Shadowmeld Stalk",
        agentClass: "Voidwraith",
        description: "Fade into the shadows, becoming harder to hit.",
        effect: () => "Buff Evasion"
    },
    "soul_siphon": {
        id: "soul_siphon",
        name: "Soul Siphon",
        agentClass: "Voidwraith",
        description: "Drain life force from the enemy to heal yourself.",
        magnitude: "1d8",
        effect: () => "Life Steal"
    },
    // Twilight Weaver
    "shadowstep_ambush": {
        id: "shadowstep_ambush",
        name: "Shadowstep Ambush",
        agentClass: "Twilight Weaver",
        description: "Teleport behind foe for a critical strike.",
        magnitude: "3d6",
        effect: () => "High Crit"
    },
    "dark_web_entanglement": {
        id: "dark_web_entanglement",
        name: "Dark Web Entanglement",
        agentClass: "Twilight Weaver",
        description: "Weave shadows to bind an enemy.",
        magnitude: "1d4",
        effect: () => "Immobilize"
    },
    "twilight_bolt": {
        id: "twilight_bolt",
        name: "Twilight Bolt",
        agentClass: "Twilight Weaver",
        description: "A bolt of twilight energy.",
        magnitude: "1d8",
        effect: () => "None"
    },
    // Byssalspawn
    "eldritch_devouring_gaze": {
        id: "eldritch_devouring_gaze",
        name: "Eldritch Devouring Gaze",
        agentClass: "Byssalspawn",
        description: "Consume life force with an alien gaze.",
        magnitude: "1d8",
        effect: () => "Drain/Debuff"
    },
    "tendril_grapple_assault": {
        id: "tendril_grapple_assault",
        name: "Tendril Grapple Assault",
        agentClass: "Byssalspawn",
        description: "Extend shadowy tendrils to crush and bind.",
        magnitude: "2d6",
        effect: () => "Immobilize"
    },
    "abysmal_torrent": {
        id: "abysmal_torrent",
        name: "Abysmal Torrent",
        agentClass: "Byssalspawn",
        description: "Unleash projectiles of dark abyssal energy.",
        magnitude: "2d6",
        effect: () => "AoE Ranged"
    },
    "dimensional_phasing": {
        id: "dimensional_phasing",
        name: "Dimensional Phasing",
        agentClass: "Byssalspawn",
        description: "Phase into ethereal state to avoid harm.",
        effect: () => "Buff Evasion"
    },
    // Aksov Hexe-Spinne
    "rocket_barrage": {
        id: "rocket_barrage",
        name: "Rocket Barrage",
        agentClass: "Aksov Hexe-Spinne",
        description: "Unleash a barrage of explosive hell rockets.",
        magnitude: "3d6",
        effect: () => "AoE Fire"
    },
    "chrome_volley": {
        id: "chrome_volley",
        name: "Chrome Volley",
        agentClass: "Aksov Hexe-Spinne",
        description: "Fire guided death missiles at a target.",
        magnitude: "2d8",
        effect: () => "Homing/Precise"
    },
    "jet_propulsion": {
        id: "jet_propulsion",
        name: "Jet Propulsion",
        agentClass: "Aksov Hexe-Spinne",
        description: "Activate anti-gravity for aerial advantage.",
        effect: () => "Buff Evasion/Speed"
    },
    "cluster_bomb_deployment": {
        id: "cluster_bomb_deployment",
        name: "Cluster Bomb Deployment",
        agentClass: "Aksov Hexe-Spinne",
        description: "Carpet bomb an area with biochemical explosives.",
        magnitude: "2d6",
        effect: () => "AoE Poison"
    },
};
