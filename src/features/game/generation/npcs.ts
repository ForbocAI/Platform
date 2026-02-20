import type { AgentNPC } from "../types";

export const NPC_TEMPLATES: Record<string, any> = {
    "Obsidian Warden": {
        type: "Obsidian Warden", // Will be made generic in Phase 2
        description: "A tower of black glass and malice.",
        baseStats: { maxHp: 60, defense: 15, damage: 10, speed: 0.5 },
        capabilities: ["obsidian_surge", "death_shard_strike"]
    },
    "Doomguard": {
        type: "Doomguard",
        description: "A shell of armor powered by sheer hate.",
        baseStats: { maxHp: 50, defense: 14, damage: 8, speed: 0.8 },
        capabilities: ["hellfire_explosion", "dreadful_charge"]
    },
    "Ashwalker Renegade": {
        type: "Ashwalker",
        description: "A fallen ranger turned to madness.",
        baseStats: { maxHp: 40, defense: 13, damage: 7, speed: 1.0 },
        capabilities: ["ember_dash", "relic_strike"]
    },
    "Iron Armored Guardian": {
        type: "Iron Armored Guardian",
        description: "Heavily armored medieval swordfest knight.",
        baseStats: { maxHp: 55, defense: 16, damage: 9, speed: 0.6 },
        capabilities: ["ironclad_charge", "steel_shield_block"]
    },
    "Aether Spirit": {
        type: "Aether Spirit",
        description: "A fleeting form of shimmering angles.",
        baseStats: { maxHp: 35, defense: 12, damage: 12, speed: 1.2 },
        capabilities: ["ethereal_phasing", "astral_bolt"]
    },
    "Thunder Trooper": {
        type: "Thunder Trooper",
        description: "A raining commando with a love of carnage.",
        baseStats: { maxHp: 45, defense: 13, damage: 11, speed: 1.1 },
        capabilities: ["shotgun_barrage", "grenade_assault"]
    },
    "Storm Titan": {
        type: "Storm Titan",
        description: "A hulking creature with quantum electric attacks.",
        baseStats: { maxHp: 120, defense: 18, damage: 20, speed: 0.4 },
        capabilities: ["electrical_charge", "thunderous_slam"]
    },
    "Flame Corps Brute": {
        type: "Flame Corps",
        description: "A large, brutish phallic creature with a grenade launcher.",
        baseStats: { maxHp: 65, defense: 14, damage: 15, speed: 0.7 },
        capabilities: ["napalm_grenade", "inferno_overdrive"]
    },
    "Gravewalker": {
        type: "Gravewalker",
        description: "A reanimated corpse, a dead wandering.",
        baseStats: { maxHp: 70, defense: 11, damage: 13, speed: 0.9 },
        capabilities: ["necrotic_strike", "rotting_grasp", "bone_shatter"]
    },
    "Shadowhorn Juggernaut": {
        type: "Shadowhorn Juggernaut",
        description: "An agile, horned creature with powerful melee attacks.",
        baseStats: { maxHp: 60, defense: 14, damage: 14, speed: 1.3 },
        capabilities: ["horn_charge", "seismic_stomp", "shadow_rush"]
    },
    "Magma Leviathan": {
        type: "Magma Leviathan",
        description: "A huge, massive lava creature from the core.",
        baseStats: { maxHp: 200, defense: 20, damage: 25, speed: 0.3 },
        capabilities: ["molten_breath", "lava_slam", "magma_eruption"]
    },
    "Abyssal Overfiend": {
        type: "Abyssal Overfiend",
        description: "The ultimate antagonist. A monstrous entity with tentacles and void power.",
        baseStats: { maxHp: 500, defense: 22, damage: 40, speed: 0.5 },
        capabilities: ["void_tentacles", "chaos_gaze", "netherstorm"]
    },
    "Aetherwing Herald": {
        type: "Aetherwing Herald",
        description: "A flying, otherworldly creature that shoots energy projectiles.",
        baseStats: { maxHp: 120, defense: 15, damage: 18, speed: 1.4 },
        capabilities: ["celestial_beam", "spectral_tempest", "dimensional_rift"]
    }
};

export function generateRandomAgentNPC(): AgentNPC {
    const npcNames = Object.keys(NPC_TEMPLATES);
    const npcName = npcNames[Math.floor(Math.random() * npcNames.length)];
    const template = NPC_TEMPLATES[npcName];

    return {
        id: Math.random().toString(36).substring(7),
        type: template.type,
        faction: 'enemy',
        name: npcName,
        description: template.description || "A mysterious entity.",

        // Stats Component
        stats: {
            hp: template.baseStats.maxHp,
            maxHp: template.baseStats.maxHp,
            stress: 0,
            maxStress: 100,
            speed: template.baseStats.speed || 1,
            defense: template.baseStats.defense || 0,
            damage: template.baseStats.damage || 1,
            invulnerable: 0,
        },

        // Capability Component
        capabilities: {
            learned: template.capabilities || [],
        },

        // Inventory Component (Empty for NPCs by default)
        inventory: {
            weapons: [],
            currentWeaponIndex: 0,
            items: [],
            equipment: {},
            spirit: 0,
            blood: 0,
        },

        // AI Component
        ai: {
            behaviorState: 'idle',
            targetId: null,
            memory: {},
            awareness: null
        },

        // Physics
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 14,
        height: 24,
        isGrounded: false,
        facingRight: false,

        // Visual State
        state: "idle",
        frame: 0,
        animTimer: 0,

        // Flags
        activeEffects: [],
        active: true
    };
}
