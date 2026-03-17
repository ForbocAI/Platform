import type { Area, Biome, NonPlayerActor, Vendor } from "../types";
import { selectNextBiome, generateGroundLoot, generateRandomNonPlayerActor, NPC_TEMPLATES, type AreaGenContext } from '../mechanics/systems/generation';
import { generateRandomVendor, generateMarketplace } from "./vendor";

// --- Immutable area-name data tables ---

const BIOME_NAME_PARTS: Readonly<Record<Biome, readonly string[]>> = {
    "Ethereal Marshlands": ["Willow", "Mist", "Reed", "Moth", "Glade"],
    "Toxic Wastes": ["Copper", "Patch", "Steam", "Moss", "Tinker"],
    "Haunted Chapel": ["Bell", "Candle", "Choir", "Vesper", "Sanctum"],
    "Obsidian Spire": ["Moon", "Lantern", "Heartwood", "Spire", "Lookout"],
    "Quadar Tower": ["Lantern", "Thimble", "Market", "Nook", "Hollow"],
    "Military Installation": ["Workshop", "Bridge", "Pulley", "Depot", "Engine"],
    "Eldritch Fortress": ["Rootwatch", "Hearth", "Gate", "Keep", "Bastion"],
    "Labyrinthine Dungeon": ["Burrow", "Warren", "Tunnel", "Hall", "Passage"],
    "Chromatic-Steel Fungi": ["Candlecap", "Spore", "Gleam", "Canopy", "Grotto"],
    "Chthonic Depths": ["Root", "Hollow", "Lantern", "Glen", "Grotto"],
    "Static Sea of All Noise": ["Drift", "Chime", "Current", "Song", "Reed"],
    "Twilight Alchemy Haven": ["Still", "Garden", "Tea", "Petal", "Hearth"],
    "Abyss of Infernal Lore": ["Archive", "Page", "Hollow", "Root", "Shrine"],
    "Precipice of the Shadowlands": ["Mist", "Brink", "Moon", "Bridge", "Edge"],
    "Rune Temples": ["Rune", "Bell", "Lantern", "Shrine", "Sanctum"],
    "Crumbling Ruins": ["Oldstone", "Arch", "Hearth", "Vault", "Keep"],
    "Dimensional Nexus": ["Fold", "Gate", "Bridge", "Spiral", "Vortex"],
    "Cavernous Abyss": ["Cavern", "Pool", "Hollow", "Echo", "Grotto"],
    "The Sterile Chamber": ["Herbarium", "Atrium", "Archives", "Table", "Sanctum"],
} as const;

const BIOME_DESCRIPTIONS: Readonly<Record<Biome, string>> = {
    "Ethereal Marshlands": "Soft fog drifts over reed beds and lantern moss, carrying frog song and the occasional misplaced parcel.",
    "Toxic Wastes": "A reclaimed patch of copper runoff, salvage gardens, and careful footpaths where clever tinkerers still find useful scraps.",
    "Haunted Chapel": "An old chapel of bells and candlelight where echoes linger kindly and every bench seems to remember a song.",
    "Obsidian Spire": "A glossy lookout of dark glass and moonlit steps, prized for weather signs, long views, and hanging lanterns.",
    "Quadar Tower": "The heart of Lanternbough's trunk routes, full of market nooks, lift pulleys, and neighbors coming and going with armfuls of supplies.",
    "Military Installation": "An old practical quarter of pulleys, depots, and bridge tools now reused by patient makers and route keepers.",
    "Eldritch Fortress": "A heavy old stronghold turned warding post, where rootwardens keep maps, ropes, and weather bells ready by the door.",
    "Labyrinthine Dungeon": "Twisting burrows and storage halls lit by friendly sconces, ideal for hide-and-seek until you lose your bearings.",
    "Chromatic-Steel Fungi": "Towering mushroom caps shimmer with rainbow sheen, sheltering food stalls, rare spores, and tiny market festivals.",
    "Chthonic Depths": "Quiet root caverns full of dripstone, glow moss, and thoughtful paths beneath the village.",
    "Static Sea of All Noise": "A windy stretch of humming reeds and chimes where gossip, weather, and wayward songs all travel at once.",
    "Twilight Alchemy Haven": "A tea-and-tincture district scented with herbs, warm glass, and simmering experiments.",
    "Abyss of Infernal Lore": "An old archive hollow where warm lanterns, annotated maps, and stubborn mysteries wait to be sorted.",
    "Precipice of the Shadowlands": "A cliffside of mist bridges and sunset lookouts where the valley feels wide and wonderfully uncertain.",
    "Rune Temples": "Carved shrines of patient symbols, low lamps, and weathered steps that invite quiet observation.",
    "Crumbling Ruins": "Old arches and garden walls softened by moss, perfect for scavenging useful bits and telling stories.",
    "Dimensional Nexus": "A knot of footbridges, folds, and peculiar shortcuts where space behaves more like a suggestion than a rule.",
    "Cavernous Abyss": "Broad caverns with echoing pools and stepping stones, cooler and calmer than the upper boughs.",
    "The Sterile Chamber": "A pristine herbarium and recovery room where careful tools, labeled drawers, and hush-soft lanterns keep order.",
} as const;

/** Biomes with elevated danger — higher NPC/hazard spawn rates. */
const DEEP_BIOMES: readonly Biome[] = [
    "Chthonic Depths", "Cavernous Abyss", "Abyss of Infernal Lore",
    "Dimensional Nexus", "Static Sea of All Noise", "Twilight Alchemy Haven",
    "Precipice of the Shadowlands", "Chromatic-Steel Fungi", "The Sterile Chamber",
    "Labyrinthine Dungeon", "Eldritch Fortress"
] as const;

const BIOME_TO_REGIONAL: Record<Biome, string> = {
    "Ethereal Marshlands": "Misty Marsh",
    "Toxic Wastes": "Copperpatch",
    "Haunted Chapel": "Bell Chapel",
    "Obsidian Spire": "Moon Spire",
    "Quadar Tower": "Lanternbough",
    "Military Installation": "Maker Depot",
    "Eldritch Fortress": "Rootwatch",
    "Labyrinthine Dungeon": "Burrow Maze",
    "Chromatic-Steel Fungi": "Candlecap Commons",
    "Chthonic Depths": "Root Hollows",
    "Static Sea of All Noise": "Chime Current",
    "Twilight Alchemy Haven": "Tea Garden",
    "Abyss of Infernal Lore": "Old Hollow Archive",
    "Precipice of the Shadowlands": "Mist Brinks",
    "Rune Temples": "Rune Shrine",
    "Crumbling Ruins": "Oldstone Ruins",
    "Dimensional Nexus": "Foldgate",
    "Cavernous Abyss": "Echo Caverns",
    "The Sterile Chamber": "Quiet Herbarium",
};

const pickFrom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const dangerFactorFor = (biome: Biome): number => DEEP_BIOMES.includes(biome) ? 1.25 : 1;

const generateExits = () => ({
    North: Math.random() > 0.3 ? "new-area" as const : null,
    South: Math.random() > 0.3 ? "new-area" as const : null,
    East: Math.random() > 0.3 ? "new-area" as const : null,
    West: Math.random() > 0.3 ? "new-area" as const : null,
});

const generateNPCs = (dangerFactor: number): NonPlayerActor[] => {
    const threshold = 70 / dangerFactor;
    return Math.random() * 100 > threshold ? [generateRandomNonPlayerActor()] : [];
};

const generateVendors = (p1: string, biome: Biome): { vendors: Vendor[]; isMarketplace: boolean } => {
    if (p1.includes("Market") && Math.random() < 0.90) {
        return { vendors: generateMarketplace(biome), isMarketplace: true };
    }
    const vendorChance = (p1.includes("Store") || p1.includes("Shop") || p1.includes("Stall") || p1.includes("Nook")) ? 0.60 : 0.15;
    return Math.random() < vendorChance
        ? { vendors: [generateRandomVendor(biome)], isMarketplace: false }
        : { vendors: [], isMarketplace: false };
};

// --- Public API ---

export const generateArea = (id?: string, biomeOverride?: Biome, context?: AreaGenContext | null): Area => {
    const biome = biomeOverride ?? selectNextBiome(context);
    const parts = BIOME_NAME_PARTS[biome];
    const p1 = pickFrom(parts);
    const p2 = pickFrom(parts);
    const dangerFactor = dangerFactorFor(biome);
    const { vendors, isMarketplace } = generateVendors(p1, biome);
    const hazardThreshold = 20 * dangerFactor;

    return {
        id: id || Math.random().toString(36).substring(7),
        title: `${p1} ${p2}`,
        description: BIOME_DESCRIPTIONS[biome] || "You stand in a strange, uncharted area.",
        biome,
        regionalType: BIOME_TO_REGIONAL[biome] || "Area",
        hazards: Math.random() * 100 < hazardThreshold ? ["Wayward Rootsong"] : [],
        exits: generateExits(),
        npcs: generateNPCs(dangerFactor),
        vendors,
        groundLoot: generateGroundLoot(biome),
        isMarketplace,
    };
};

export interface GenerateAreaOptions {
    forceVendor?: boolean;
    /** Context for story-coherent biome progression. */
    context?: AreaGenContext | null;
}

export const generateAreaWithOptions = (id?: string, biomeOverride?: Biome, options?: GenerateAreaOptions): Area => {
    const area = generateArea(id, biomeOverride, options?.context);
    if (options?.forceVendor && (!area.vendors || area.vendors.length === 0)) {
        const vendorTypes = ["Scavenger", "Nomad", "Tech-Trader", "Mystic", "Mercenary Captain"] as const;
        const type = pickFrom(vendorTypes);
        return {
            ...area,
            vendors: [generateRandomVendor(area.biome, type)]
        };
    }
    return area;
};

export interface GenerateStartAreaOptions {
    id?: string;
    biome?: Biome;
    deterministic?: boolean;
    forceVendor?: boolean;
    forceNPC?: boolean | string;
}

const BASE_CAMP_FEATURES = [
    { type: "resource_plot" as const, progress: 0, ready: false },
    { type: "work_station" as const, kind: "maintenance" },
    { type: "work_station" as const, kind: "fabrication" }
] as const;

const THIMBLE_MARKET_TITLE = "Thimble Market";
const THIMBLE_MARKET_DESCRIPTION = "A cheerful nook carved into the trunk, with tea steaming beside the provisioning counter and fresh notices pinned near the route board.";

const createBaseCampArea = (id: string, biome: Biome): Area => ({
    id,
    title: THIMBLE_MARKET_TITLE,
    description: THIMBLE_MARKET_DESCRIPTION,
    biome,
    regionalType: "Lanternbough Hub",
    hazards: [],
    exits: { North: "new-area", South: "new-area", East: "new-area", West: "new-area" },
    npcs: [],
    vendors: [],
    isBaseCamp: true,
    features: [...BASE_CAMP_FEATURES],
});

const applyForcedNPC = (area: Area, forceNPC: boolean | string): Area => {
    if (!forceNPC) return area;
    const npcs = typeof forceNPC === 'string' && NPC_TEMPLATES[forceNPC]
        ? [(() => {
            const template = NPC_TEMPLATES[forceNPC as string];
            return {
                id: Math.random().toString(36).substring(7),
                type: template.type,
                faction: 'enemy' as const,
                name: forceNPC as string,
                description: template.description || "A mysterious entity.",
                stats: {
                    hp: template.baseStats.maxHp || 10,
                    maxHp: template.baseStats.maxHp || 10,
                    stress: 0,
                    maxStress: 100,
                    speed: template.baseStats.speed || 1,
                    defense: template.baseStats.defense || 0,
                    damage: template.baseStats.damage || 1,
                    invulnerable: 0,
                },
                capabilities: { learned: template.capabilities || [] },
                inventory: {
                    weapons: [], currentWeaponIndex: 0, items: [], equipment: {}, spirit: 0, blood: 0,
                    offensiveAssets: [], currentAssetIndex: 0, genericAssets: [], primaryResource: 0, secondaryResource: 0
                },
                activeEffects: [],
                x: 0, y: 0, vx: 0, vy: 0, width: 14, height: 24,
                isGrounded: false, facingRight: true,
                state: "idle", frame: 0, animTimer: 0,
                active: true,
            } as NonPlayerActor;
        })()]
        : [generateRandomNonPlayerActor()];
    return { ...area, npcs, isBaseCamp: false };
};

export const generateStartArea = (opts?: GenerateStartAreaOptions): Area => {
    const areaId = opts?.id ?? "start_area";
    const biome = opts?.biome ?? "Quadar Tower";

    if (opts?.deterministic) {
        const base = createBaseCampArea(areaId, biome);
        const withVendor = opts.forceVendor
            ? { ...base, vendors: [generateRandomVendor(biome, "Mercenary Captain")] }
            : base;
        return opts.forceNPC ? applyForcedNPC(withVendor, opts.forceNPC) : withVendor;
    }

    const area = generateAreaWithOptions(areaId, biome, { forceVendor: opts?.forceVendor });

    if (!opts?.forceNPC) {
        return {
            ...area,
            title: THIMBLE_MARKET_TITLE,
            description: THIMBLE_MARKET_DESCRIPTION,
            npcs: [],
            isBaseCamp: true,
            regionalType: "Lanternbough Hub",
            features: [...BASE_CAMP_FEATURES],
        };
    }

    return {
        ...area,
        title: THIMBLE_MARKET_TITLE,
        description: THIMBLE_MARKET_DESCRIPTION,
        regionalType: "Lanternbough Hub",
        npcs: area.npcs.length > 0 ? area.npcs : [generateRandomNonPlayerActor()],
    };
};
