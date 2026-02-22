import type { Biome, Area } from '../../../types';

export interface AreaGenContext {
    previousArea?: Area | null;
    direction?: string;
    playerLevel?: number;
    areasExplored?: number;
}

type TransitionEntry = { biome: Biome; weight: number };

export const BIOME_TRANSITIONS: Partial<Record<Biome, TransitionEntry[]>> = {
    "Quadar Tower": [{ biome: "Quadar Tower", weight: 45 }, { biome: "Haunted Chapel", weight: 18 }, { biome: "Military Installation", weight: 18 }, { biome: "Eldritch Fortress", weight: 10 }, { biome: "Labyrinthine Dungeon", weight: 5 }, { biome: "Crumbling Ruins", weight: 4 }],
    "Haunted Chapel": [{ biome: "Quadar Tower", weight: 28 }, { biome: "Eldritch Fortress", weight: 25 }, { biome: "Labyrinthine Dungeon", weight: 22 }, { biome: "Ethereal Marshlands", weight: 15 }, { biome: "Military Installation", weight: 10 }],
    "Military Installation": [{ biome: "Quadar Tower", weight: 28 }, { biome: "Eldritch Fortress", weight: 25 }, { biome: "Labyrinthine Dungeon", weight: 22 }, { biome: "Crumbling Ruins", weight: 15 }, { biome: "Obsidian Spire", weight: 10 }],
    "Eldritch Fortress": [{ biome: "Labyrinthine Dungeon", weight: 25 }, { biome: "Chthonic Depths", weight: 22 }, { biome: "Haunted Chapel", weight: 18 }, { biome: "Cavernous Abyss", weight: 15 }, { biome: "Rune Temples", weight: 12 }, { biome: "Military Installation", weight: 8 }],
    "Labyrinthine Dungeon": [{ biome: "Chthonic Depths", weight: 28 }, { biome: "Eldritch Fortress", weight: 22 }, { biome: "Cavernous Abyss", weight: 20 }, { biome: "Rune Temples", weight: 15 }, { biome: "Quadar Tower", weight: 8 }, { biome: "The Sterile Chamber", weight: 7 }],
    "Chthonic Depths": [{ biome: "Labyrinthine Dungeon", weight: 22 }, { biome: "Cavernous Abyss", weight: 22 }, { biome: "Abyss of Infernal Lore", weight: 18 }, { biome: "Rune Temples", weight: 15 }, { biome: "Dimensional Nexus", weight: 12 }, { biome: "The Sterile Chamber", weight: 11 }],
    "Cavernous Abyss": [{ biome: "Chthonic Depths", weight: 25 }, { biome: "Labyrinthine Dungeon", weight: 22 }, { biome: "Abyss of Infernal Lore", weight: 18 }, { biome: "Rune Temples", weight: 15 }, { biome: "Dimensional Nexus", weight: 12 }, { biome: "Obsidian Spire", weight: 8 }],
    "Ethereal Marshlands": [{ biome: "Haunted Chapel", weight: 25 }, { biome: "Crumbling Ruins", weight: 22 }, { biome: "Toxic Wastes", weight: 18 }, { biome: "Labyrinthine Dungeon", weight: 18 }, { biome: "Precipice of the Shadowlands", weight: 10 }, { biome: "Quadar Tower", weight: 7 }],
    "Crumbling Ruins": [{ biome: "Military Installation", weight: 22 }, { biome: "Eldritch Fortress", weight: 20 }, { biome: "Labyrinthine Dungeon", weight: 18 }, { biome: "Quadar Tower", weight: 15 }, { biome: "Chthonic Depths", weight: 12 }, { biome: "Ethereal Marshlands", weight: 13 }],
    "Obsidian Spire": [{ biome: "Eldritch Fortress", weight: 25 }, { biome: "Military Installation", weight: 22 }, { biome: "Chthonic Depths", weight: 18 }, { biome: "Labyrinthine Dungeon", weight: 15 }, { biome: "Dimensional Nexus", weight: 12 }, { biome: "Cavernous Abyss", weight: 8 }],
    "Rune Temples": [{ biome: "Chthonic Depths", weight: 22 }, { biome: "Labyrinthine Dungeon", weight: 20 }, { biome: "Abyss of Infernal Lore", weight: 18 }, { biome: "Twilight Alchemy Haven", weight: 15 }, { biome: "Eldritch Fortress", weight: 12 }, { biome: "Dimensional Nexus", weight: 13 }],
    "Toxic Wastes": [{ biome: "Ethereal Marshlands", weight: 25 }, { biome: "Chthonic Depths", weight: 20 }, { biome: "The Sterile Chamber", weight: 18 }, { biome: "Labyrinthine Dungeon", weight: 15 }, { biome: "Chromatic-Steel Fungi", weight: 12 }, { biome: "Crumbling Ruins", weight: 10 }],
    "The Sterile Chamber": [{ biome: "Chthonic Depths", weight: 22 }, { biome: "Labyrinthine Dungeon", weight: 20 }, { biome: "Toxic Wastes", weight: 18 }, { biome: "Abyss of Infernal Lore", weight: 15 }, { biome: "Dimensional Nexus", weight: 13 }, { biome: "Rune Temples", weight: 12 }],
    "Abyss of Infernal Lore": [{ biome: "Chthonic Depths", weight: 22 }, { biome: "Rune Temples", weight: 20 }, { biome: "Dimensional Nexus", weight: 18 }, { biome: "Twilight Alchemy Haven", weight: 15 }, { biome: "Static Sea of All Noise", weight: 12 }, { biome: "Precipice of the Shadowlands", weight: 13 }],
    "Dimensional Nexus": [{ biome: "Rune Temples", weight: 22 }, { biome: "Twilight Alchemy Haven", weight: 20 }, { biome: "Abyss of Infernal Lore", weight: 18 }, { biome: "Static Sea of All Noise", weight: 15 }, { biome: "Chthonic Depths", weight: 12 }, { biome: "Precipice of the Shadowlands", weight: 13 }],
    "Twilight Alchemy Haven": [{ biome: "Rune Temples", weight: 22 }, { biome: "Dimensional Nexus", weight: 20 }, { biome: "Abyss of Infernal Lore", weight: 18 }, { biome: "Static Sea of All Noise", weight: 15 }, { biome: "Precipice of the Shadowlands", weight: 13 }, { biome: "Chromatic-Steel Fungi", weight: 12 }],
    "Static Sea of All Noise": [{ biome: "Dimensional Nexus", weight: 25 }, { biome: "Twilight Alchemy Haven", weight: 22 }, { biome: "Precipice of the Shadowlands", weight: 20 }, { biome: "Chromatic-Steel Fungi", weight: 15 }, { biome: "Abyss of Infernal Lore", weight: 10 }, { biome: "Chthonic Depths", weight: 8 }],
    "Precipice of the Shadowlands": [{ biome: "Static Sea of All Noise", weight: 22 }, { biome: "Ethereal Marshlands", weight: 20 }, { biome: "Abyss of Infernal Lore", weight: 18 }, { biome: "Dimensional Nexus", weight: 15 }, { biome: "Haunted Chapel", weight: 12 }, { biome: "Twilight Alchemy Haven", weight: 13 }],
    "Chromatic-Steel Fungi": [{ biome: "Static Sea of All Noise", weight: 22 }, { biome: "Toxic Wastes", weight: 20 }, { biome: "Dimensional Nexus", weight: 18 }, { biome: "Chthonic Depths", weight: 15 }, { biome: "Twilight Alchemy Haven", weight: 13 }, { biome: "The Sterile Chamber", weight: 12 }],
};

export const BIOMES: Biome[] = [
    "Ethereal Marshlands", "Toxic Wastes", "Haunted Chapel", "Obsidian Spire",
    "Quadar Tower", "Military Installation", "Eldritch Fortress", "Labyrinthine Dungeon",
    "Chromatic-Steel Fungi", "Chthonic Depths", "Static Sea of All Noise", "Twilight Alchemy Haven",
    "Abyss of Infernal Lore", "Precipice of the Shadowlands", "Rune Temples", "Crumbling Ruins",
    "Dimensional Nexus", "Cavernous Abyss", "The Sterile Chamber",
];

const deeperBiomes: Biome[] = ["Chthonic Depths", "Cavernous Abyss", "Abyss of Infernal Lore", "Dimensional Nexus", "Static Sea of All Noise", "Twilight Alchemy Haven", "Precipice of the Shadowlands", "Chromatic-Steel Fungi", "The Sterile Chamber"];
const shallowerBiomes: Biome[] = ["Quadar Tower", "Haunted Chapel", "Military Installation", "Ethereal Marshlands", "Crumbling Ruins"];

export function selectNextBiome(context?: AreaGenContext | null): Biome {
    const prevBiome = context?.previousArea?.biome;
    const transitions = prevBiome ? BIOME_TRANSITIONS[prevBiome] : null;
    if (!transitions || transitions.length === 0) return "Quadar Tower";

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
