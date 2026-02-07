import { Room, Biome, Enemy, Direction } from "./types";

const BIOMES: Biome[] = ["Ethereal Marshlands", "Toxic Wastes", "Haunted Chapel", "Obsidian Spire"];

const ENEMY_TEMPLATES: Record<string, Partial<Enemy>> = {
    "Obsidian Warden": {
        maxHp: 50,
        ac: 15,
        Str: 16,
        Agi: 10,
        Arcane: 5,
        description: "A tower of black glass and malice.",
    },
    "Doomguard": {
        maxHp: 40,
        ac: 14,
        Str: 14,
        Agi: 14,
        Arcane: 0,
        description: "A shell of armor powered by sheer hate.",
    },
    "Cyberflux Guardian": {
        maxHp: 30,
        ac: 12,
        Str: 10,
        Agi: 18,
        Arcane: 15,
        description: "A distortion in the air, crackling with digitizing energy.",
    }
};

export function generateRoom(id?: string, biomeOverride?: Biome): Room {
    const biome = biomeOverride || BIOMES[Math.floor(Math.random() * BIOMES.length)];
    const nameParts = {
        "Ethereal Marshlands": ["Ghost", "Mist", "Dread", "Swamp", "Veil"],
        "Toxic Wastes": ["Sludge", "Rust", "Acid", "Wastes", "Pit"],
        "Haunted Chapel": ["Altar", "Pews", "Sanctum", "Nave", "Vault"],
        "Obsidian Spire": ["Peak", "Shaft", "Core", "Spire", "Edge"]
    };

    const p1 = nameParts[biome][Math.floor(Math.random() * nameParts[biome].length)];
    const p2 = nameParts[biome][Math.floor(Math.random() * nameParts[biome].length)];

    const enemies: Enemy[] = [];
    const roll = Math.random() * 100;
    if (roll > 70) {
        const enemyName = Object.keys(ENEMY_TEMPLATES)[Math.floor(Math.random() * Object.keys(ENEMY_TEMPLATES).length)];
        const template = ENEMY_TEMPLATES[enemyName];
        enemies.push({
            id: Math.random().toString(36).substring(7),
            name: enemyName,
            hp: template.maxHp!,
            ...template,
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
