import type { Spell } from "../../types";

export const ENEMY_SPELLS: Record<string, Spell> = {
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
