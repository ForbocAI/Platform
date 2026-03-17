import type { AgentClass } from "../types";

/** Ordered list of classes shown in the class selection screen. */
export const CHARACTER_CLASSES: AgentClass[] = [
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

import { StatsComponent } from "../types";

type ClassTemplate = {
  baseStats: Partial<StatsComponent> & { Str: number; Agi: number; Arcane: number; maxHp: number; maxStress: number };
  startingCapabilities: string[];
};

export type ClassPresentation = {
  name: string;
  folk: string;
  role: string;
  blurb: string;
  signatureTalents: string[];
};

/**
 * Public-facing Lanternbough copy layered on top of legacy class ids.
 * The internal ids remain stable for mechanics until the deeper migration lands.
 */
export const CLASS_PRESENTATION: Record<AgentClass, ClassPresentation> = {
  "Ashwalker": {
    name: "Fairy Courier",
    folk: "Fairy routes",
    role: "Quick scout and lantern runner",
    blurb: "A fast-moving messenger who rides pollen winds, maps shortcuts, and keeps Lanternbough's routes stitched together.",
    signatureTalents: ["Pollen dash", "Shortcut sense", "Lantern spark"],
  },
  "Obsidian Warden": {
    name: "Gnome Burrowkeeper",
    folk: "Gnome workshops",
    role: "Sturdy builder and shelter guard",
    blurb: "A careful craftsperson who fortifies bridges, braces walkways, and turns small spaces into reliable havens.",
    signatureTalents: ["Stone brace", "Pocket workshop", "Warm ward"],
  },
  "Doomguard": {
    name: "Hearth Troll",
    folk: "Troll bridgeholds",
    role: "Big-hearted protector",
    blurb: "A reliable giant who carries supplies, steadies the frightened, and turns rough weather into a manageable inconvenience.",
    signatureTalents: ["Bridge shove", "Rain shelter", "Steadying roar"],
  },
  "Iron Armored Guardian": {
    name: "Bridgekeeper",
    folk: "Market watch",
    role: "Defender of busy paths",
    blurb: "A practical guardian who keeps crowded lanes safe, guides arrivals, and absorbs the first hit when trouble shows up.",
    signatureTalents: ["Rail guard", "Lantern shield", "Hold the crossing"],
  },
  "Aether Spirit": {
    name: "Brook Nymph",
    folk: "Creek songs",
    role: "Mist guide and water whisperer",
    blurb: "A lyrical guide who reads water moods, eases crossings, and turns reflective pools into routes and clues.",
    signatureTalents: ["Mist drift", "Brook pulse", "Ripple charm"],
  },
  "Thunder Trooper": {
    name: "Stormwing Scout",
    folk: "High canopy patrols",
    role: "Weather rider and lookout",
    blurb: "A daring scout who glides above the branches, reads sudden weather, and clears dangerous gusts for the rest of the valley.",
    signatureTalents: ["Gust hop", "Cloud marker", "Sky warning"],
  },
  "Cyberflux Guardian": {
    name: "Mossforged Tender",
    folk: "Workshop gardens",
    role: "Caretaker and repair hand",
    blurb: "A calm steward who mends tools, coaxes growth, and keeps the practical magic of daily life running smoothly.",
    signatureTalents: ["Patchwork bloom", "Sap charge", "Garden mend"],
  },
  "Voidwraith": {
    name: "Moonpetal Whisperer",
    folk: "Night bloom circles",
    role: "Subtle charm-worker",
    blurb: "A quiet guide who slips through hush and shimmer, notices what others miss, and keeps strange glades from becoming dangerous.",
    signatureTalents: ["Moonstep", "Soft veil", "Whisper pull"],
  },
  "Storm Titan": {
    name: "Canopy Giant",
    folk: "Upper bough guardians",
    role: "Massive path clearer",
    blurb: "A towering helper who moves fallen limbs, stabilizes lifts, and opens blocked routes with patient strength.",
    signatureTalents: ["Branch breaker", "Thunder stomp", "Lift carry"],
  },
  "Flame Corps": {
    name: "Kettle Spark",
    folk: "Tea stalls and kitchens",
    role: "Warmth maker and morale keeper",
    blurb: "A bright kitchen caster who turns embers, spice, and cheer into buffs, comfort, and dependable momentum.",
    signatureTalents: ["Tea flare", "Comfort broth", "Ember toss"],
  },
  "Byssalspawn": {
    name: "Rootsong Caller",
    folk: "Old grove memory",
    role: "Deep listener and harmonist",
    blurb: "A mystic tuned to bark, stone, and root memory, able to calm tangled places and hear where the valley has gone out of tune.",
    signatureTalents: ["Root hum", "Hollow echo", "Harmony draw"],
  },
  "Aksov Hexe-Spinne": {
    name: "Spindle Weaver",
    folk: "Silk lofts",
    role: "Trap setter and route maker",
    blurb: "A nimble artisan who spins walkable lines, anchors swinging paths, and turns clutter into clever movement.",
    signatureTalents: ["Silk line", "Nest snag", "Thread vault"],
  },
  "Twilight Weaver": {
    name: "Lantern Dryad",
    folk: "Garden circles",
    role: "Grove keeper and dusk mage",
    blurb: "A patient keeper of roots and glowfruit who nurtures safe clearings, living shelter, and restorative ritual spaces.",
    signatureTalents: ["Glowbloom", "Bramble hush", "Root cradle"],
  },
  "Gravewalker": {
    name: "Rootpath Keeper",
    folk: "Under-root archives",
    role: "Quiet tunnel guide",
    blurb: "A careful guide of old passages who prefers memory, maintenance, and patient route recovery over spectacle.",
    signatureTalents: ["Hollow lantern", "Archive step", "Path recall"],
  },
  "Shadowhorn Juggernaut": {
    name: "Mosshorn Rambler",
    folk: "Fern meadows",
    role: "Fast bruiser and charger",
    blurb: "A powerful traveler who clears thickets, guards caravans, and scatters nuisances with momentum rather than malice.",
    signatureTalents: ["Fern charge", "Stone kick", "Moss rush"],
  },
  "Magma Leviathan": {
    name: "Kilnback Guardian",
    folk: "Warm caverns",
    role: "Heavy defender and furnace heart",
    blurb: "A heat-bearing guardian from the deeper hollows who powers workshops and withstands trouble that would overwhelm smaller folk.",
    signatureTalents: ["Kiln breath", "Forge slam", "Warm shell"],
  },
  "Abyssal Overfiend": {
    name: "Great Willow Warden",
    folk: "Ancient vale myths",
    role: "Epic protector",
    blurb: "A towering legend of the old grove called on only when the whole valley needs shelter, strength, and impossible patience.",
    signatureTalents: ["Willow sweep", "Shelter call", "Vale roar"],
  },
  "Aetherwing Herald": {
    name: "Dew Herald",
    folk: "Morning watch",
    role: "Dawn signaler and aerial guide",
    blurb: "An early-rising flier who carries news between districts and uses light, breeze, and timing to keep communities connected.",
    signatureTalents: ["Sunbeam ping", "Dew drift", "Morning flare"],
  },
};

const normalizeClassToken = (value: string): string =>
  value.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

/** Normalize URL param to valid AgentClass or undefined. Supports both legacy ids and Lanternbough display names. */
export function normalizeClassIdFromParam(param: string): AgentClass | undefined {
  const normalized = normalizeClassToken(param);

  const byId = CHARACTER_CLASSES.find((classId) => normalizeClassToken(classId) === normalized);
  if (byId) return byId;

  const byPresentation = Object.entries(CLASS_PRESENTATION).find(([, presentation]) =>
    normalizeClassToken(presentation.name) === normalized
  );

  return byPresentation?.[0] as AgentClass | undefined;
}

export const CLASS_TEMPLATES: Record<AgentClass, ClassTemplate> = {
  "Ashwalker": { baseStats: { Str: 12, Agi: 16, Arcane: 14, maxHp: 120, maxStress: 100 }, startingCapabilities: ["relic_strike", "ember_dash", "ignition_burst"] },
  "Obsidian Warden": { baseStats: { Str: 18, Agi: 8, Arcane: 10, maxHp: 200, maxStress: 80 }, startingCapabilities: ["obsidian_surge", "petrified_diamond_embrace", "dark_crystal_shielding", "shatterstrike_slam", "reflective_aura", "resurgence_ritual", "crystalline_echo", "sinister_resonance", "ethereal_siren_imprisonment"] },
  "Doomguard": { baseStats: { Str: 16, Agi: 10, Arcane: 12, maxHp: 180, maxStress: 90 }, startingCapabilities: ["hellfire_explosion", "dreadful_charge", "explosive_barrage", "sword_attacks", "ranged_explosive_attacks", "shielded_bastion_stance", "infernal_overdrive_assault", "demonic_resilience", "dark_ward_aura", "cursed_chains", "dreadlords_command"] },
  "Iron Armored Guardian": { baseStats: { Str: 17, Agi: 9, Arcane: 8, maxHp: 170, maxStress: 100 }, startingCapabilities: ["ironclad_charge", "steel_shield_block", "sword_sweeps", "guardian_explosive_barrage", "stalwart_formation", "lance_thrust", "siege_breaker_slam", "fortified_resilience", "ironforge_bastion", "warforged_determination"] },
  "Aether Spirit": { baseStats: { Str: 8, Agi: 15, Arcane: 18, maxHp: 90, maxStress: 120 }, startingCapabilities: ["ethereal_phasing", "astral_bolt", "abysmal_burst", "spectral_wail"] },
  "Thunder Trooper": { baseStats: { Str: 13, Agi: 13, Arcane: 10, maxHp: 110, maxStress: 100 }, startingCapabilities: ["emp_grenade", "jetpack_maneuver", "shotgun_barrage", "grenade_assault"] },
  "Voidwraith": { baseStats: { Str: 10, Agi: 14, Arcane: 16, maxHp: 80, maxStress: 150 }, startingCapabilities: ["spectral_grasp", "haunting_moan", "shadowmeld_stalk", "soul_siphon"] },
  "Cyberflux Guardian": { baseStats: { Str: 14, Agi: 14, Arcane: 15, maxHp: 140, maxStress: 110 }, startingCapabilities: ["energy_surge", "nano_repair_matrix"] },
  "Byssalspawn": { baseStats: { Str: 15, Agi: 12, Arcane: 16, maxHp: 130, maxStress: 130 }, startingCapabilities: ["eldritch_devouring_gaze", "tendril_grapple_assault", "abysmal_torrent", "dimensional_phasing"] },
  "Twilight Weaver": { baseStats: { Str: 11, Agi: 18, Arcane: 14, maxHp: 100, maxStress: 100 }, startingCapabilities: ["shadowstep_ambush", "dark_web_entanglement", "twilight_bolt"] },
  "Storm Titan": { baseStats: { Str: 20, Agi: 10, Arcane: 18, maxHp: 250, maxStress: 120 }, startingCapabilities: ["electrical_charge_new", "thunderous_slam_new"] },
  "Aksov Hexe-Spinne": { baseStats: { Str: 12, Agi: 15, Arcane: 17, maxHp: 120, maxStress: 110 }, startingCapabilities: ["rocket_barrage", "chrome_volley", "jet_propulsion", "cluster_bomb_deployment"] },
  "Flame Corps": { baseStats: { Str: 15, Agi: 11, Arcane: 14, maxHp: 150, maxStress: 100 }, startingCapabilities: ["napalm_grenade_new", "inferno_overdrive_new"] },
  "Gravewalker": { baseStats: { Str: 16, Agi: 8, Arcane: 12, maxHp: 160, maxStress: 200 }, startingCapabilities: ["necrotic_strike", "rotting_grasp", "bone_shatter"] },
  "Shadowhorn Juggernaut": { baseStats: { Str: 16, Agi: 17, Arcane: 10, maxHp: 140, maxStress: 100 }, startingCapabilities: ["horn_charge", "seismic_stomp", "shadow_rush"] },
  "Magma Leviathan": { baseStats: { Str: 22, Agi: 8, Arcane: 16, maxHp: 300, maxStress: 150 }, startingCapabilities: ["molten_breath", "lava_slam", "magma_eruption"] },
  "Abyssal Overfiend": { baseStats: { Str: 25, Agi: 15, Arcane: 25, maxHp: 500, maxStress: 200 }, startingCapabilities: ["void_tentacles", "chaos_gaze", "netherstorm"] },
  "Aetherwing Herald": { baseStats: { Str: 12, Agi: 18, Arcane: 16, maxHp: 120, maxStress: 100 }, startingCapabilities: ["celestial_beam", "spectral_tempest", "dimensional_rift"] },
};
