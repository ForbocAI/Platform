import type { AgentClass } from "../types";

/** Ordered list of classes shown in the class selection screen. */
export const CHARACTER_CLASSES: AgentClass[] = [
  "Wayfinder",
  "Bridgekeeper",
  "Thornwarden",
  "Ironbark Sentinel",
  "Mist Drifter",
  "Windguard Scout",
  "Glow Sentry",
  "Fog Wanderer",
  "Thunderoak Elder",
  "Hearthkeeper",
  "Tanglevine",
  "Silkspinner Scout",
  "Dew Weaver",
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
 * Public-facing Lanternbough copy for each class.
 */
export const CLASS_PRESENTATION: Record<AgentClass, ClassPresentation> = {
  "Wayfinder": {
    name: "Fairy Courier",
    folk: "Fairy routes",
    role: "Quick scout and lantern runner",
    blurb: "A fast-moving messenger who rides pollen winds, maps shortcuts, and keeps Lanternbough's routes stitched together.",
    signatureTalents: ["Pollen dash", "Shortcut sense", "Lantern spark"],
  },
  "Bridgekeeper": {
    name: "Gnome Burrowkeeper",
    folk: "Gnome workshops",
    role: "Sturdy builder and shelter guard",
    blurb: "A careful craftsperson who fortifies bridges, braces walkways, and turns small spaces into reliable havens.",
    signatureTalents: ["Stone brace", "Pocket workshop", "Warm ward"],
  },
  "Thornwarden": {
    name: "Hearth Troll",
    folk: "Troll bridgeholds",
    role: "Big-hearted protector",
    blurb: "A reliable giant who carries supplies, steadies the frightened, and turns rough weather into a manageable inconvenience.",
    signatureTalents: ["Bridge shove", "Rain shelter", "Steadying roar"],
  },
  "Ironbark Sentinel": {
    name: "Bridgekeeper",
    folk: "Market watch",
    role: "Defender of busy paths",
    blurb: "A practical guardian who keeps crowded lanes safe, guides arrivals, and absorbs the first hit when trouble shows up.",
    signatureTalents: ["Rail guard", "Lantern shield", "Hold the crossing"],
  },
  "Mist Drifter": {
    name: "Brook Nymph",
    folk: "Creek songs",
    role: "Mist guide and water whisperer",
    blurb: "A lyrical guide who reads water moods, eases crossings, and turns reflective pools into routes and clues.",
    signatureTalents: ["Mist drift", "Brook pulse", "Ripple charm"],
  },
  "Windguard Scout": {
    name: "Stormwing Scout",
    folk: "High canopy patrols",
    role: "Weather rider and lookout",
    blurb: "A daring scout who glides above the branches, reads sudden weather, and clears dangerous gusts for the rest of the valley.",
    signatureTalents: ["Gust hop", "Cloud marker", "Sky warning"],
  },
  "Glow Sentry": {
    name: "Mossforged Tender",
    folk: "Workshop gardens",
    role: "Caretaker and repair hand",
    blurb: "A calm steward who mends tools, coaxes growth, and keeps the practical magic of daily life running smoothly.",
    signatureTalents: ["Patchwork bloom", "Sap charge", "Garden mend"],
  },
  "Fog Wanderer": {
    name: "Moonpetal Whisperer",
    folk: "Night bloom circles",
    role: "Subtle charm-worker",
    blurb: "A quiet guide who slips through hush and shimmer, notices what others miss, and keeps strange glades from becoming dangerous.",
    signatureTalents: ["Moonstep", "Soft veil", "Whisper pull"],
  },
  "Thunderoak Elder": {
    name: "Canopy Giant",
    folk: "Upper bough guardians",
    role: "Massive path clearer",
    blurb: "A towering helper who moves fallen limbs, stabilizes lifts, and opens blocked routes with patient strength.",
    signatureTalents: ["Branch breaker", "Thunder stomp", "Lift carry"],
  },
  "Hearthkeeper": {
    name: "Kettle Spark",
    folk: "Tea stalls and kitchens",
    role: "Warmth maker and morale keeper",
    blurb: "A bright kitchen caster who turns embers, spice, and cheer into buffs, comfort, and dependable momentum.",
    signatureTalents: ["Tea flare", "Comfort broth", "Ember toss"],
  },
  "Tanglevine": {
    name: "Rootsong Caller",
    folk: "Old grove memory",
    role: "Deep listener and harmonist",
    blurb: "A mystic tuned to bark, stone, and root memory, able to calm tangled places and hear where the valley has gone out of tune.",
    signatureTalents: ["Root hum", "Hollow echo", "Harmony draw"],
  },
  "Silkspinner Scout": {
    name: "Spindle Weaver",
    folk: "Silk lofts",
    role: "Trap setter and route maker",
    blurb: "A nimble artisan who spins walkable lines, anchors swinging paths, and turns clutter into clever movement.",
    signatureTalents: ["Silk line", "Nest snag", "Thread vault"],
  },
  "Dew Weaver": {
    name: "Lantern Dryad",
    folk: "Garden circles",
    role: "Grove keeper and dusk mage",
    blurb: "A patient keeper of roots and glowfruit who nurtures safe clearings, living shelter, and restorative ritual spaces.",
    signatureTalents: ["Glowbloom", "Bramble hush", "Root cradle"],
  },
  "Rootwalker": {
    name: "Rootpath Keeper",
    folk: "Under-root archives",
    role: "Quiet tunnel guide",
    blurb: "A careful guide of old passages who prefers memory, maintenance, and patient route recovery over spectacle.",
    signatureTalents: ["Hollow lantern", "Archive step", "Path recall"],
  },
  "Mosshorn Charger": {
    name: "Mosshorn Rambler",
    folk: "Fern meadows",
    role: "Fast bruiser and charger",
    blurb: "A powerful traveler who clears thickets, guards caravans, and scatters nuisances with momentum rather than malice.",
    signatureTalents: ["Fern charge", "Stone kick", "Moss rush"],
  },
  "Bramble Colossus": {
    name: "Kilnback Guardian",
    folk: "Warm caverns",
    role: "Heavy defender and furnace heart",
    blurb: "A heat-bearing guardian from the deeper hollows who powers workshops and withstands trouble that would overwhelm smaller folk.",
    signatureTalents: ["Kiln breath", "Forge slam", "Warm shell"],
  },
  "The Briarking": {
    name: "Great Willow Warden",
    folk: "Ancient vale myths",
    role: "Epic protector",
    blurb: "A towering legend of the old grove called on only when the whole valley needs shelter, strength, and impossible patience.",
    signatureTalents: ["Willow sweep", "Shelter call", "Vale roar"],
  },
  "Petalwing Herald": {
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
  "Wayfinder": { baseStats: { Str: 12, Agi: 16, Arcane: 14, maxHp: 120, maxStress: 100 }, startingCapabilities: ["craft_strike", "lantern_dash", "pollen_storm"] },
  "Bridgekeeper": { baseStats: { Str: 18, Agi: 8, Arcane: 10, maxHp: 200, maxStress: 80 }, startingCapabilities: ["root_stone_sheltering", "granite_shell", "reflective_warmth", "rootslam", "steady_resonance", "restoration_circle", "stone_echo", "creek_stone_embrace", "pebble_toss"] },
  "Thornwarden": { baseStats: { Str: 16, Agi: 10, Arcane: 12, maxHp: 180, maxStress: 90 }, startingCapabilities: ["seedstorm", "briar_charge", "seed_bomb_tosses", "staff_sweeps", "bloom_burst", "bark_bastion_stance", "verdant_rush", "root_resilience", "shelter_aura", "vine_binding", "wardens_call"] },
  "Ironbark Sentinel": { baseStats: { Str: 17, Agi: 9, Arcane: 8, maxHp: 170, maxStress: 100 }, startingCapabilities: ["ironbark_charge", "root_shield_block", "staff_sweeps_sentinel", "seed_scatter_volley", "steadfast_formation", "lance_root_thrust", "ground_stomp", "fortified_bark", "oaken_bastion", "heartwood_determination"] },
  "Mist Drifter": { baseStats: { Str: 8, Agi: 15, Arcane: 18, maxHp: 90, maxStress: 120 }, startingCapabilities: ["mistfade_drift", "wisp_grasp", "breeze_dash", "lullaby_hum"] },
  "Windguard Scout": { baseStats: { Str: 13, Agi: 13, Arcane: 10, maxHp: 110, maxStress: 100 }, startingCapabilities: ["gust_tool_sweep", "wind_step_agility", "rain_cape_shield", "thunder_clap"] },
  "Fog Wanderer": { baseStats: { Str: 10, Agi: 14, Arcane: 16, maxHp: 80, maxStress: 150 }, startingCapabilities: ["mistfade_walk", "nostalgia_hum", "haze_mantle", "memory_siphon"] },
  "Glow Sentry": { baseStats: { Str: 14, Agi: 14, Arcane: 15, maxHp: 140, maxStress: 110 }, startingCapabilities: ["light_pulse", "glow_shield"] },
  "Tanglevine": { baseStats: { Str: 15, Agi: 12, Arcane: 16, maxHp: 130, maxStress: 130 }, startingCapabilities: ["vine_reach", "root_grip", "pollen_cloud", "regrowth"] },
  "Dew Weaver": { baseStats: { Str: 11, Agi: 18, Arcane: 14, maxHp: 100, maxStress: 100 }, startingCapabilities: ["silkstep", "thread_binding", "dewdrop_cloak"] },
  "Thunderoak Elder": { baseStats: { Str: 20, Agi: 10, Arcane: 18, maxHp: 250, maxStress: 120 }, startingCapabilities: ["lightning_bark", "chain_spark"] },
  "Silkspinner Scout": { baseStats: { Str: 12, Agi: 15, Arcane: 17, maxHp: 120, maxStress: 110 }, startingCapabilities: ["silk_barrage", "thread_volley", "web_propulsion", "cluster_web"] },
  "Hearthkeeper": { baseStats: { Str: 15, Agi: 11, Arcane: 14, maxHp: 150, maxStress: 100 }, startingCapabilities: ["hearth_volley", "forge_overdrive"] },
  "Rootwalker": { baseStats: { Str: 16, Agi: 8, Arcane: 12, maxHp: 160, maxStress: 200 }, startingCapabilities: ["root_strike", "tendril_grasp", "soil_shatter"] },
  "Mosshorn Charger": { baseStats: { Str: 16, Agi: 17, Arcane: 10, maxHp: 140, maxStress: 100 }, startingCapabilities: ["antler_charge", "stomping_impact", "forest_sprint"] },
  "Bramble Colossus": { baseStats: { Str: 22, Agi: 8, Arcane: 16, maxHp: 300, maxStress: 150 }, startingCapabilities: ["vine_surge_sweep", "root_slam_tremor", "tangle_pool_eruption"] },
  "The Briarking": { baseStats: { Str: 25, Agi: 15, Arcane: 25, maxHp: 500, maxStress: 200 }, startingCapabilities: ["vine_arms", "thorn_gaze", "tangle_storm_call"] },
  "Petalwing Herald": { baseStats: { Str: 12, Agi: 18, Arcane: 16, maxHp: 120, maxStress: 100 }, startingCapabilities: ["petal_projection", "petal_storm", "bloom_reckoning"] },
};
