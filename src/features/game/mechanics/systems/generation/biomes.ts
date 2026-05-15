import type { Biome, Area } from '../../../types';

export interface AreaGenContext {
    previousArea?: Area | null;
    direction?: string;
    playerLevel?: number;
    areasExplored?: number;
}

type TransitionEntry = { biome: Biome; weight: number };

export const BIOME_TRANSITIONS: Partial<Record<Biome, TransitionEntry[]>> = {
    "Lanternbough": [{ biome: "Lanternbough", weight: 45 }, { biome: "Rune Stones", weight: 18 }, { biome: "Trading Posts", weight: 18 }, { biome: "Mushroom Chapel", weight: 10 }, { biome: "Root Warrens", weight: 5 }, { biome: "Troll Bridges", weight: 4 }],
    "Rune Stones": [{ biome: "Lanternbough", weight: 28 }, { biome: "Mushroom Chapel", weight: 25 }, { biome: "Root Warrens", weight: 22 }, { biome: "Meadows", weight: 15 }, { biome: "Trading Posts", weight: 10 }],
    "Trading Posts": [{ biome: "Lanternbough", weight: 28 }, { biome: "Mushroom Chapel", weight: 25 }, { biome: "Root Warrens", weight: 22 }, { biome: "Troll Bridges", weight: 15 }, { biome: "The Tree", weight: 10 }],
    "Mushroom Chapel": [{ biome: "Root Warrens", weight: 25 }, { biome: "Underground Springs", weight: 22 }, { biome: "Rune Stones", weight: 18 }, { biome: "Root Drops", weight: 15 }, { biome: "Canopy Platforms", weight: 12 }, { biome: "Trading Posts", weight: 8 }],
    "Root Warrens": [{ biome: "Underground Springs", weight: 28 }, { biome: "Mushroom Chapel", weight: 22 }, { biome: "Root Drops", weight: 20 }, { biome: "Canopy Platforms", weight: 15 }, { biome: "Lanternbough", weight: 8 }, { biome: "Seasonal Shifts", weight: 7 }],
    "Underground Springs": [{ biome: "Root Warrens", weight: 22 }, { biome: "Root Drops", weight: 22 }, { biome: "Overgrown Ruins", weight: 18 }, { biome: "Canopy Platforms", weight: 15 }, { biome: "Otherwild Reaches", weight: 12 }, { biome: "Seasonal Shifts", weight: 11 }],
    "Root Drops": [{ biome: "Underground Springs", weight: 25 }, { biome: "Root Warrens", weight: 22 }, { biome: "Overgrown Ruins", weight: 18 }, { biome: "Canopy Platforms", weight: 15 }, { biome: "Otherwild Reaches", weight: 12 }, { biome: "The Tree", weight: 8 }],
    "Meadows": [{ biome: "Rune Stones", weight: 25 }, { biome: "Troll Bridges", weight: 22 }, { biome: "Mud Paths", weight: 18 }, { biome: "Root Warrens", weight: 18 }, { biome: "Narrow Paths", weight: 10 }, { biome: "Lanternbough", weight: 7 }],
    "Troll Bridges": [{ biome: "Trading Posts", weight: 22 }, { biome: "Mushroom Chapel", weight: 20 }, { biome: "Root Warrens", weight: 18 }, { biome: "Lanternbough", weight: 15 }, { biome: "Underground Springs", weight: 12 }, { biome: "Meadows", weight: 13 }],
    "The Tree": [{ biome: "Mushroom Chapel", weight: 25 }, { biome: "Trading Posts", weight: 22 }, { biome: "Underground Springs", weight: 18 }, { biome: "Root Warrens", weight: 15 }, { biome: "Otherwild Reaches", weight: 12 }, { biome: "Root Drops", weight: 8 }],
    "Canopy Platforms": [{ biome: "Underground Springs", weight: 22 }, { biome: "Root Warrens", weight: 20 }, { biome: "Overgrown Ruins", weight: 18 }, { biome: "Herb Gardens", weight: 15 }, { biome: "Mushroom Chapel", weight: 12 }, { biome: "Otherwild Reaches", weight: 13 }],
    "Mud Paths": [{ biome: "Meadows", weight: 25 }, { biome: "Underground Springs", weight: 20 }, { biome: "Seasonal Shifts", weight: 18 }, { biome: "Root Warrens", weight: 15 }, { biome: "Mushroom Rings", weight: 12 }, { biome: "Troll Bridges", weight: 10 }],
    "Seasonal Shifts": [{ biome: "Underground Springs", weight: 22 }, { biome: "Root Warrens", weight: 20 }, { biome: "Mud Paths", weight: 18 }, { biome: "Overgrown Ruins", weight: 15 }, { biome: "Otherwild Reaches", weight: 13 }, { biome: "Canopy Platforms", weight: 12 }],
    "Overgrown Ruins": [{ biome: "Underground Springs", weight: 22 }, { biome: "Canopy Platforms", weight: 20 }, { biome: "Otherwild Reaches", weight: 18 }, { biome: "Herb Gardens", weight: 15 }, { biome: "Creek Crossings", weight: 12 }, { biome: "Narrow Paths", weight: 13 }],
    "Otherwild Reaches": [{ biome: "Canopy Platforms", weight: 22 }, { biome: "Herb Gardens", weight: 20 }, { biome: "Overgrown Ruins", weight: 18 }, { biome: "Creek Crossings", weight: 15 }, { biome: "Underground Springs", weight: 12 }, { biome: "Narrow Paths", weight: 13 }],
    "Herb Gardens": [{ biome: "Canopy Platforms", weight: 22 }, { biome: "Otherwild Reaches", weight: 20 }, { biome: "Overgrown Ruins", weight: 18 }, { biome: "Creek Crossings", weight: 15 }, { biome: "Narrow Paths", weight: 13 }, { biome: "Mushroom Rings", weight: 12 }],
    "Creek Crossings": [{ biome: "Otherwild Reaches", weight: 25 }, { biome: "Herb Gardens", weight: 22 }, { biome: "Narrow Paths", weight: 20 }, { biome: "Mushroom Rings", weight: 15 }, { biome: "Overgrown Ruins", weight: 10 }, { biome: "Underground Springs", weight: 8 }],
    "Narrow Paths": [{ biome: "Creek Crossings", weight: 22 }, { biome: "Meadows", weight: 20 }, { biome: "Overgrown Ruins", weight: 18 }, { biome: "Otherwild Reaches", weight: 15 }, { biome: "Rune Stones", weight: 12 }, { biome: "Herb Gardens", weight: 13 }],
    "Mushroom Rings": [{ biome: "Creek Crossings", weight: 22 }, { biome: "Mud Paths", weight: 20 }, { biome: "Otherwild Reaches", weight: 18 }, { biome: "Underground Springs", weight: 15 }, { biome: "Herb Gardens", weight: 13 }, { biome: "Seasonal Shifts", weight: 12 }],
};

export const BIOMES: Biome[] = [
    "Meadows", "Mud Paths", "Rune Stones", "The Tree",
    "Lanternbough", "Trading Posts", "Mushroom Chapel", "Root Warrens",
    "Mushroom Rings", "Underground Springs", "Creek Crossings", "Herb Gardens",
    "Overgrown Ruins", "Narrow Paths", "Canopy Platforms", "Troll Bridges",
    "Otherwild Reaches", "Root Drops", "Seasonal Shifts",
];

const deeperBiomes: Biome[] = ["Underground Springs", "Root Drops", "Overgrown Ruins", "Otherwild Reaches", "Creek Crossings", "Herb Gardens", "Narrow Paths", "Mushroom Rings", "Seasonal Shifts"];
const shallowerBiomes: Biome[] = ["Lanternbough", "Rune Stones", "Trading Posts", "Meadows", "Troll Bridges"];

export function selectNextBiome(context?: AreaGenContext | null): Biome {
    const prevBiome = context?.previousArea?.biome;
    const transitions = prevBiome ? BIOME_TRANSITIONS[prevBiome] : null;
    if (!transitions || transitions.length === 0) return "Lanternbough";

    const direction = context?.direction ?? "";
    const areasExplored = context?.areasExplored ?? 0;
    const playerLevel = context?.playerLevel ?? 1;

    const weightMultiplier = (entry: TransitionEntry): number => {
        let mult = 1;
        if (direction === "South" && deeperBiomes.includes(entry.biome)) mult *= 1.4;
        else if (direction === "North" && shallowerBiomes.includes(entry.biome)) mult *= 1.3;
        else if (direction === "North" && deeperBiomes.includes(entry.biome)) mult *= 0.7;
        else if (direction === "South" && shallowerBiomes.includes(entry.biome)) mult *= 0.8;
        if (areasExplored >= 10 && deeperBiomes.includes(entry.biome)) mult *= 1.1;
        if (playerLevel >= 10 && deeperBiomes.includes(entry.biome)) mult *= 1.1;
        return mult;
    };

    const weighted = transitions.map((e) => ({ biome: e.biome, w: e.weight * weightMultiplier(e) }));
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (const { biome, w } of weighted) {
        r -= w;
        if (r <= 0) return biome;
    }
    return weighted[weighted.length - 1].biome;
}
