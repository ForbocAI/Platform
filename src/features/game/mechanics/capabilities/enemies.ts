import type { Capability } from "../../types";

export const ENEMY_CAPABILITIES: Record<string, Capability> = {
    // Gravewalker
    "necrotic_strike": {
        id: "necrotic_strike",
        name: "Necrotic Strike",
        agentClass: "Gravewalker",
        description: "A melee strike infused with necrotic energy.",
        magnitude: "1d8",
        effect: () => "Debuff"
    },
    "rotting_grasp": {
        id: "rotting_grasp",
        name: "Rotting Grasp",
        agentClass: "Gravewalker",
        description: "Extend a decaying grasp that rots flesh over time.",
        magnitude: "1d6",
        effect: () => "DoT Rot"
    },
    "bone_shatter": {
        id: "bone_shatter",
        name: "Bone Shatter",
        agentClass: "Gravewalker",
        description: "Unleash a bone-shattering shockwave that staggers enemies.",
        magnitude: "2d6",
        effect: () => "AoE Stagger"
    },
    // Shadowhorn Juggernaut
    "horn_charge": {
        id: "horn_charge",
        name: "Horn Charge",
        agentClass: "Shadowhorn Juggernaut",
        description: "Charge with incredible speed, goring the target with shadow horns.",
        magnitude: "2d8",
        effect: () => "Piercing"
    },
    "seismic_stomp": {
        id: "seismic_stomp",
        name: "Seismic Stomp",
        agentClass: "Shadowhorn Juggernaut",
        description: "Crush the ground to create a fiery quake that burns nearby foes.",
        magnitude: "2d6",
        effect: () => "AoE Knockdown"
    },
    "shadow_rush": {
        id: "shadow_rush",
        name: "Shadow Rush",
        agentClass: "Shadowhorn Juggernaut",
        description: "Rush through shadows with blinding speed.",
        magnitude: "1d10",
        effect: () => "Buff Speed"
    },
    // Magma Leviathan
    "molten_breath": {
        id: "molten_breath",
        name: "Molten Breath",
        agentClass: "Magma Leviathan",
        description: "Exhale a scorching stream of molten lava.",
        magnitude: "3d6",
        effect: () => "Burn"
    },
    "lava_slam": {
        id: "lava_slam",
        name: "Lava Slam",
        agentClass: "Magma Leviathan",
        description: "Slam the ground with immense force, generating lava waves.",
        magnitude: "2d8",
        effect: () => "AoE"
    },
    "magma_eruption": {
        id: "magma_eruption",
        name: "Magma Eruption",
        agentClass: "Magma Leviathan",
        description: "Trigger a cataclysmic eruption of lava and sulfur.",
        magnitude: "3d8",
        effect: () => "AoE Ultimate"
    },
    // Abyssal Overfiend
    "void_tentacles": {
        id: "void_tentacles",
        name: "Void Tentacles",
        agentClass: "Abyssal Overfiend",
        description: "Summon dark tentacles from the void to entangle and crush.",
        magnitude: "2d8",
        effect: () => "Immobilize"
    },
    "chaos_gaze": {
        id: "chaos_gaze",
        name: "Chaos Gaze",
        agentClass: "Abyssal Overfiend",
        description: "Release a devastating gaze of chaos that pierces all defenses.",
        magnitude: "3d8",
        effect: () => "Pierce"
    },
    "netherstorm": {
        id: "netherstorm",
        name: "Netherstorm",
        agentClass: "Abyssal Overfiend",
        description: "Conjure a storm of chaotic energies that rains destruction.",
        magnitude: "4d6",
        effect: () => "AoE Ultimate"
    },
    // Aetherwing Herald
    "celestial_beam": {
        id: "celestial_beam",
        name: "Celestial Beam",
        agentClass: "Aetherwing Herald",
        description: "Release a beam of ethereal light that pierces through targets.",
        magnitude: "2d6",
        effect: () => "Ranged Pierce"
    },
    "spectral_tempest": {
        id: "spectral_tempest",
        name: "Spectral Tempest",
        agentClass: "Aetherwing Herald",
        description: "Summon a swirling spectral storm of glass shards.",
        magnitude: "2d8",
        effect: () => "AoE"
    },
    "dimensional_rift": {
        id: "dimensional_rift",
        name: "Dimensional Rift",
        agentClass: "Aetherwing Herald",
        description: "Create evil rifts that damage and displace enemies.",
        magnitude: "2d6",
        effect: () => "Displacement"
    },
};
