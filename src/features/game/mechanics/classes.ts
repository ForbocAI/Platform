import type { CharacterClass } from "../types";

/** Ordered list of classes shown in the class selection screen. */
export const CHARACTER_CLASSES: CharacterClass[] = [
  "Ashwalker",
  "Obsidian Warden",
  "Doomguard",
  "Iron Armored Guardian",
  "Aether Spirit",
  "Thunder Trooper",
  "Cyberflux Guardian",
  "Voidwraith",
  "Storm Titan",
  "Flame Corps",
  "Byssalspawn",
  "Aksov Hexe-Spinne",
  "Twilight Weaver",
];

/** Normalize URL param (e.g. "Flame Corps", "Flame%20Corps", "flame_corps") to valid CharacterClass or undefined. */
export function normalizeClassIdFromParam(param: string): CharacterClass | undefined {
  const normalized = param.replace(/_/g, " ").toLowerCase();
  return CHARACTER_CLASSES.find(
    (c) => c.toLowerCase() === param.toLowerCase() || c.toLowerCase() === normalized
  );
}

type ClassTemplate = {
    baseStats: { Str: number; Agi: number; Arcane: number; maxHp: number; maxStress: number };
    startingSpells: string[];
};

export const CLASS_TEMPLATES: Record<CharacterClass, ClassTemplate> = {
    "Ashwalker": { baseStats: { Str: 12, Agi: 16, Arcane: 14, maxHp: 120, maxStress: 100 }, startingSpells: ["relic_strike", "ember_dash", "ignition_burst"] },
    "Obsidian Warden": { baseStats: { Str: 18, Agi: 8, Arcane: 10, maxHp: 200, maxStress: 80 }, startingSpells: ["obsidian_surge", "petrified_diamond_embrace", "dark_crystal_shielding", "shatterstrike_slam", "reflective_aura", "resurgence_ritual", "crystalline_echo", "sinister_resonance", "ethereal_siren_imprisonment"] },
    "Doomguard": { baseStats: { Str: 16, Agi: 10, Arcane: 12, maxHp: 180, maxStress: 90 }, startingSpells: ["hellfire_explosion", "dreadful_charge", "explosive_barrage", "sword_attacks", "ranged_explosive_attacks", "shielded_bastion_stance", "infernal_overdrive_assault", "demonic_resilience", "dark_ward_aura", "cursed_chains", "dreadlords_command"] },
    "Iron Armored Guardian": { baseStats: { Str: 17, Agi: 9, Arcane: 8, maxHp: 170, maxStress: 100 }, startingSpells: ["ironclad_charge", "steel_shield_block", "sword_sweeps", "guardian_explosive_barrage", "stalwart_formation", "lance_thrust", "siege_breaker_slam", "fortified_resilience", "ironforge_bastion", "warforged_determination"] },
    "Aether Spirit": { baseStats: { Str: 8, Agi: 15, Arcane: 18, maxHp: 90, maxStress: 120 }, startingSpells: ["ethereal_phasing", "astral_bolt", "abysmal_burst", "spectral_wail"] },
    "Thunder Trooper": { baseStats: { Str: 13, Agi: 13, Arcane: 10, maxHp: 110, maxStress: 100 }, startingSpells: ["emp_grenade", "jetpack_maneuver", "shotgun_barrage", "grenade_assault"] },
    "Voidwraith": { baseStats: { Str: 10, Agi: 14, Arcane: 16, maxHp: 80, maxStress: 150 }, startingSpells: ["spectral_grasp", "haunting_moan", "shadowmeld_stalk", "soul_siphon"] },
    "Cyberflux Guardian": { baseStats: { Str: 14, Agi: 14, Arcane: 15, maxHp: 140, maxStress: 110 }, startingSpells: ["energy_surge", "nano_repair_matrix"] },
    "Byssalspawn": { baseStats: { Str: 15, Agi: 12, Arcane: 16, maxHp: 130, maxStress: 130 }, startingSpells: ["eldritch_devouring_gaze", "tendril_grapple_assault", "abysmal_torrent", "dimensional_phasing"] },
    "Twilight Weaver": { baseStats: { Str: 11, Agi: 18, Arcane: 14, maxHp: 100, maxStress: 100 }, startingSpells: ["shadowstep_ambush", "dark_web_entanglement", "twilight_bolt"] },
    "Storm Titan": { baseStats: { Str: 20, Agi: 10, Arcane: 18, maxHp: 250, maxStress: 120 }, startingSpells: ["electrical_charge_new", "thunderous_slam_new"] },
    "Aksov Hexe-Spinne": { baseStats: { Str: 12, Agi: 15, Arcane: 17, maxHp: 120, maxStress: 110 }, startingSpells: ["rocket_barrage", "chrome_volley", "jet_propulsion", "cluster_bomb_deployment"] },
    "Flame Corps": { baseStats: { Str: 15, Agi: 11, Arcane: 14, maxHp: 150, maxStress: 100 }, startingSpells: ["napalm_grenade_new", "inferno_overdrive_new"] },
    "Gravewalker": { baseStats: { Str: 16, Agi: 8, Arcane: 12, maxHp: 160, maxStress: 200 }, startingSpells: ["necrotic_strike", "rotting_grasp", "bone_shatter"] },
    "Shadowhorn Juggernaut": { baseStats: { Str: 16, Agi: 17, Arcane: 10, maxHp: 140, maxStress: 100 }, startingSpells: ["horn_charge", "seismic_stomp", "shadow_rush"] },
    "Magma Leviathan": { baseStats: { Str: 22, Agi: 8, Arcane: 16, maxHp: 300, maxStress: 150 }, startingSpells: ["molten_breath", "lava_slam", "magma_eruption"] },
    "Abyssal Overfiend": { baseStats: { Str: 25, Agi: 15, Arcane: 25, maxHp: 500, maxStress: 200 }, startingSpells: ["void_tentacles", "chaos_gaze", "netherstorm"] },
    "Aetherwing Herald": { baseStats: { Str: 12, Agi: 18, Arcane: 16, maxHp: 120, maxStress: 100 }, startingSpells: ["celestial_beam", "spectral_tempest", "dimensional_rift"] },
};
