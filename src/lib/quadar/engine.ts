
import { Room, Biome, Enemy, Player, LoomResult, Merchant, Item } from "./types";
import { UNEXPECTEDLY_TABLE, CLASS_TEMPLATES, ITEMS } from "./mechanics";

const BIOMES: Biome[] = [
    "Ethereal Marshlands",
    "Toxic Wastes",
    "Haunted Chapel",
    "Obsidian Spire",
    "Quadar Tower",
    "Military Installation",
    "Eldritch Fortress",
    "Labyrinthine Dungeon"
];

const ENEMY_TEMPLATES: Record<string, Partial<Enemy>> = {
    "Obsidian Warden": {
        characterClass: "Obsidian Warden",
        ac: 15, Str: 18, Agi: 8, Arcane: 10,
        description: "A tower of black glass and malice.",
        maxHp: 60, spells: ["obsidian_surge", "death_shard_strike"]
    },
    "Doomguard": {
        characterClass: "Doomguard",
        ac: 14, Str: 16, Agi: 10, Arcane: 5,
        description: "A shell of armor powered by sheer hate.",
        maxHp: 50, spells: ["hellfire_explosion", "dreadful_charge"]
    },
    "Ashwalker Renegade": {
        characterClass: "Ashwalker",
        ac: 13, Str: 12, Agi: 16, Arcane: 14,
        description: "A fallen ranger turned to madness.",
        maxHp: 40, spells: ["ember_dash", "relic_strike"]
    },
    "Iron Armored Guardian": {
        characterClass: "Iron Armored Guardian",
        ac: 16, Str: 17, Agi: 9, Arcane: 8,
        description: "Heavily armored medieval swordfest knight.",
        maxHp: 55, spells: ["ironclad_charge", "steel_shield_block"]
    },
    "Aether Spirit": {
        characterClass: "Aether Spirit",
        ac: 12, Str: 8, Agi: 15, Arcane: 18,
        description: "A fleeting form of shimmering angles.",
        maxHp: 35, spells: ["ethereal_phasing", "astral_bolt"]
    },
    "Thunder Trooper": {
        characterClass: "Thunder Trooper",
        ac: 13, Str: 13, Agi: 13, Arcane: 10,
        description: "A raining commando with a love of carnage.",
        maxHp: 45, spells: ["shotgun_barrage", "grenade_assault"]
    },
    "Storm Titan": {
        characterClass: "Storm Titan",
        ac: 18, Str: 20, Agi: 10, Arcane: 18,
        description: "A hulking creature with quantum electric attacks.",
        maxHp: 120, spells: ["electrical_charge", "thunderous_slam"]
    },
    "Flame Corps Brute": {
        characterClass: "Flame Corps",
        ac: 14, Str: 15, Agi: 11, Arcane: 14,
        description: "A large, brutish phallic creature with a grenade launcher.",
        maxHp: 65, spells: ["napalm_grenade", "inferno_overdrive"]
    },
    "Gravewalker": {
        characterClass: "Gravewalker",
        ac: 11, Str: 16, Agi: 8, Arcane: 12,
        description: "A reanimated corpse, a dead wandering.",
        maxHp: 70, spells: []
    },
    "Shadowhorn Juggernaut": {
        characterClass: "Shadowhorn Juggernaut",
        ac: 14, Str: 16, Agi: 17, Arcane: 10,
        description: "An agile, horned creature with powerful melee attacks.",
        maxHp: 60, spells: []
    },
    "Magma Leviathan": {
        characterClass: "Magma Leviathan",
        ac: 20, Str: 22, Agi: 8, Arcane: 16,
        description: "A huge, massive lava creature from the core.",
        maxHp: 200, spells: []
    }
};

export function initializePlayer(): Player {
    // Defines the "Starting Initiation" - Level 12 Ranger/Rogue (Ashwalker)
    const template = CLASS_TEMPLATES["Ashwalker"];
    return {
        id: "player_1",
        name: "Kamenal", // The chronicler mentioned in docs
        level: 12,
        characterClass: "Ashwalker",
        ...template.baseStats,
        hp: template.baseStats.maxHp,
        stress: 0,
        inventory: [
            { id: "rogue_blade", name: "Rogue's Blade", type: "weapon", description: "Standard issue shortsword." },
            { id: "scout_garb", name: "Scout Garb", type: "armor", description: "Light leather armor." },
            { id: "relic_shard", name: "Relic Shard", type: "relic", description: "A buzzing shard of old tech." }
        ],
        spells: template.startingSpells,
        surgeCount: 0,
        spirit: 20,
        blood: 0
    };
}

export function generateRoom(id?: string, biomeOverride?: Biome): Room {
    const biome = biomeOverride || BIOMES[Math.floor(Math.random() * BIOMES.length)];
    const nameParts: Record<Biome, string[]> = {
        "Ethereal Marshlands": ["Ghost", "Mist", "Dread", "Swamp", "Veil"],
        "Toxic Wastes": ["Sludge", "Rust", "Acid", "Wastes", "Pit"],
        "Haunted Chapel": ["Altar", "Pews", "Sanctum", "Nave", "Vault"],
        "Obsidian Spire": ["Peak", "Shaft", "Core", "Spire", "Edge"],
        "Quadar Tower": ["Corridor", "Nexus", "Store Room", "Bunker", "Market"],
        "Military Installation": ["Barracks", "Armory", "Terminal", "Hangar", "Command"],
        "Eldritch Fortress": ["Bastion", "Stronghold", "Tower", "Gate", "Keep"],
        "Labyrinthine Dungeon": ["Maze", "Passage", "Cell", "Catacomb", "Oubliette"]
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
        "Labyrinthine Dungeon": "Convoluted mazes of winding corridors, illuminated by sickly, pallid lights."
    };

    const description = biomeDescriptions[biome] || "You stand in a strange, uncharted area.";

    const enemies: Enemy[] = [];
    const roll = Math.random() * 100;
    if (roll > 70) {
        const enemyNames = Object.keys(ENEMY_TEMPLATES);
        const enemyName = enemyNames[Math.floor(Math.random() * enemyNames.length)];
        const template = ENEMY_TEMPLATES[enemyName];
        enemies.push({
            id: Math.random().toString(36).substring(7),
            name: enemyName,
            ...template,
            hp: template.maxHp || 10,
            maxStress: 100,
            stress: 0
        } as Enemy);
    }

    const merchants: Merchant[] = [];
    let merchantChance = 0.15;
    if (p1.includes("Market") || p1.includes("Store")) merchantChance = 0.60;

    if (Math.random() < merchantChance) {
        const merchantTypes = ["Scavenger", "Nomad", "Tech-Trader", "Mystic"];
        const type = merchantTypes[Math.floor(Math.random() * merchantTypes.length)];
        const wares = generateWares();
        merchants.push({
            id: Math.random().toString(36).substring(7),
            name: `${type} ${Math.floor(Math.random() * 100)}`,
            description: "A wandering soul with goods to trade.",
            wares
        });
    }

    return {
        id: id || Math.random().toString(36).substring(7),
        title: `${p1} ${p2}`,
        description,
        biome,
        hazards: roll < 20 ? ["Toxic Air"] : [],
        exits: {
            North: Math.random() > 0.3 ? "new-room" : null,
            South: Math.random() > 0.3 ? "new-room" : null,
            East: Math.random() > 0.3 ? "new-room" : null,
            West: Math.random() > 0.3 ? "new-room" : null,
        },
        enemies,
        merchants
    };
}

export function generateRoomWithOptions(id?: string, biomeOverride?: Biome, options?: { forceMerchant?: boolean }): Room {
    const room = generateRoom(id, biomeOverride);
    if (options?.forceMerchant && (!room.merchants || room.merchants.length === 0)) {
        const merchantTypes = ["Scavenger", "Nomad", "Tech-Trader", "Mystic"];
        const type = merchantTypes[Math.floor(Math.random() * merchantTypes.length)];
        const wares = generateWares();
        room.merchants = [{
            id: Math.random().toString(36).substring(7),
            name: `${type} ${Math.floor(Math.random() * 100)}`,
            description: "A wandering soul with goods to trade.",
            wares
        }];
    }
    return room;
}

function generateWares(): Item[] {
    const numItems = Math.floor(Math.random() * 3) + 3; // 3-5 items
    const wares: Item[] = [];
    for (let i = 0; i < numItems; i++) {
        const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        // Clone to avoid reference issues
        wares.push({ ...randomItem, id: `${randomItem.id}_${Math.random().toString(36).substring(7)}` });
    }
    return wares;
}

export interface GenerateStartRoomOptions {
    id?: string;
    biome?: Biome;
    deterministic?: boolean;
    forceMerchant?: boolean;
}

export function generateStartRoom(opts?: GenerateStartRoomOptions): Room {
    return generateRoomWithOptions(opts?.id ?? "start_room", opts?.biome ?? "Quadar Tower", { forceMerchant: opts?.forceMerchant });
}

// --- Loom of Fate Logic ---

export function consultLoom(question: string, currentSurgeCount: number): LoomResult {
    const d100 = Math.floor(Math.random() * 100) + 1;
    let modifiedRoll = d100;

    // Surge Logic: 
    // If d100 > 50, ADD surge.
    // If d100 <= 50, SUBTRACT surge.
    if (d100 > 50) {
        modifiedRoll += currentSurgeCount;
    } else {
        modifiedRoll -= currentSurgeCount;
    }

    // Clamp roll
    if (modifiedRoll < 1) modifiedRoll = 1;
    if (modifiedRoll > 100) modifiedRoll = 100;

    let resultString = "";
    let answer: "Yes" | "No";
    let qualifier: "and" | "but" | "unexpectedly" | undefined;
    let newSurge = 0; // The amount to UPDATE the current with or reset (if 0, implies reset? No, rules say "Add 2" or "Reset")

    // Table 1 Logic
    // Yes, and unexpectedly: 96-100+
    // Yes, but: 86-95
    // Yes, and: 81-85
    // Yes: 51-80
    // No: 21-50
    // No, and: 16-20
    // No, but: 6-15
    // No, and unexpectedly: 1-5 (and < 1)

    if (modifiedRoll >= 96) {
        answer = "Yes";
        qualifier = "unexpectedly";
        resultString = "Yes, and unexpectedly...";
    } else if (modifiedRoll >= 86) {
        answer = "Yes";
        qualifier = "but";
        resultString = "Yes, but...";
    } else if (modifiedRoll >= 81) {
        answer = "Yes";
        qualifier = "and";
        resultString = "Yes, and...";
    } else if (modifiedRoll >= 51) {
        answer = "Yes";
        resultString = "Yes.";
    } else if (modifiedRoll >= 21) {
        answer = "No";
        resultString = "No.";
    } else if (modifiedRoll >= 16) {
        answer = "No";
        qualifier = "and";
        resultString = "No, and...";
    } else if (modifiedRoll >= 6) {
        answer = "No";
        qualifier = "but";
        resultString = "No, but...";
    } else {
        answer = "No";
        qualifier = "unexpectedly";
        resultString = "No, and unexpectedly...";
    }

    let description = resultString;

    // Surge Update Rule:
    // "If the answer is anything other than plain 'yes' or 'no', reset the Surge Count."
    // "If the answer is just 'yes' or 'no', add another two (2) to the Surge Count."

    if (!qualifier) {
        // Plain Yes/No
        newSurge = 2; // Helper will need to handle this as "add 2"
    } else {
        // Qualifier exists (and, but, unexpectedly)
        newSurge = -1; // Helper will need to handle this as "reset to 0"
    }

    // Handle Unexpectedly Table
    if (qualifier === "unexpectedly") {
        const d20 = Math.floor(Math.random() * 20) + 1;
        const unexpectedEvent = UNEXPECTEDLY_TABLE[d20 - 1] || "Re-roll";
        description += ` [EVENT: ${unexpectedEvent}]`;
    }

    return {
        answer,
        qualifier,
        description,
        roll: modifiedRoll,
        surgeUpdate: newSurge
    };
}
