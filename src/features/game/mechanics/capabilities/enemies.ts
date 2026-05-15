import type { Capability } from "../../types";

export const ENEMY_CAPABILITIES: Record<string, Capability> = {
    // Rootwalker
    "root_strike": {
        id: "root_strike",
        name: "Root Strike",
        agentClass: "Rootwalker",
        description: "A melee strike channeled through deep roots.",
        magnitude: "1d8",
        effect: () => "Debuff"
    },
    "tendril_grasp": {
        id: "tendril_grasp",
        name: "Tendril Grasp",
        agentClass: "Rootwalker",
        description: "Extend root tendrils that sap energy over time.",
        magnitude: "1d6",
        effect: () => "DoT Rot"
    },
    "soil_shatter": {
        id: "soil_shatter",
        name: "Soil Shatter",
        agentClass: "Rootwalker",
        description: "Unleash a ground-shaking tremor that staggers enemies.",
        magnitude: "2d6",
        effect: () => "AoE Stagger"
    },
    // Mosshorn Charger
    "antler_charge": {
        id: "antler_charge",
        name: "Antler Charge",
        agentClass: "Mosshorn Charger",
        description: "Charge with incredible speed, goring the target with moss-covered antlers.",
        magnitude: "2d8",
        effect: () => "Piercing"
    },
    "stomping_impact": {
        id: "stomping_impact",
        name: "Stomping Impact",
        agentClass: "Mosshorn Charger",
        description: "Crush the ground to create tremors that stagger nearby foes.",
        magnitude: "2d6",
        effect: () => "AoE Knockdown"
    },
    "forest_sprint": {
        id: "forest_sprint",
        name: "Forest Sprint",
        agentClass: "Mosshorn Charger",
        description: "Sprint through the forest with blinding speed.",
        magnitude: "1d10",
        effect: () => "Buff Speed"
    },
    // Bramble Colossus
    "vine_surge_sweep": {
        id: "vine_surge_sweep",
        name: "Vine Surge Sweep",
        agentClass: "Bramble Colossus",
        description: "Sweep with massive vine arms in a wide arc.",
        magnitude: "3d6",
        effect: () => "Burn"
    },
    "root_slam_tremor": {
        id: "root_slam_tremor",
        name: "Root Slam Tremor",
        agentClass: "Bramble Colossus",
        description: "Slam roots into the ground, generating tremor waves.",
        magnitude: "2d8",
        effect: () => "AoE"
    },
    "tangle_pool_eruption": {
        id: "tangle_pool_eruption",
        name: "Tangle Pool Eruption",
        agentClass: "Bramble Colossus",
        description: "Trigger a cataclysmic eruption of tangling vines and thorns.",
        magnitude: "3d8",
        effect: () => "AoE Ultimate"
    },
    // The Briarking
    "vine_arms": {
        id: "vine_arms",
        name: "Vine Arms",
        agentClass: "The Briarking",
        description: "Summon massive vine arms to entangle and crush.",
        magnitude: "2d8",
        effect: () => "Immobilize"
    },
    "thorn_gaze": {
        id: "thorn_gaze",
        name: "Thorn Gaze",
        agentClass: "The Briarking",
        description: "Release a devastating gaze that pierces all defenses with thorns.",
        magnitude: "3d8",
        effect: () => "Pierce"
    },
    "tangle_storm_call": {
        id: "tangle_storm_call",
        name: "Tangle Storm Call",
        agentClass: "The Briarking",
        description: "Conjure a storm of tangling vines and thorns that rains destruction.",
        magnitude: "4d6",
        effect: () => "AoE Ultimate"
    },
    // Petalwing Herald
    "petal_projection": {
        id: "petal_projection",
        name: "Petal Projection",
        agentClass: "Petalwing Herald",
        description: "Release a beam of petal-light that pierces through targets.",
        magnitude: "2d6",
        effect: () => "Ranged Pierce"
    },
    "petal_storm": {
        id: "petal_storm",
        name: "Petal Storm",
        agentClass: "Petalwing Herald",
        description: "Summon a swirling storm of razor petals.",
        magnitude: "2d8",
        effect: () => "AoE"
    },
    "bloom_reckoning": {
        id: "bloom_reckoning",
        name: "Bloom Reckoning",
        agentClass: "Petalwing Herald",
        description: "Create blooming rifts that damage and displace enemies.",
        magnitude: "2d6",
        effect: () => "Displacement"
    },
};
