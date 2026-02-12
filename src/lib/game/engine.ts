import { Room, Biome, Enemy, Player, Merchant, Item } from "./types";
import { CLASS_TEMPLATES, ITEMS, MATERIALS } from "./mechanics";
import { selectNextBiome, generateGroundLoot, generateRandomEnemy, BIOME_GROUND_LOOT, type RoomGenContext } from "./generation";
import { getEnemyLoot } from "./generation/loot";
export type { RoomGenContext } from "./generation";
export { getEnemyLoot } from "./generation/loot";
export { generateRandomEnemy } from "./generation";
export { consultOracle } from "./oracle";

export function initializePlayer(): Player {
    // Defines the "Starting Initiation" - Level 12 Ranger/Rogue (Ashwalker)
    const template = CLASS_TEMPLATES["Ashwalker"];
    return {
        id: "player_1",
        name: "Kamenal",
        level: 12,
        characterClass: "Ashwalker",
        ...template.baseStats,
        hp: template.baseStats.maxHp,
        stress: 0,
        inventory: [
            { id: "rogue_blade", name: "Rogue's Blade", type: "weapon", description: "Standard issue shortsword.", cost: { spirit: 5 } },
            { id: "scout_garb", name: "Scout Garb", type: "armor", description: "Light leather armor.", cost: { spirit: 5 } },
            { id: "relic_shard", name: "Relic Shard", type: "relic", description: "A buzzing shard of old tech.", cost: { spirit: 10 } }
        ],
        spells: template.startingSpells,
        surgeCount: 0,
        spirit: 20,
        blood: 0,
        xp: 0,
        maxXp: 1200, // Level 12 * 100
        recipes: [
            {
                id: "recipe_minor_healing_potion",
                ingredients: [{ name: "Glowing Mushroom", quantity: 2 }],
                produces: {
                    id: "minor_healing_potion_crafted",
                    name: "Minor Healing Potion",
                    type: "consumable",
                    description: "A small vial of healing liquid.",
                    effect: "heal_hp_20",
                    cost: { spirit: 5 }
                }
            },
            {
                id: "recipe_improved_armor",
                ingredients: [{ name: "Scrap Metal", quantity: 3 }, { name: "Leather Scraps", quantity: 2 }],
                produces: {
                    id: "improved_armor_crafted",
                    name: "Reinforced Plating",
                    type: "armor",
                    description: "Sturdy armor reinforced with metal plates.",
                    bonus: { ac: 2, maxHp: 10 },
                    cost: { spirit: 20 }
                }
            }
        ]
    };
}

export function generateRandomMerchant(biome?: Biome, forcedType?: string): Merchant {
    const merchantTypes = ["Scavenger", "Nomad", "Tech-Trader", "Mystic", "Mercenary Captain"];
    const type = forcedType ?? merchantTypes[Math.floor(Math.random() * merchantTypes.length)];
    const wares = generateWares(biome, type);
    return {
        id: Math.random().toString(36).substring(7),
        name: type === "Mercenary Captain" ? `Captain ${Math.floor(Math.random() * 100)}` : `${type} ${Math.floor(Math.random() * 100)}`,
        description: type === "Mercenary Captain" ? "A battle-hardened veteran looking for clients." : "A wandering soul with goods to trade.",
        wares: wares
    };
}

export function generateRoom(id?: string, biomeOverride?: Biome, context?: RoomGenContext | null): Room {
    const biome = biomeOverride ?? selectNextBiome(context);
    const nameParts: Record<Biome, string[]> = {
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
    };

    const p1 = nameParts[biome][Math.floor(Math.random() * nameParts[biome].length)];
    const p2 = nameParts[biome][Math.floor(Math.random() * nameParts[biome].length)];

    const biomeDescriptions: Record<Biome, string> = {
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
    };

    const description = biomeDescriptions[biome] || "You stand in a strange, uncharted area.";

    // Deeper biomes: higher enemy and hazard chance (story coherence)
    const deepBiomes: Biome[] = ["Chthonic Depths", "Cavernous Abyss", "Abyss of Infernal Lore", "Dimensional Nexus", "Static Sea of All Noise", "Twilight Alchemy Haven", "Precipice of the Shadowlands", "Chromatic-Steel Fungi", "The Sterile Chamber", "Labyrinthine Dungeon", "Eldritch Fortress"];
    const dangerFactor = deepBiomes.includes(biome) ? 1.25 : 1;

    const enemies: Enemy[] = [];
    const roll = Math.random() * 100;
    const enemyThreshold = 70 / dangerFactor; // Deeper: enemy at roll > 56 instead of 70
    if (roll > enemyThreshold) {
        enemies.push(generateRandomEnemy());
    }

    const merchants: Merchant[] = [];
    let merchantChance = 0.15;

    if (p1.includes("Market")) {
        // Bustling marketplace area
        if (Math.random() < 0.90) {
            const count = Math.floor(Math.random() * 3) + 2; // 2-4 merchants
            for (let i = 0; i < count; i++) {
                merchants.push(generateRandomMerchant(biome));
            }
        }
    } else if (p1.includes("Store") || p1.includes("Shop")) {
        merchantChance = 0.60;
        if (Math.random() < merchantChance) {
            merchants.push(generateRandomMerchant(biome));
        }
    } else {
        if (Math.random() < merchantChance) {
            merchants.push(generateRandomMerchant(biome));
        }
    }

    const hazardThreshold = 20 * dangerFactor; // Deeper: hazards at roll < 25 instead of 20
    const hazardRoll = Math.random() * 100;

    const groundLoot = generateGroundLoot(biome);

    return {
        id: id || Math.random().toString(36).substring(7),
        title: `${p1} ${p2}`,
        description,
        biome,
        hazards: hazardRoll < hazardThreshold ? ["Toxic Air"] : [],
        exits: {
            North: Math.random() > 0.3 ? "new-room" : null,
            South: Math.random() > 0.3 ? "new-room" : null,
            East: Math.random() > 0.3 ? "new-room" : null,
            West: Math.random() > 0.3 ? "new-room" : null,
        },
        enemies,
        merchants,
        groundLoot,
    };
}

export interface GenerateRoomOptions {
    forceMerchant?: boolean;
    /** Context for story-coherent biome progression (previous room, direction, etc.). */
    context?: RoomGenContext | null;
}

export function generateRoomWithOptions(id?: string, biomeOverride?: Biome, options?: GenerateRoomOptions): Room {
    const room = generateRoom(id, biomeOverride, options?.context);
    if (options?.forceMerchant && (!room.merchants || room.merchants.length === 0)) {
        const merchantTypes = ["Scavenger", "Nomad", "Tech-Trader", "Mystic", "Mercenary Captain"];
        const type = merchantTypes[Math.floor(Math.random() * merchantTypes.length)];
        const wares = generateWares(room.biome, type);
        room.merchants = [{
            id: Math.random().toString(36).substring(7),
            name: `${type} ${Math.floor(Math.random() * 100)}`,
            description: "A wandering soul with goods to trade.",
            wares
        }];
    }
    return room;
}

function generateWares(biome?: Biome, merchantType?: string): Item[] {
    const wares: Item[] = [];

    // Contracts for Mercenary Captain
    if (merchantType === "Mercenary Captain" || Math.random() < 0.1) {
        const contracts = ITEMS.filter(i => i.type === "contract");
        if (contracts.length > 0) {
            const contract = contracts[Math.floor(Math.random() * contracts.length)];
            wares.push({ ...contract, id: `${contract.id}_${Math.random().toString(36).substring(7)}` });
        }
    }

    const numGear = Math.floor(Math.random() * 2) + 2; // 2-3 gear items
    for (let i = 0; i < numGear; i++) {
        const randomItem = ITEMS.filter(i => i.type !== "contract")[Math.floor(Math.random() * ITEMS.filter(i => i.type !== "contract").length)];
        wares.push({ ...randomItem, id: `${randomItem.id}_${Math.random().toString(36).substring(7)}` });
    }
    const numMaterials = Math.floor(Math.random() * 3) + 1; // 1-3 material items
    const materialPool = biome && BIOME_GROUND_LOOT[biome]
        ? BIOME_GROUND_LOOT[biome]!.map((e) => MATERIALS.find((m) => m.id === e.materialId)).filter((m): m is Item => !!m)
        : MATERIALS;
    const pool = materialPool.length > 0 ? materialPool : MATERIALS;
    for (let i = 0; i < numMaterials; i++) {
        const mat = pool[Math.floor(Math.random() * pool.length)];
        if (mat) wares.push({ ...mat, id: `${mat.id}_${Math.random().toString(36).substring(7)}` });
    }
    return wares;
}

export interface GenerateStartRoomOptions {
    id?: string;
    biome?: Biome;
    deterministic?: boolean;
    forceMerchant?: boolean;
    forceEnemy?: boolean;
}

export function generateStartRoom(opts?: GenerateStartRoomOptions): Room {
    if (opts?.deterministic) {
        const room: Room = {
            id: opts.id ?? "start_room",
            title: "Recon Base Camp // STORE ROOM",
            description: "A secure perimeter established within the ruins. A small hydroponic plot glows with UV light, and a makeshift workbench sits ready.",
            biome: opts.biome ?? "Quadar Tower",
            hazards: [],
            exits: { North: "new-room", South: "new-room", East: "new-room", West: "new-room" },
            enemies: [], // Base camp is safe
            merchants: [],
            isBaseCamp: true,
            features: [
                { type: "farming_plot", crop: "mushroom", progress: 0, ready: false },
                { type: "crafting_station", kind: "smithing" },
                { type: "crafting_station", kind: "alchemy" }
            ]
        };
        if (opts.forceMerchant) {
            // Force Mercenary Captain for reliable automation of Servitor Hiring
            room.merchants = [generateRandomMerchant(room.biome, "Mercenary Captain")];
        }
        // Force enemy even if protected if explicitly requested by playtest param (e.g. unit tests)
        if (opts.forceEnemy) {
            room.enemies = [generateRandomEnemy()];
            room.isBaseCamp = false; // Corrupted base
        }
        return room;
    }
    const room = generateRoomWithOptions(opts?.id ?? "start_room", opts?.biome ?? "Quadar Tower", { forceMerchant: opts?.forceMerchant });
    // Override random room to make it Base Camp unless enemy forced
    room.title = "Recon Base Camp";
    room.description = "A secure perimeter established within the ruins. A small hydroponic plot glows with UV light, and a makeshift workbench sits ready.";
    if (!opts?.forceEnemy) {
        room.enemies = [];
        room.isBaseCamp = true;
        room.features = [
            { type: "farming_plot", crop: "mushroom", progress: 0, ready: false },
            { type: "crafting_station", kind: "smithing" },
            { type: "crafting_station", kind: "alchemy" }
        ];
    } else {
        // Just add an enemy if forced
        if (!room.enemies || room.enemies.length === 0) {
            room.enemies = [generateRandomEnemy()];
        }
    }
    return room;
}

