/**
 * Lanternbough-compatible lore exports.
 *
 * Compatibility note:
 * These export names are retained so existing imports keep working.
 */

/** Cozy-world central landmark. */
export const LORE_UMBRALYN = "Lanternbough";

/** The warm, mysterious chorus guiding the vale. */
export const LORE_GOETIAN_CHTHONICA = "Rootsong";

/** Central tree-city landmark. */
export const LORE_LANTERNBOUGH = "Lanternbough";
export const LORE_MIGDAL_KUDAR = "Heartwood Spire";

/** Starting hub and provisioning nook. */
export const LORE_QUADRANGLE = "Thimble Market";

/** Default player fantasy. */
export const LORE_KAMENAL = "Wayfinder";

/** High canopy district and skyward promise. */
export const LORE_ASTRAL_EMPIRE = "Moonpetal Canopy";

/** Upper routes and lantern bridges. */
export const LORE_ETHEREAL_TOWERLANDS = "Moonpetal Canopy";

/** Water-rich pathing district. */
export const LORE_ABYSSAL_MURK = "Brookwhisper Runs";

/** Seasonal cadence and warm rhythm. */
export const LORE_CHURNING_PHRASE =
  "the turning of seasons and lantern light";

/** Realm-scale migration aliases retained for current imports. */
export const LORE_RIFT_REALM = "Wonderloom Vale";
export const LORE_THE_MANY = "the Neighbors";

/** Thimble Market wares. */
export const LORE_WARES = [
  "tea leaves",
  "jam jars",
  "glowstones",
  "moss rope",
  "lantern wicks",
  "berry cakes",
  "seed packets",
  "sap-glass trinkets",
  "buttons",
  "charms",
  "bridge nails",
  "weather cloaks",
] as const;

/** Gentle chants and sayings from Lanternbough. */
export const LORE_CHANTS = [
  "Keep the lanterns lit.",
  "Every path remembers a kindness.",
  "The Rootsong hums beneath still water.",
  "What is tangled can be tended.",
  "Make room at the table.",
] as const;

/** Place names and world anchors. */
export const LORE_PLACES = {
  QUADAR_TOWER: "Lanternbough",
  QUADRANGLE: "Thimble Market",
  UMBRALYN: "Lanternbough",
  GOETIAN_CHTHONICA: "Rootsong",
  ETHEREAL_TOWERLANDS: "Moonpetal Canopy",
  ABYSSAL_MURK: "Brookwhisper Runs",
  STATIC_SEA_OF_ALL_NOISE: "Creekglass Mere",
  SLIPGATES: "mushroom rings",
  QVHT: "Hushglen Hollows",
  CHTHONICA: "Rootsong Hollows",
  PRECIPICE_OF_SHADOWLANDS: "Fogstep Ridge",
  CHROMATIC_STEEL_QUANTUM_FIELD: "Glowcap Terraces",
  ALGORITHMIC_LABORATORIES: "Tinker Nooks",
  TWILIGHT_ALCHEMY_HAVEN: "Briarsoft Gardens",
  ABYSS_OF_INFERNAL_LORE: "Old Hollow Archive",
  VOID_MAW: "Willowmere Pool",
  RUNE_TEMPLES: "Charm Houses",
  CRUMBLING_RUINS: "Weathered Rootworks",
  DIMENSIONAL_NEXUS: "Wonderloom Gate",
  CAVERNOUS_ABYSS: "Underroot Caverns",
  ETHER: "Moonmist Air",
  STERILE_CHAMBER: "The Kettle Workshop",
} as const;

/** Cozy workshop flavor for the old chamber slot. */
export const LORE_STERILE_CHAMBER = [
  "The kettle workshop glowed with warm brass light and shelves of labeled jars.",
  "Steam curled through the room as if it were thinking aloud.",
  "Every ladle, needle, and tuning fork looked used, repaired, and loved.",
  "The workbench held maps, ribbons, seed packets, and patient little mysteries.",
  "Nothing here felt sterile; it felt cared for.",
  "The quiet hum of the place suggested that fixes could be found if one stayed long enough to listen.",
] as const;

/** Regions and atmosphere groupings. */
export const LORE_REALMS = [
  "Candlecap Commons",
  "Mossstep Lanes",
  "Brookwhisper Runs",
  "Briarsoft Gardens",
  "Moonpetal Canopy",
  "Hushglen Hollows",
  "Glowcap Terraces",
  "Thimble Market",
  "Creekglass Mere",
  "Underroot Caverns",
  "Fogstep Ridge",
  "Wonderloom Gate",
] as const;

/** Environment list for Lanternbough. */
export const LORE_LANTERNBOUGH_ENVIRONMENTS = [
  "Lantern-lit market nooks",
  "Root bridges and puddle walks",
  "Mushroom terraces",
  "Creek crossings",
  "Dryad groves",
  "Canopy lifts",
  "Firefly observatories",
  "Fog-soft hollows",
  "Warm caverns",
  "Hidden workrooms",
  "Seasonal festival lanes",
  "Seed libraries",
  "Wonderloom gates",
  "Rain shelters",
  "Kitchen gardens",
  "Old root tunnels",
  "Stone troll arches",
  "Moonlit overlooks",
] as const;

/** General atmospheric prose for prompts and flavor text. */
export const LORE_ATMOSPHERE = [
  "Lanternbough rises through the vale like a village remembering how to sing.",
  "Rain beads on carved railings and every window glows a little gold.",
  "Neighbors leave polished stones on bridge posts so late travelers know the way.",
  "The Rootsong carries through bark, brookwater, kettles, and hanging bells.",
  "Warm kitchens and mossy shortcuts make the world feel stitched by care.",
  "Mushroom stalls glow softly in the evening, their awnings heavy with rain.",
  "Fireflies drift between walkways like notes from an unfinished lullaby.",
  "Even the stranger places feel hushed rather than hostile.",
  "A repaired path changes more than travel; it changes who can visit whom.",
  "Every district keeps its own weather habits, recipes, and rumors.",
  "A bridge supper can matter as much as a battle.",
  "The old groves hold memory patiently and offer it a little at a time.",
  "Brookwhisper Runs speak in reflective riddles and silver currents.",
  "Moonpetal Canopy feels closest to the stars without ever losing sight of home.",
  "Thimble Market is half tea counter, half rumor board, half emergency pantry.",
  "The valley is not dying; it is merely out of tune.",
] as const;

/** Small lyrical fragment bank. */
export const LORE_ECHOES_VERSE = [
  "Where lantern light meets rainy leaves, the patient path returns.",
  "A borrowed song can guide you home if sung with care.",
  "The brook remembers every kindness carried over it.",
  "What blooms at dusk may still be waiting at dawn.",
  "The vale grows brighter when neighbors keep each other in mind.",
] as const;

/** Legacy tag slot repurposed for cozy prompt tokens. */
export const LORE_ABYSSAL_TAGS = [
  "LanternRoutes",
  "WarmRain",
  "NeighborMagic",
  "Rootsong",
  "FestivalRepair",
  "FireflyMaps",
  "CreekRiddles",
] as const;

/** Vignette-ready themes used by narrative helpers. */
export const LORE_VIGNETTE_THEMES = [
  "Thimble Market at dusk",
  "Rootsong in the rafters",
  "Missing fairy courier",
  "Bridge supper before the rain",
  "Moonpetal lantern lift",
  "Briarsoft herb circle",
  "Brookwhisper ferry favor",
  "Glowcap terrace festival",
  "Hushglen hush and shimmer",
  "Weathered rootwork repair",
  "Fogstep lookout",
  "Tea steam augury",
  "Firefly cartography",
  "Seed ledger recovery",
  "Moth archivist visit",
  "Mushroom ring transit",
  "Pollen wind warning",
  "Troll rain shelter",
  "Dryad orchard memory",
  "Underroot story cache",
  "Wonderloom gate question",
  "Kettle charm experiment",
  "Creekglass reflection",
  "Lanternbough neighborhood rounds",
] as const;
