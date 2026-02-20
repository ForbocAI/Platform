import type { Capability, StatsComponent } from "../../types";

export const TECH_CLASS_CAPABILITIES: Record<string, Capability> = {
    // Thunder Trooper
    "emp_grenade": {
        id: "emp_grenade",
        name: "EMP Grenade",
        agentClass: "Thunder Trooper",
        description: "Disables mechanical foes and deals area damage.",
        magnitude: "2d6",
        effect: () => "AoE Stun"
    },
    "jetpack_maneuver": {
        id: "jetpack_maneuver",
        name: "Jetpack Maneuver",
        agentClass: "Thunder Trooper",
        description: "Boosts evasion significantly.",
        effect: () => "Buff Evasion"
    },
    "shotgun_barrage": {
        id: "shotgun_barrage",
        name: "Shotgun Barrage",
        agentClass: "Thunder Trooper",
        description: "Rapid barrage of shotgun blasts.",
        magnitude: "3d6",
        effect: () => "Close-range devastation"
    },
    "grenade_assault": {
        id: "grenade_assault",
        name: "Grenade Assault",
        agentClass: "Thunder Trooper",
        description: "Throw explosive projectiles.",
        magnitude: "2d8",
        effect: () => "AoE"
    },
    // Cyberflux Guardian
    "energy_surge": {
        id: "energy_surge",
        name: "Energy Surge",
        agentClass: "Cyberflux Guardian",
        description: "A blast of raw energy.",
        magnitude: "3d6",
        effect: () => "None"
    },
    "nano_repair_matrix": {
        id: "nano_repair_matrix",
        name: "Nano-Repair Matrix",
        agentClass: "Cyberflux Guardian",
        description: "Self-repair systems activated.",
        effect: () => "Heal"
    },
    // Flame Corps
    "napalm_grenade": {
        id: "napalm_grenade",
        name: "Napalm Grenade Toss",
        agentClass: "Flame Corps",
        description: "Fiery explosions with burning effect.",
        magnitude: "2d6",
        effect: () => "Burning Dot"
    },
    "inferno_overdrive": {
        id: "inferno_overdrive",
        name: "Inferno Overdrive",
        agentClass: "Flame Corps",
        description: "Heightened state of pyrokinetic power.",
        effect: () => "Berserk state"
    },
    "napalm_grenade_new": {
        id: "napalm_grenade_new",
        name: "Napalm Grenade",
        agentClass: "Flame Corps",
        description: "Explodes and burns enemies over time.",
        magnitude: "1d6",
        effect: () => "AoE Burn"
    },
    "inferno_overdrive_new": {
        id: "inferno_overdrive_new",
        name: "Inferno Overdrive",
        agentClass: "Flame Corps",
        description: "Significantly boosts damage output but causes stress.",
        effect: () => "Buff Damage"
    },
    // Storm Titan
    "electrical_charge": {
        id: "electrical_charge",
        name: "Electrical Charge",
        agentClass: "Storm Titan",
        description: "Imbue melee attacks with atomic damage.",
        effect: () => "Extra Arcane Dmg"
    },
    "thunderous_slam": {
        id: "thunderous_slam",
        name: "Thunderous Slam",
        agentClass: "Storm Titan",
        description: "Shockwaves that evaporate nearby enemies.",
        magnitude: "4d6",
        effect: () => "AoE Knockback"
    },
    "electrical_charge_new": {
        id: "electrical_charge_new",
        name: "Electrical Charge",
        agentClass: "Storm Titan",
        description: "A jolt of electricity.",
        magnitude: "2d8",
        effect: () => "None"
    },
    "thunderous_slam_new": {
        id: "thunderous_slam_new",
        name: "Thunderous Slam",
        agentClass: "Storm Titan",
        description: "Massive area damage.",
        magnitude: "2d6",
        effect: () => "AoE Stun"
    },
};
