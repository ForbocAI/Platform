import { Room, Biome, Enemy, Player, LoomResult, StageOfScene, Npc, Merchant, Item } from "./types";
import { UNEXPECTEDLY_TABLE, CLASS_TEMPLATES } from "./mechanics";

const BIOMES: Biome[] = ["Ethereal Marshlands", "Toxic Wastes", "Haunted Chapel", "Obsidian Spire"];

// Table 1 ranges by Stage of Scene (Loom of Fate)
const LOOM_RANGES: Record<StageOfScene, { min: number; max: number }[]> = {
  "To Knowledge": [
    { min: 96, max: 100 }, { min: 86, max: 95 }, { min: 81, max: 85 }, { min: 51, max: 80 },
    { min: 21, max: 50 }, { min: 16, max: 20 }, { min: 6, max: 15 }, { min: 1, max: 5 },
  ],
  "To Conflict": [
    { min: 99, max: 100 }, { min: 95, max: 98 }, { min: 85, max: 94 }, { min: 51, max: 84 },
    { min: 17, max: 50 }, { min: 7, max: 16 }, { min: 3, max: 6 }, { min: 1, max: 2 },
  ],
  "To Endings": [
    { min: 100, max: 100 }, { min: 99, max: 99 }, { min: 81, max: 98 }, { min: 51, max: 80 },
    { min: 21, max: 50 }, { min: 3, max: 20 }, { min: 2, max: 2 }, { min: 1, max: 1 },
  ],
};

export const ENEMY_TEMPLATES: Record<string, Partial<Enemy>> = {
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

/** Level-1 max HP for deterministic playtest (ranger, basic equip). */
const LEVEL_1_MAX_HP = 24;

export interface InitializePlayerOptions {
    /** When true: ranger (Ashwalker), level 1, full health, basic equip, no progress flags — for reliable playtest automation. */
    deterministic?: boolean;
}

export function initializePlayer(opts?: InitializePlayerOptions): Player {
    const deterministic = opts?.deterministic ?? false;
    const template = CLASS_TEMPLATES["Ashwalker"];
    const maxHp = deterministic ? LEVEL_1_MAX_HP : template.baseStats.maxHp;
    const level = deterministic ? 1 : 12;
    return {
        id: "player_1",
        name: "Kamenal",
        level,
        characterClass: "Ashwalker",
        Str: template.baseStats.Str,
        Agi: template.baseStats.Agi,
        Arcane: template.baseStats.Arcane,
        maxHp,
        hp: maxHp,
        maxStress: template.baseStats.maxStress,
        stress: 0,
        ac: 14,
        inventory: [
            { id: "rogue_blade", name: "Rogue's Blade", type: "weapon", description: "Standard issue shortsword." },
            { id: "scout_garb", name: "Scout Garb", type: "armor", description: "Light leather armor." },
            { id: "relic_shard", name: "Relic Shard", type: "relic", description: "A buzzing shard of old tech." }
        ],
        spells: template.startingSpells,
        surgeCount: 0
    };
}

/** Fellow rangers / fresh recruits (Familiar: "Occasionally fresh recruits get sent here. Fellow rangers spawn."). */
const FELLOW_RANGER: Npc = {
  id: "fellow_ranger",
  name: "Fellow Ranger",
  description: "A fresh recruit drawn to the Tower. Reconnaissance objective.",
};

/** Wares that merchants can offer (quadar.md: nomadic traders, arcane, lost craftsmanship). */
const WARE_POOL: Omit<Item, "id">[] = [
  { name: "Void Shard", description: "A crystallized fragment of the abyss.", type: "relic" },
  { name: "Ember Salve", description: "Ashwalker remedy for burns and stress.", type: "consumable" },
  { name: "Obsidian Blade", description: "Shard-edged dagger from the Spire.", type: "weapon" },
  { name: "Chthonic Warding", description: "Amulet that deflects dark energies.", type: "relic" },
  { name: "Scout's Cloak", description: "Light cloak for stealth.", type: "armor" },
  { name: "Marsh Tonic", description: "Brew from Ethereal Marshlands herbs.", type: "consumable" },
  { name: "Rusted Key", description: "Ancient key, unknown lock.", type: "relic" },
  { name: "Doomsteel Gauntlet", description: "Heavy gauntlet from a fallen knight.", type: "armor" },
  { name: "Ghost Resin", description: "Sticky ethereal substance.", type: "consumable" },
  { name: "Spire Pick", description: "Climbing tool from Obsidian Spire.", type: "weapon" },
];

const MERCHANT_NAMES = ["Gloamstrider", "Twilightrider", "Emberogue"];

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function pickRandomWares(count: number): Item[] {
  const shuffled = [...WARE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((w) => ({ ...w, id: uniqueId() }));
}

/** Creates a nomadic merchant with random wares (quadar.md: Rangers and Merchants). */
export function createMerchant(): Merchant {
  const name = MERCHANT_NAMES[Math.floor(Math.random() * MERCHANT_NAMES.length)];
  const wares = pickRandomWares(2 + Math.floor(Math.random() * 2));
  return {
    id: `merchant_${uniqueId()}`,
    name,
    description: "A nomadic trader with an eye for the arcane and lost craftsmanship.",
    wares,
  };
}

export interface GenerateStartRoomOptions {
    /** When true: no random allies or merchants — for reliable playtest automation. */
    deterministic?: boolean;
}

/** Generates the initial Quadar Tower merchandise store room per Familiar rules. */
export function generateStartRoom(opts?: GenerateStartRoomOptions): Room {
  const deterministic = opts?.deterministic ?? false;
  const room = generateRoom("start_room", "Quadar Tower", { title: "Store Room", description: "In the cryptic recesses of Quadar Tower, you preside over an emporium, brokering eldritch artifacts amid its shadowed corridors. A merchandise store room you manage and trade wares from." });
  if (!deterministic) {
    if (Math.random() < 0.4) {
      room.allies = [{ ...FELLOW_RANGER, id: `ranger_${uniqueId()}` }];
    }
    if (Math.random() < 0.6) {
      room.merchants = [createMerchant()];
    }
  }
  return room;
}

interface GenerateRoomOverrides {
  title?: string;
  description?: string;
}

export function generateRoom(id?: string, biomeOverride?: Biome, overrides?: GenerateRoomOverrides): Room {
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
        title: overrides?.title ?? `${p1} ${p2}`,
        description: overrides?.description ?? `You stand within the ${biome}. The air is heavy with ${biome === "Toxic Wastes" ? "metallic stench" : "whispers of the dead"}.`,
        biome,
        hazards: roll < 20 ? ["Toxic Air"] : [],
        exits: {
            North: Math.random() > 0.3 ? "new-room" : null,
            South: Math.random() > 0.3 ? "new-room" : null,
            East: Math.random() > 0.3 ? "new-room" : null,
            West: Math.random() > 0.3 ? "new-room" : null,
        },
        enemies,
        allies: [],
        merchants: Math.random() < 0.15 ? [createMerchant()] : [],
    };
}

// --- Loom of Fate Logic ---

type Table1Result = { answer: "Yes" | "No"; qualifier?: "and" | "but" | "unexpectedly"; resultString: string };

function resolveTable1(modifiedRoll: number, stage: StageOfScene): Table1Result {
  const ranges = LOOM_RANGES[stage];
  // Order: Yes+unexp, Yes+but, Yes+and, Yes, No, No+and, No+but, No+unexp
  const results: Table1Result[] = [
    { answer: "Yes", qualifier: "unexpectedly", resultString: "Yes, and unexpectedly..." },
    { answer: "Yes", qualifier: "but", resultString: "Yes, but..." },
    { answer: "Yes", qualifier: "and", resultString: "Yes, and..." },
    { answer: "Yes", resultString: "Yes." },
    { answer: "No", resultString: "No." },
    { answer: "No", qualifier: "and", resultString: "No, and..." },
    { answer: "No", qualifier: "but", resultString: "No, but..." },
    { answer: "No", qualifier: "unexpectedly", resultString: "No, and unexpectedly..." },
  ];
  for (let i = 0; i < ranges.length; i++) {
    if (modifiedRoll >= ranges[i].min && modifiedRoll <= ranges[i].max) {
      return results[i];
    }
  }
  return results[0]; // fallback
}

export function consultLoom(question: string, currentSurgeCount: number, stage: StageOfScene = "To Knowledge"): LoomResult {
    const d100 = Math.floor(Math.random() * 100) + 1;
    let modifiedRoll = d100;

    // Surge Logic: If d100 > 50, ADD surge. If d100 <= 50, SUBTRACT surge.
    if (d100 > 50) {
        modifiedRoll += currentSurgeCount;
    } else {
        modifiedRoll -= currentSurgeCount;
    }

    // Out-of-range: "Any result outside the range of the table is automatically treated as corresponding 'and unexpectedly' result."
    let result: Table1Result;
    if (modifiedRoll < 1) {
        result = { answer: "No", qualifier: "unexpectedly", resultString: "No, and unexpectedly..." };
    } else if (modifiedRoll > 100) {
        result = { answer: "Yes", qualifier: "unexpectedly", resultString: "Yes, and unexpectedly..." };
    } else {
        result = resolveTable1(modifiedRoll, stage);
    }

    let description = result.resultString;

    const newSurge = result.qualifier ? -1 : 2;

    let unexpectedEventIndex: number | undefined;
    let unexpectedEventLabel: string | undefined;
    if (result.qualifier === "unexpectedly") {
        const d20 = Math.floor(Math.random() * 20) + 1;
        unexpectedEventIndex = d20;
        unexpectedEventLabel = UNEXPECTEDLY_TABLE[d20 - 1] || "Re-roll";
        description += ` [EVENT: ${unexpectedEventLabel}]`;
    }

    return {
        answer: result.answer,
        qualifier: result.qualifier,
        description,
        roll: modifiedRoll,
        surgeUpdate: newSurge,
        unexpectedEventIndex,
        unexpectedEventLabel,
    };
}
