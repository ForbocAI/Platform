import type { Capability } from "../../types";

export const MYSTICAL_CLASS_CAPABILITIES: Record<string, Capability> = {
    // Ironbark Sentinel
    "ironbark_charge": {
        id: "ironbark_charge",
        name: "Ironbark Charge",
        agentClass: "Ironbark Sentinel",
        description: "Powerful charge causing knockback and stun.",
        magnitude: "1d10",
        effect: () => "Knockback/Stun"
    },
    "root_shield_block": {
        id: "root_shield_block",
        name: "Root Shield Block",
        agentClass: "Ironbark Sentinel",
        description: "Block projectiles and reduce damage with root shield.",
        effect: () => "Block/DR"
    },
    "staff_sweeps_sentinel": {
        id: "staff_sweeps_sentinel",
        name: "Staff Sweeps",
        agentClass: "Ironbark Sentinel",
        description: "Sweep attack hitting multiple adversaries.",
        magnitude: "1d8",
        effect: () => "AoE Melee"
    },
    "seed_scatter_volley": {
        id: "seed_scatter_volley",
        name: "Seed Scatter Volley",
        agentClass: "Ironbark Sentinel",
        description: "Launch seed projectiles at distant foes.",
        magnitude: "2d6",
        effect: () => "AoE Ranged"
    },
    "steadfast_formation": {
        id: "steadfast_formation",
        name: "Steadfast Formation",
        agentClass: "Ironbark Sentinel",
        description: "Defensive formation, reduce damage.",
        effect: () => "Defense Buff"
    },
    "lance_root_thrust": {
        id: "lance_root_thrust",
        name: "Lance Root Thrust",
        agentClass: "Ironbark Sentinel",
        description: "Precise thrust piercing defenses with root lance.",
        magnitude: "1d10",
        effect: () => "Piercing"
    },
    "ground_stomp": {
        id: "ground_stomp",
        name: "Ground Stomp",
        agentClass: "Ironbark Sentinel",
        description: "Ground slam causing tremors and knockback.",
        magnitude: "2d8",
        effect: () => "AoE Stun"
    },
    "fortified_bark": {
        id: "fortified_bark",
        name: "Fortified Bark",
        agentClass: "Ironbark Sentinel",
        description: "Reduce effectiveness of debuffs with hardened bark.",
        effect: () => "Resist Debuffs"
    },
    "oaken_bastion": {
        id: "oaken_bastion",
        name: "Oaken Bastion",
        agentClass: "Ironbark Sentinel",
        description: "Impenetrable oaken barrier, temporary invulnerability.",
        effect: () => "Invulnerability"
    },
    "heartwood_determination": {
        id: "heartwood_determination",
        name: "Heartwood Determination",
        agentClass: "Ironbark Sentinel",
        description: "Increase offensive and defensive capabilities through heartwood resolve.",
        effect: () => "Buff All"
    },
    // Mist Drifter
    "mistfade_drift": {
        id: "mistfade_drift",
        name: "Mistfade Drift",
        agentClass: "Mist Drifter",
        description: "Phase in and out of mist banks.",
        effect: () => "Immunity"
    },
    "wisp_grasp": {
        id: "wisp_grasp",
        name: "Wisp Grasp",
        agentClass: "Mist Drifter",
        description: "Bolt of gentle mist energy.",
        magnitude: "2d6",
        effect: () => "Slow"
    },
    "breeze_dash": {
        id: "breeze_dash",
        name: "Breeze Dash",
        agentClass: "Mist Drifter",
        description: "Unleash a gust of breeze, disorienting foes.",
        magnitude: "2d6",
        effect: () => "AoE Confuse"
    },
    "lullaby_hum": {
        id: "lullaby_hum",
        name: "Lullaby Hum",
        agentClass: "Mist Drifter",
        description: "A soothing hum that calms enemies.",
        magnitude: "1d4",
        effect: () => "AoE Fear"
    },
    // Fog Wanderer
    "mistfade_walk": {
        id: "mistfade_walk",
        name: "Mistfade Walk",
        agentClass: "Fog Wanderer",
        description: "Ensnare and slow enemies with fog tendrils.",
        magnitude: "1d6",
        effect: () => "Immobilize"
    },
    "nostalgia_hum": {
        id: "nostalgia_hum",
        name: "Nostalgia Hum",
        agentClass: "Fog Wanderer",
        description: "Instill wistfulness, reducing enemy efficiency.",
        effect: () => "Fear debuff"
    },
    "haze_mantle": {
        id: "haze_mantle",
        name: "Haze Mantle",
        agentClass: "Fog Wanderer",
        description: "Wrap in haze, becoming harder to perceive.",
        effect: () => "Buff Evasion"
    },
    "memory_siphon": {
        id: "memory_siphon",
        name: "Memory Siphon",
        agentClass: "Fog Wanderer",
        description: "Draw energy from fading memories to restore yourself.",
        magnitude: "1d8",
        effect: () => "Life Steal"
    },
    // Dew Weaver
    "silkstep": {
        id: "silkstep",
        name: "Silkstep",
        agentClass: "Dew Weaver",
        description: "Glide behind a foe for a precise strike.",
        magnitude: "3d6",
        effect: () => "High Crit"
    },
    "thread_binding": {
        id: "thread_binding",
        name: "Thread Binding",
        agentClass: "Dew Weaver",
        description: "Weave silk threads to bind an enemy in place.",
        magnitude: "1d4",
        effect: () => "Immobilize"
    },
    "dewdrop_cloak": {
        id: "dewdrop_cloak",
        name: "Dewdrop Cloak",
        agentClass: "Dew Weaver",
        description: "A cloak of dewdrops that shimmers and deflects.",
        magnitude: "1d8",
        effect: () => "None"
    },
    // Tanglevine
    "vine_reach": {
        id: "vine_reach",
        name: "Vine Reach",
        agentClass: "Tanglevine",
        description: "Extend vines to grasp and drain energy.",
        magnitude: "1d8",
        effect: () => "Drain/Debuff"
    },
    "root_grip": {
        id: "root_grip",
        name: "Root Grip",
        agentClass: "Tanglevine",
        description: "Extend roots to crush and bind targets.",
        magnitude: "2d6",
        effect: () => "Immobilize"
    },
    "pollen_cloud": {
        id: "pollen_cloud",
        name: "Pollen Cloud",
        agentClass: "Tanglevine",
        description: "Unleash a thick cloud of disorienting pollen.",
        magnitude: "2d6",
        effect: () => "AoE Ranged"
    },
    "regrowth": {
        id: "regrowth",
        name: "Regrowth",
        agentClass: "Tanglevine",
        description: "Phase into a rooted state to regenerate and avoid harm.",
        effect: () => "Buff Evasion"
    },
    // Silkspinner Scout
    "silk_barrage": {
        id: "silk_barrage",
        name: "Silk Barrage",
        agentClass: "Silkspinner Scout",
        description: "Unleash a barrage of silk projectiles.",
        magnitude: "3d6",
        effect: () => "AoE Nature"
    },
    "thread_volley": {
        id: "thread_volley",
        name: "Thread Volley",
        agentClass: "Silkspinner Scout",
        description: "Fire guided silk threads at a target.",
        magnitude: "2d8",
        effect: () => "Homing/Precise"
    },
    "web_propulsion": {
        id: "web_propulsion",
        name: "Web Propulsion",
        agentClass: "Silkspinner Scout",
        description: "Activate web lines for aerial advantage.",
        effect: () => "Buff Evasion/Speed"
    },
    "cluster_web": {
        id: "cluster_web",
        name: "Cluster Web",
        agentClass: "Silkspinner Scout",
        description: "Deploy a cluster of sticky webs across an area.",
        magnitude: "2d6",
        effect: () => "AoE Slow"
    },
};
