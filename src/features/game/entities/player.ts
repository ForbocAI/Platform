import type { AgentPlayer, AgentClass } from "../types";
import { CLASS_TEMPLATES } from "../mechanics";

export function initializePlayer(classId?: string): AgentPlayer {
    // Defines the "Starting Initiation"
    // Valid player classes
    const validClasses: Partial<Record<string, boolean>> = {
        "Ashwalker": true,
        "Obsidian Warden": true,
        "Doomguard": true,
        "Iron Armored Guardian": true,
        "Aether Spirit": true,
        "Thunder Trooper": true,
        "Cyberflux Guardian": true,
        "Voidwraith": true,
        "Storm Titan": true,
        "Flame Corps": true,
        "Twilight Weaver": true,
        "Byssalspawn": true,
        "Aksov Hexe-Spinne": true,
        "Gravewalker": true,
        "Shadowhorn Juggernaut": true,
        "Magma Leviathan": true,
        "Abyssal Overfiend": true,
        "Aetherwing Herald": true
    };

    // Default to Ashwalker if invalid or missing
    const selectedClass = (classId && validClasses[classId]) ? classId as AgentClass : "Ashwalker";
    const template = CLASS_TEMPLATES[selectedClass];

    return {
        id: "player_1",
        name: "Kamenal",
        level: 12,
        agentClass: selectedClass,
        ...template.baseStats,
        hp: template.baseStats.maxHp,
        stress: 0,
        inventory: [
            { id: "rogue_blade", name: "Rogue's Blade", type: "weapon", description: "Standard issue shortsword.", cost: { primary: 5 } },
            { id: "scout_garb", name: "Scout Garb", type: "armor", description: "Light leather armor.", cost: { primary: 5 } },
            { id: "relic_shard", name: "Relic Shard", type: "relic", description: "A buzzing shard of old tech.", cost: { primary: 10 } }
        ],
        capabilities: template.startingCapabilities,
        surgeCount: 0,
        resourcePrimary: 20,
        resourceSecondary: 0,
        xp: 0,
        activeEffects: [],
        maxXp: 1200, // Level 12 * 100
        blueprints: [
            {
                id: "recipe_minor_healing_potion",
                ingredients: [{ name: "Glowing Mushroom", quantity: 2 }],
                produces: {
                    id: "minor_healing_potion_crafted",
                    name: "Minor Healing Potion",
                    type: "consumable",
                    description: "A small vial of healing liquid.",
                    effect: "heal_hp_20",
                    cost: { primary: 5 }
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
                    cost: { primary: 20 }
                }
            }
        ]
    };
}
