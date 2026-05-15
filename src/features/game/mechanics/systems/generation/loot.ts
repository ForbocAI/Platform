import type { Biome, Item } from '../../../types';
import { MATERIALS } from '@/features/game/mechanics/materials';

export const BIOME_GROUND_LOOT: Partial<Record<Biome, { materialId: string; chance: number; minQty?: number; maxQty?: number }[]>> = {
    "Lanternbough": [{ materialId: "glowing_mushroom", chance: 0.35, minQty: 1, maxQty: 2 }, { materialId: "scrap_metal", chance: 0.2 }],
    "Underground Springs": [{ materialId: "glowing_mushroom", chance: 0.5, minQty: 1, maxQty: 3 }, { materialId: "relic_shard", chance: 0.25 }, { materialId: "root_truffle", chance: 0.3 }],
    "Trading Posts": [{ materialId: "scrap_metal", chance: 0.5, minQty: 1, maxQty: 3 }, { materialId: "acid_vial", chance: 0.2 }],
    "Mushroom Chapel": [{ materialId: "leather_scraps", chance: 0.45 }, { materialId: "rune_stone", chance: 0.15 }, { materialId: "dewdrop_morel", chance: 0.12 }],
    "Root Warrens": [{ materialId: "leather_scraps", chance: 0.4 }, { materialId: "glowing_mushroom", chance: 0.2 }, { materialId: "root_truffle", chance: 0.15 }],
    "Mud Paths": [{ materialId: "acid_vial", chance: 0.55, minQty: 1, maxQty: 2 }, { materialId: "chromatic_spore", chance: 0.1 }, { materialId: "ember_puffball", chance: 0.2 }],
    "The Tree": [{ materialId: "moonstone_shard", chance: 0.4 }, { materialId: "rune_stone", chance: 0.25 }, { materialId: "ember_puffball", chance: 0.15 }],
    "Canopy Platforms": [{ materialId: "rune_stone", chance: 0.5, minQty: 1, maxQty: 2 }, { materialId: "relic_shard", chance: 0.2 }],
    "Mushroom Rings": [{ materialId: "chromatic_spore", chance: 0.6, minQty: 1, maxQty: 2 }, { materialId: "glowing_mushroom", chance: 0.25 }, { materialId: "chromatic_cap", chance: 0.4, minQty: 1, maxQty: 2 }],
    "Overgrown Ruins": [{ materialId: "glowstone_cluster", chance: 0.4 }, { materialId: "moonstone_shard", chance: 0.2 }, { materialId: "ember_puffball", chance: 0.2 }],
    "Otherwild Reaches": [{ materialId: "morning_dew", chance: 0.4 }, { materialId: "relic_shard", chance: 0.2 }, { materialId: "dewdrop_morel", chance: 0.3 }],
    "Narrow Paths": [{ materialId: "morning_dew", chance: 0.35 }, { materialId: "glowstone_cluster", chance: 0.15 }, { materialId: "dewdrop_morel", chance: 0.2 }],
    "Creek Crossings": [{ materialId: "relic_shard", chance: 0.35 }, { materialId: "morning_dew", chance: 0.2 }, { materialId: "static_lichen", chance: 0.35 }],
    "Troll Bridges": [{ materialId: "scrap_metal", chance: 0.4 }, { materialId: "rune_stone", chance: 0.2 }],
    "Rune Stones": [{ materialId: "rune_stone", chance: 0.3 }, { materialId: "leather_scraps", chance: 0.25 }, { materialId: "root_truffle", chance: 0.1 }],
    "Meadows": [{ materialId: "glowing_mushroom", chance: 0.35 }, { materialId: "morning_dew", chance: 0.1 }, { materialId: "chromatic_cap", chance: 0.2 }],
    "Root Drops": [{ materialId: "moonstone_shard", chance: 0.35 }, { materialId: "glowstone_cluster", chance: 0.15 }, { materialId: "root_truffle", chance: 0.25 }],
    "Seasonal Shifts": [{ materialId: "glowstone_cluster", chance: 0.3 }, { materialId: "acid_vial", chance: 0.25 }],
    "Herb Gardens": [{ materialId: "chromatic_spore", chance: 0.3 }, { materialId: "acid_vial", chance: 0.25 }, { materialId: "static_lichen", chance: 0.15 }],
};

export const NPC_LOOT: Partial<Record<string, { materialId: string; chance: number; guaranteed?: boolean }[]>> = {
    "Bridgekeeper": [{ materialId: "moonstone_shard", chance: 1, guaranteed: true }],
    "Thornwarden": [{ materialId: "glowstone_cluster", chance: 0.6 }],
    "Wayfinder Scout": [{ materialId: "leather_scraps", chance: 0.7 }, { materialId: "relic_shard", chance: 0.3 }],
    "Ironbark Sentinel": [{ materialId: "scrap_metal", chance: 1, guaranteed: true }, { materialId: "leather_scraps", chance: 0.4 }],
    "Mist Drifter": [{ materialId: "relic_shard", chance: 0.8 }, { materialId: "morning_dew", chance: 0.3 }],
    "Windguard Scout": [{ materialId: "scrap_metal", chance: 0.8 }],
    "Thunderoak Elder": [{ materialId: "relic_shard", chance: 0.6 }, { materialId: "glowstone_cluster", chance: 0.4 }],
    "Hearthkeeper Tender": [{ materialId: "glowstone_cluster", chance: 0.5 }, { materialId: "acid_vial", chance: 0.4 }],
    "Rootwalker": [{ materialId: "leather_scraps", chance: 0.9 }],
    "Mosshorn Charger": [{ materialId: "leather_scraps", chance: 0.6 }],
    "Bramble Colossus": [{ materialId: "moonstone_shard", chance: 0.8 }, { materialId: "glowstone_cluster", chance: 0.6 }],
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

export function getNPCLoot(npcName: string): Item[] {
    const drops = NPC_LOOT[npcName];
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
