import type { Area, Biome, AgentNPC, Vendor } from "../types";
import { selectNextBiome, generateGroundLoot, generateRandomAgentNPC, NPC_TEMPLATES, type AreaGenContext } from "../generation";
import { generateRandomVendor, generateMarketplace, generateWares } from "./vendor";

// --- Immutable area-name data tables ---

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

/** Biomes with elevated danger — higher NPC/hazard spawn rates. */
const DEEP_BIOMES: readonly Biome[] = [
    "Chthonic Depths", "Cavernous Abyss", "Abyss of Infernal Lore",
    "Dimensional Nexus", "Static Sea of All Noise", "Twilight Alchemy Haven",
    "Precipice of the Shadowlands", "Chromatic-Steel Fungi", "The Sterile Chamber",
    "Labyrinthine Dungeon", "Eldritch Fortress"
] as const;

const BIOME_TO_REGIONAL: Record<Biome, string> = {
    "Ethereal Marshlands": "Marshlands",
    "Toxic Wastes": "Toxic Wastes",
    "Haunted Chapel": "Chapel",
    "Obsidian Spire": "Spire",
    "Quadar Tower": "Tower",
    "Military Installation": "Installation",
    "Eldritch Fortress": "Fortress",
    "Labyrinthine Dungeon": "Dungeon",
    "Chromatic-Steel Fungi": "Metal Fungi",
    "Chthonic Depths": "Depths",
    "Static Sea of All Noise": "Static Sea",
    "Twilight Alchemy Haven": "Alchemy Haven",
    "Abyss of Infernal Lore": "Lore Abyss",
    "Precipice of the Shadowlands": "Shadowlands",
    "Rune Temples": "Temple",
    "Crumbling Ruins": "Ruins",
    "Dimensional Nexus": "Nexus",
    "Cavernous Abyss": "Abyss",
    "The Sterile Chamber": "Chamber",
};

const pickFrom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const dangerFactorFor = (biome: Biome): number => DEEP_BIOMES.includes(biome) ? 1.25 : 1;

const generateExits = () => ({
    North: Math.random() > 0.3 ? "new-area" as const : null,
    South: Math.random() > 0.3 ? "new-area" as const : null,
    East: Math.random() > 0.3 ? "new-area" as const : null,
    West: Math.random() > 0.3 ? "new-area" as const : null,
});

const generateNPCs = (dangerFactor: number): AgentNPC[] => {
    const threshold = 70 / dangerFactor;
    return Math.random() * 100 > threshold ? [generateRandomAgentNPC()] : [];
};

const generateVendors = (p1: string, biome: Biome): { vendors: Vendor[]; isMarketplace: boolean } => {
    if (p1.includes("Market") && Math.random() < 0.90) {
        return { vendors: generateMarketplace(biome), isMarketplace: true };
    }
    const vendorChance = (p1.includes("Store") || p1.includes("Shop")) ? 0.60 : 0.15;
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
        hazards: Math.random() * 100 < hazardThreshold ? ["Anomalous Flux"] : [],
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
            vendors: [{
                id: Math.random().toString(36).substring(7),
                name: `${type} ${Math.floor(Math.random() * 100)}`,
                description: "A wandering soul with items to trade.",
                wares: generateWares(area.biome, type)
            }]
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

const createBaseCampArea = (id: string, biome: Biome): Area => ({
    id,
    title: "Secure Operations Base",
    description: "A hardened perimeter established within the structure. A localized resource plot hums with energy, and a tactical workbench sits ready.",
    biome,
    regionalType: "Operations Base",
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
        ? [{
            id: Math.random().toString(36).substring(7),
            name: forceNPC,
            ...NPC_TEMPLATES[forceNPC],
            hp: NPC_TEMPLATES[forceNPC].maxHp || 10,
            maxStress: 100,
            stress: 0,
            activeEffects: []
        } as AgentNPC]
        : [generateRandomAgentNPC()];
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
            title: "Secure Operations Base",
            description: "A hardened perimeter established within the structure. A localized resource plot hums with energy, and a tactical workbench sits ready.",
            npcs: [],
            isBaseCamp: true,
            features: [...BASE_CAMP_FEATURES],
        };
    }

    return {
        ...area,
        title: "Initial Ingress Point",
        description: "A hardened perimeter established within the structure. A localized resource plot hums with energy, and a tactical workbench sits ready.",
        npcs: area.npcs.length > 0 ? area.npcs : [generateRandomAgentNPC()],
    };
};
