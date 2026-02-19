import type { AgentNPC } from "../types";

export const NPC_TEMPLATES: Record<string, Partial<AgentNPC>> = {
    "Obsidian Warden": {
        agentClass: "Obsidian Warden",
        ac: 15,
        description: "A tower of black glass and malice.",
        maxHp: 60, capabilities: ["obsidian_surge", "death_shard_strike"]
    },
    "Doomguard": {
        agentClass: "Doomguard",
        ac: 14,
        description: "A shell of armor powered by sheer hate.",
        maxHp: 50, capabilities: ["hellfire_explosion", "dreadful_charge"]
    },
    "Ashwalker Renegade": {
        agentClass: "Ashwalker",
        ac: 13,
        description: "A fallen ranger turned to madness.",
        maxHp: 40, capabilities: ["ember_dash", "relic_strike"]
    },
    "Iron Armored Guardian": {
        agentClass: "Iron Armored Guardian",
        ac: 16,
        description: "Heavily armored medieval swordfest knight.",
        maxHp: 55, capabilities: ["ironclad_charge", "steel_shield_block"]
    },
    "Aether Spirit": {
        agentClass: "Aether Spirit",
        ac: 12,
        description: "A fleeting form of shimmering angles.",
        maxHp: 35, capabilities: ["ethereal_phasing", "astral_bolt"]
    },
    "Thunder Trooper": {
        agentClass: "Thunder Trooper",
        ac: 13,
        description: "A raining commando with a love of carnage.",
        maxHp: 45, capabilities: ["shotgun_barrage", "grenade_assault"]
    },
    "Storm Titan": {
        agentClass: "Storm Titan",
        ac: 18,
        description: "A hulking creature with quantum electric attacks.",
        maxHp: 120, capabilities: ["electrical_charge", "thunderous_slam"]
    },
    "Flame Corps Brute": {
        agentClass: "Flame Corps",
        ac: 14,
        description: "A large, brutish phallic creature with a grenade launcher.",
        maxHp: 65, capabilities: ["napalm_grenade", "inferno_overdrive"]
    },
    "Gravewalker": {
        agentClass: "Gravewalker",
        ac: 11,
        description: "A reanimated corpse, a dead wandering.",
        maxHp: 70, capabilities: ["necrotic_strike", "rotting_grasp", "bone_shatter"]
    },
    "Shadowhorn Juggernaut": {
        agentClass: "Shadowhorn Juggernaut",
        ac: 14,
        description: "An agile, horned creature with powerful melee attacks.",
        maxHp: 60, capabilities: ["horn_charge", "seismic_stomp", "shadow_rush"]
    },
    "Magma Leviathan": {
        agentClass: "Magma Leviathan",
        ac: 20,
        description: "A huge, massive lava creature from the core.",
        maxHp: 200, capabilities: ["molten_breath", "lava_slam", "magma_eruption"]
    },
    "Abyssal Overfiend": {
        agentClass: "Abyssal Overfiend",
        ac: 22,
        description: "The ultimate antagonist. A monstrous entity with tentacles and void power.",
        maxHp: 500, capabilities: ["void_tentacles", "chaos_gaze", "netherstorm"]
    },
    "Aetherwing Herald": {
        agentClass: "Aetherwing Herald",
        ac: 15,
        description: "A flying, otherworldly creature that shoots energy projectiles.",
        maxHp: 120, capabilities: ["celestial_beam", "spectral_tempest", "dimensional_rift"]
    }
};

export function generateRandomAgentNPC(): AgentNPC {
    const npcNames = Object.keys(NPC_TEMPLATES);
    const npcName = npcNames[Math.floor(Math.random() * npcNames.length)];
    const template = NPC_TEMPLATES[npcName];
    return {
        id: Math.random().toString(36).substring(7),
        name: npcName,
        ...template,
        hp: template.maxHp || 10,
        maxStress: 100,
        stress: 0,
        activeEffects: []
    } as AgentNPC;
}
