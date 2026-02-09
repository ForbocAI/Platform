
import { Room, Biome, Enemy, Player, LoomResult } from "./types";
import { UNEXPECTEDLY_TABLE, CLASS_TEMPLATES } from "./mechanics";

const BIOMES: Biome[] = ["Ethereal Marshlands", "Toxic Wastes", "Haunted Chapel", "Obsidian Spire"];

const ENEMY_TEMPLATES: Record<string, Partial<Enemy>> = {
    "Obsidian Warden": {
        characterClass: "Obsidian Warden",
        ac: 15,
        Str: 16, Agi: 10, Arcane: 5,
        description: "A tower of black glass and malice.",
        maxHp: 50,
        spells: ["obsidian_surge"]
    },
    "Doomguard": {
        characterClass: "Doomguard",
        ac: 14,
        Str: 14, Agi: 14, Arcane: 0,
        description: "A shell of armor powered by sheer hate.",
        maxHp: 40,
        spells: ["hellfire_explosion"]
    },
    "Ashwalker Renegade": {
        characterClass: "Ashwalker",
        ac: 12,
        Str: 12, Agi: 14, Arcane: 8,
        description: "A fallen ranger turned to madness.",
        maxHp: 30,
        spells: ["ember_dash"]
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
    const nameParts = {
        "Ethereal Marshlands": ["Ghost", "Mist", "Dread", "Swamp", "Veil"],
        "Toxic Wastes": ["Sludge", "Rust", "Acid", "Wastes", "Pit"],
        "Haunted Chapel": ["Altar", "Pews", "Sanctum", "Nave", "Vault"],
        "Obsidian Spire": ["Peak", "Shaft", "Core", "Spire", "Edge"],
        "Quadar Tower": ["Corridor", "Nexus", "Store Room", "Bunker", "Market"]
    };

    const p1 = nameParts[biome]?.[Math.floor(Math.random() * nameParts[biome]?.length)] || "Unknown";
    const p2 = nameParts[biome]?.[Math.floor(Math.random() * nameParts[biome]?.length)] || "Area";

    const enemies: Enemy[] = [];
    const roll = Math.random() * 100;
    if (roll > 70) {
        const enemyName = Object.keys(ENEMY_TEMPLATES)[Math.floor(Math.random() * Object.keys(ENEMY_TEMPLATES).length)];
        const template = ENEMY_TEMPLATES[enemyName];
        enemies.push({
            id: Math.random().toString(36).substring(7),
            name: enemyName,
            ...template,
            hp: template.maxHp || 10,
            maxStress: 100, // default
            stress: 0 // default
        } as Enemy);
    }

    return {
        id: id || Math.random().toString(36).substring(7),
        title: `${p1} ${p2}`,
        description: `You stand within the ${biome}. The air is heavy with ${biome === "Toxic Wastes" ? "metallic stench" : "whispers of the dead"}.`,
        biome,
        hazards: roll < 20 ? ["Toxic Air"] : [],
        exits: {
            North: Math.random() > 0.3 ? "new-room" : null,
            South: Math.random() > 0.3 ? "new-room" : null,
            East: Math.random() > 0.3 ? "new-room" : null,
            West: Math.random() > 0.3 ? "new-room" : null,
        },
        enemies,
    };
}

export interface GenerateStartRoomOptions {
    id?: string;
    biome?: Biome;
    deterministic?: boolean;
}

export function generateStartRoom(opts?: GenerateStartRoomOptions): Room {
    return generateRoom(opts?.id ?? "start_room", opts?.biome ?? "Quadar Tower");
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
