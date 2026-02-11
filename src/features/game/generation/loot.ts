import type { Biome, Item } from "../types";
import { MATERIALS } from "../mechanics";

export const BIOME_GROUND_LOOT: Partial<Record<Biome, { materialId: string; chance: number; minQty?: number; maxQty?: number }[]>> = {
    "Quadar Tower": [{ materialId: "glowing_mushroom", chance: 0.35, minQty: 1, maxQty: 2 }, { materialId: "scrap_metal", chance: 0.2 }],
    "Chthonic Depths": [{ materialId: "glowing_mushroom", chance: 0.5, minQty: 1, maxQty: 3 }, { materialId: "relic_shard", chance: 0.25 }],
    "Military Installation": [{ materialId: "scrap_metal", chance: 0.5, minQty: 1, maxQty: 3 }, { materialId: "acid_vial", chance: 0.2 }],
    "Eldritch Fortress": [{ materialId: "leather_scraps", chance: 0.45 }, { materialId: "rune_stone", chance: 0.15 }],
    "Labyrinthine Dungeon": [{ materialId: "leather_scraps", chance: 0.4 }, { materialId: "glowing_mushroom", chance: 0.2 }],
    "Toxic Wastes": [{ materialId: "acid_vial", chance: 0.55, minQty: 1, maxQty: 2 }, { materialId: "chromatic_spore", chance: 0.1 }],
    "Obsidian Spire": [{ materialId: "obsidian_shard", chance: 0.4 }, { materialId: "rune_stone", chance: 0.25 }],
    "Rune Temples": [{ materialId: "rune_stone", chance: 0.5, minQty: 1, maxQty: 2 }, { materialId: "relic_shard", chance: 0.2 }],
    "Chromatic-Steel Fungi": [{ materialId: "chromatic_spore", chance: 0.6, minQty: 1, maxQty: 2 }, { materialId: "glowing_mushroom", chance: 0.25 }],
    "Abyss of Infernal Lore": [{ materialId: "blood_crystal", chance: 0.4 }, { materialId: "obsidian_shard", chance: 0.2 }],
    "Dimensional Nexus": [{ materialId: "void_dust", chance: 0.4 }, { materialId: "relic_shard", chance: 0.2 }],
    "Precipice of the Shadowlands": [{ materialId: "void_dust", chance: 0.35 }, { materialId: "blood_crystal", chance: 0.15 }],
    "Static Sea of All Noise": [{ materialId: "relic_shard", chance: 0.35 }, { materialId: "void_dust", chance: 0.2 }],
    "Crumbling Ruins": [{ materialId: "scrap_metal", chance: 0.4 }, { materialId: "rune_stone", chance: 0.2 }],
    "Haunted Chapel": [{ materialId: "rune_stone", chance: 0.3 }, { materialId: "leather_scraps", chance: 0.25 }],
    "Ethereal Marshlands": [{ materialId: "glowing_mushroom", chance: 0.35 }, { materialId: "void_dust", chance: 0.1 }],
    "Cavernous Abyss": [{ materialId: "obsidian_shard", chance: 0.35 }, { materialId: "blood_crystal", chance: 0.15 }],
    "The Sterile Chamber": [{ materialId: "blood_crystal", chance: 0.3 }, { materialId: "acid_vial", chance: 0.25 }],
    "Twilight Alchemy Haven": [{ materialId: "chromatic_spore", chance: 0.3 }, { materialId: "acid_vial", chance: 0.25 }],
};

export const ENEMY_LOOT: Partial<Record<string, { materialId: string; chance: number; guaranteed?: boolean }[]>> = {
    "Obsidian Warden": [{ materialId: "obsidian_shard", chance: 1, guaranteed: true }],
    "Doomguard": [{ materialId: "blood_crystal", chance: 0.6 }],
    "Ashwalker Renegade": [{ materialId: "leather_scraps", chance: 0.7 }, { materialId: "relic_shard", chance: 0.3 }],
    "Iron Armored Guardian": [{ materialId: "scrap_metal", chance: 1, guaranteed: true }, { materialId: "leather_scraps", chance: 0.4 }],
    "Aether Spirit": [{ materialId: "relic_shard", chance: 0.8 }, { materialId: "void_dust", chance: 0.3 }],
    "Thunder Trooper": [{ materialId: "scrap_metal", chance: 0.8 }],
    "Storm Titan": [{ materialId: "relic_shard", chance: 0.6 }, { materialId: "blood_crystal", chance: 0.4 }],
    "Flame Corps Brute": [{ materialId: "blood_crystal", chance: 0.5 }, { materialId: "acid_vial", chance: 0.4 }],
    "Gravewalker": [{ materialId: "leather_scraps", chance: 0.9 }],
    "Shadowhorn Juggernaut": [{ materialId: "leather_scraps", chance: 0.6 }],
    "Magma Leviathan": [{ materialId: "obsidian_shard", chance: 0.8 }, { materialId: "blood_crystal", chance: 0.6 }],
};

export function generateGroundLoot(biome: Biome): Item[] {
    const table = BIOME_GROUND_LOOT[biome];
    if (!table) return [];
    const loot: Item[] = [];
    for (const entry of table) {
        if (Math.random() > entry.chance) continue;
        const mat = MATERIALS.find((m) => m.id === entry.materialId);
        if (!mat) continue;
        const min = entry.minQty ?? 1;
        const max = entry.maxQty ?? 1;
        const actualQty = min + Math.floor(Math.random() * (max - min + 1));
        for (let i = 0; i < actualQty; i++) {
            loot.push({ ...mat, id: `${mat.id}_${Math.random().toString(36).substring(7)}` });
        }
    }
    return loot;
}

export function getEnemyLoot(enemyName: string): Item[] {
    const drops = ENEMY_LOOT[enemyName];
    if (!drops) return [];
    const loot: Item[] = [];
    for (const d of drops) {
        const roll = Math.random();
        if (d.guaranteed || roll < d.chance) {
            const mat = MATERIALS.find((m) => m.id === d.materialId);
            if (mat) loot.push({ ...mat, id: `${mat.id}_${Math.random().toString(36).substring(7)}` });
        }
    }
    return loot;
}
