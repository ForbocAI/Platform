import type { Room, Biome, Enemy, Merchant } from "../types";
import { selectNextBiome, generateGroundLoot, generateRandomEnemy, ENEMY_TEMPLATES, type RoomGenContext } from "../generation";
import { generateRandomMerchant, generateMarketplace, generateWares } from "./merchant";

// --- Immutable room-name data tables ---

const BIOME_NAME_PARTS: Readonly<Record<Biome, readonly string[]>> = {
    "Ethereal Marshlands": ["Ghost", "Mist", "Dread", "Swamp", "Veil"],
    "Toxic Wastes": ["Sludge", "Rust", "Acid", "Wastes", "Pit"],
    "Haunted Chapel": ["Altar", "Pews", "Sanctum", "Nave", "Vault"],
    "Obsidian Spire": ["Peak", "Shaft", "Core", "Spire", "Edge"],
    "Quadar Tower": ["Corridor", "Nexus", "Store Room", "Bunker", "Market"],
    "Military Installation": ["Barracks", "Armory", "Terminal", "Hangar", "Command"],
    "Eldritch Fortress": ["Bastion", "Stronghold", "Tower", "Gate", "Keep"],
    "Labyrinthine Dungeon": ["Maze", "Passage", "Cell", "Catacomb", "Oubliette"],
    "Chromatic-Steel Fungi": ["Pillar", "Spire", "Growth", "Canopy", "Nexus"],
    "Chthonic Depths": ["Labyrinth", "Chamber", "Tunnel", "Grotto", "Crypt"],
    "Static Sea of All Noise": ["Drift", "Shore", "Current", "Eddy", "Reef"],
    "Twilight Alchemy Haven": ["Cauldron", "Still", "Garden", "Hearth", "Sanctum"],
    "Abyss of Infernal Lore": ["Throat", "Maw", "Conduit", "Altar", "Shrine"],
    "Precipice of the Shadowlands": ["Edge", "Brink", "Threshold", "Border", "Gate"],
    "Rune Temples": ["Sanctum", "Altar", "Nave", "Crypt", "Shrine"],
    "Crumbling Ruins": ["Vault", "Hulk", "Spire", "Bastion", "Keep"],
    "Dimensional Nexus": ["Gate", "Vortex", "Conduit", "Threshold", "Fold"],
    "Cavernous Abyss": ["Chasm", "Maw", "Hollow", "Pit", "Depth"],
    "The Sterile Chamber": ["Theater", "Table", "Sanctum", "Vault", "Archives"],
} as const;

const BIOME_DESCRIPTIONS: Readonly<Record<Biome, string>> = {
    "Ethereal Marshlands": "The air is thick with malevolence, and the murky waters echo with alien wails.",
    "Toxic Wastes": "A ghastly mire of desolation, oozing with ichorous sludge and corrosive maladies.",
    "Haunted Chapel": "Abandoned and hopeless, these derelict edifices are steeped in the corrupt embrace of arcane powers.",
    "Obsidian Spire": "Sharp peaks of volcanic glass pierce the gloom, humming with latent energy.",
    "Quadar Tower": "The central monolith of the realm, where reality itself seems to warp and decay.",
    "Military Installation": "Relics of a bygone era entwine with industrial machinations and complex alien tech.",
    "Eldritch Fortress": "Imposing structures of supernatural evil, eternally veiled in hatred and forbidden energies.",
    "Labyrinthine Dungeon": "Convoluted mazes of winding corridors, illuminated by sickly, pallid lights.",
    "Chromatic-Steel Fungi": "Colossal pillars of chromatic-steel rise like organic growth in cyberspace; neon reflections play upon shifting surfaces.",
    "Chthonic Depths": "Subterranean labyrinths where echoes of forgotten whispers reverberate through ancient tunnels. Luminescent fungi illuminate the path.",
    "Static Sea of All Noise": "A decaying land gripped by the enigmatic static. The very air hums with cosmic interference.",
    "Twilight Alchemy Haven": "Verses of prose generate gnarled trees; holographic projections bathe the surroundings in an ethereal fusion of lore and twilight.",
    "Abyss of Infernal Lore": "Conjured flames lick obsidian pillars. An intricate weave of cloned souls writhes along the data streams.",
    "Precipice of the Shadowlands": "The boundaries between the known and the unknown blur. The horizon is an ever-shifting tapestry of twilight and dawn.",
    "Rune Temples": "Ancient structures decorated with arcane symbols and mystical runes. The ambient glow casts shadowy tendrils that writhe in unearthly pollution.",
    "Crumbling Ruins": "Forsaken remnants of erstwhile splendor. Decaying edifices bear witness to manifold demise. Power-laden artifacts and lore fragments may yet linger.",
    "Dimensional Nexus": "A surreal sphere where reality is distorted and spatial anomalies abound. Platforms float in the void; pathways defy conventional physics.",
    "Cavernous Abyss": "A subterranean network of twisting tunnels and sprawling caverns. Jagged rocks, pulsating lava pools, and the constant echo of distant rumblings.",
    "The Sterile Chamber": "An operating table inscribed with ancient sigils pulsates in eerie half-light. Incisions pierce the veil between worlds; specters emerge from fissures. Entities ageless and vast scrutinize from beyond.",
} as const;

/** Biomes with elevated danger — higher enemy/hazard spawn rates. */
const DEEP_BIOMES: readonly Biome[] = [
    "Chthonic Depths", "Cavernous Abyss", "Abyss of Infernal Lore",
    "Dimensional Nexus", "Static Sea of All Noise", "Twilight Alchemy Haven",
    "Precipice of the Shadowlands", "Chromatic-Steel Fungi", "The Sterile Chamber",
    "Labyrinthine Dungeon", "Eldritch Fortress"
] as const;

// --- Pure helpers ---

const pickFrom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const dangerFactorFor = (biome: Biome): number => DEEP_BIOMES.includes(biome) ? 1.25 : 1;

const generateExits = () => ({
    North: Math.random() > 0.3 ? "new-room" as const : null,
    South: Math.random() > 0.3 ? "new-room" as const : null,
    East: Math.random() > 0.3 ? "new-room" as const : null,
    West: Math.random() > 0.3 ? "new-room" as const : null,
});

const generateEnemies = (dangerFactor: number): Enemy[] => {
    const threshold = 70 / dangerFactor;
    return Math.random() * 100 > threshold ? [generateRandomEnemy()] : [];
};

const generateMerchants = (p1: string, biome: Biome): { merchants: Merchant[]; isMarketplace: boolean } => {
    if (p1.includes("Market") && Math.random() < 0.90) {
        return { merchants: generateMarketplace(biome), isMarketplace: true };
    }
    const merchantChance = (p1.includes("Store") || p1.includes("Shop")) ? 0.60 : 0.15;
    return Math.random() < merchantChance
        ? { merchants: [generateRandomMerchant(biome)], isMarketplace: false }
        : { merchants: [], isMarketplace: false };
};

// --- Public API ---

export const generateRoom = (id?: string, biomeOverride?: Biome, context?: RoomGenContext | null): Room => {
    const biome = biomeOverride ?? selectNextBiome(context);
    const parts = BIOME_NAME_PARTS[biome];
    const p1 = pickFrom(parts);
    const p2 = pickFrom(parts);
    const dangerFactor = dangerFactorFor(biome);
    const { merchants, isMarketplace } = generateMerchants(p1, biome);
    const hazardThreshold = 20 * dangerFactor;

    return {
        id: id || Math.random().toString(36).substring(7),
        title: `${p1} ${p2}`,
        description: BIOME_DESCRIPTIONS[biome] || "You stand in a strange, uncharted area.",
        biome,
        hazards: Math.random() * 100 < hazardThreshold ? ["Toxic Air"] : [],
        exits: generateExits(),
        enemies: generateEnemies(dangerFactor),
        merchants,
        groundLoot: generateGroundLoot(biome),
        isMarketplace,
    };
};

export interface GenerateRoomOptions {
    forceMerchant?: boolean;
    /** Context for story-coherent biome progression. */
    context?: RoomGenContext | null;
}

export const generateRoomWithOptions = (id?: string, biomeOverride?: Biome, options?: GenerateRoomOptions): Room => {
    const room = generateRoom(id, biomeOverride, options?.context);
    if (options?.forceMerchant && (!room.merchants || room.merchants.length === 0)) {
        const merchantTypes = ["Scavenger", "Nomad", "Tech-Trader", "Mystic", "Mercenary Captain"] as const;
        const type = pickFrom(merchantTypes);
        return {
            ...room,
            merchants: [{
                id: Math.random().toString(36).substring(7),
                name: `${type} ${Math.floor(Math.random() * 100)}`,
                description: "A wandering soul with goods to trade.",
                wares: generateWares(room.biome, type)
            }]
        };
    }
    return room;
};

export interface GenerateStartRoomOptions {
    id?: string;
    biome?: Biome;
    deterministic?: boolean;
    forceMerchant?: boolean;
    forceEnemy?: boolean;
}

const BASE_CAMP_FEATURES = [
    { type: "farming_plot" as const, crop: "mushroom", progress: 0, ready: false },
    { type: "crafting_station" as const, kind: "smithing" },
    { type: "crafting_station" as const, kind: "alchemy" }
] as const;

const createBaseCampRoom = (id: string, biome: Biome): Room => ({
    id,
    title: "Recon Base Camp // STORE ROOM",
    description: "A secure perimeter established within the ruins. A small hydroponic plot glows with UV light, and a makeshift workbench sits ready.",
    biome,
    hazards: [],
    exits: { North: "new-room", South: "new-room", East: "new-room", West: "new-room" },
    enemies: [],
    merchants: [],
    isBaseCamp: true,
    features: [...BASE_CAMP_FEATURES],
});

const applyForcedEnemy = (room: Room, forceEnemy: boolean | string): Room => {
    if (!forceEnemy) return room;
    const enemies = typeof forceEnemy === 'string' && ENEMY_TEMPLATES[forceEnemy]
        ? [{
            id: Math.random().toString(36).substring(7),
            name: forceEnemy,
            ...ENEMY_TEMPLATES[forceEnemy],
            hp: ENEMY_TEMPLATES[forceEnemy].maxHp || 10,
            maxStress: 100,
            stress: 0,
            activeEffects: []
        } as Enemy]
        : [generateRandomEnemy()];
    return { ...room, enemies, isBaseCamp: false };
};

export const generateStartRoom = (opts?: GenerateStartRoomOptions): Room => {
    const roomId = opts?.id ?? "start_room";
    const biome = opts?.biome ?? "Quadar Tower";

    if (opts?.deterministic) {
        const base = createBaseCampRoom(roomId, biome);
        const withMerchant = opts.forceMerchant
            ? { ...base, merchants: [generateRandomMerchant(biome, "Mercenary Captain")] }
            : base;
        return opts.forceEnemy ? applyForcedEnemy(withMerchant, opts.forceEnemy) : withMerchant;
    }

    const room = generateRoomWithOptions(roomId, biome, { forceMerchant: opts?.forceMerchant });

    if (!opts?.forceEnemy) {
        return {
            ...room,
            title: "Recon Base Camp",
            description: "A secure perimeter established within the ruins. A small hydroponic plot glows with UV light, and a makeshift workbench sits ready.",
            enemies: [],
            isBaseCamp: true,
            features: [...BASE_CAMP_FEATURES],
        };
    }

    return {
        ...room,
        title: "Recon Base Camp",
        description: "A secure perimeter established within the ruins. A small hydroponic plot glows with UV light, and a makeshift workbench sits ready.",
        enemies: room.enemies.length > 0 ? room.enemies : [generateRandomEnemy()],
    };
};
