import type { Spell } from "../../types";

export const TECH_CLASS_SPELLS: Record<string, Spell> = {
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
    "napalm_grenade_new": {
        id: "napalm_grenade_new",
        name: "Napalm Grenade",
        class: "Flame Corps",
        description: "Explodes and burns enemies over time.",
        damage: "1d6",
        effect: () => "AoE Burn"
    },
    "inferno_overdrive_new": {
        id: "inferno_overdrive_new",
        name: "Inferno Overdrive",
        class: "Flame Corps",
        description: "Significantly boosts damage output but causes stress.",
        effect: () => "Buff Damage"
    },
    // Storm Titan
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
    "electrical_charge_new": {
        id: "electrical_charge_new",
        name: "Electrical Charge",
        class: "Storm Titan",
        description: "A jolt of electricity.",
        damage: "2d8",
        effect: () => "None"
    },
    "thunderous_slam_new": {
        id: "thunderous_slam_new",
        name: "Thunderous Slam",
        class: "Storm Titan",
        description: "Massive area damage.",
        damage: "2d6",
        effect: () => "AoE Stun"
    },
};
