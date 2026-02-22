import type { PlayerActor, AgentClass } from "../types";
import { CLASS_TEMPLATES } from "../mechanics";

export function initializePlayer(classId?: string): PlayerActor {
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

    const selectedClass = (classId && validClasses[classId]) ? classId as AgentClass : "Ashwalker";
    const template = CLASS_TEMPLATES[selectedClass];

    return {
        // Identity
        id: "player_1",
        type: selectedClass,
        faction: 'player',
        name: "Kamenal", // Lore preserved in metadata for now
        agentClass: selectedClass,

        // Core Components
        stats: {
            hp: template.baseStats.maxHp,
            maxHp: template.baseStats.maxHp,
            stress: 0,
            maxStress: template.baseStats.maxStress,
            level: 12, // Standard test level
            xp: 0,
            maxXp: 1000,
            speed: 1, // Base default
            defense: 0,
            damage: 1,
            invulnerable: 0,
        },

        inventory: {
            weapons: ["rogue_blade"],
            currentWeaponIndex: 0,
            items: [
                { id: "rogue_blade", name: "Rogue's Blade", type: "weapon", description: "Standard issue shortsword.", cost: { primary: 5 } },
                { id: "scout_garb", name: "Scout Garb", type: "armor", description: "Light leather armor.", cost: { primary: 5 } },
                { id: "relic_shard", name: "Relic Shard", type: "relic", description: "A buzzing shard of old tech.", cost: { primary: 10 } }
            ],
            equipment: {
                mainHand: { id: "rogue_blade", name: "Rogue's Blade", type: "weapon", description: "Standard issue shortsword.", cost: { primary: 5 } },
                armor: { id: "scout_garb", name: "Scout Garb", type: "armor", description: "Light leather armor.", cost: { primary: 5 } }
            },
            spirit: 20, // resourcePrimary mapping
            blood: 0,   // resourceSecondary mapping
        },

        // Capability Component
        capabilities: {
            learned: template.startingCapabilities || [],
        },

        // Physics / Spatial
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 14,
        height: 24,
        isGrounded: false,
        facingRight: true,

        // Visual State
        state: "idle",
        frame: 0,
        animTimer: 0,

        // Flags
        active: true,

        // Legacy / Domain Specific
        surgeCount: 0,
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
            }
        ],
        activeEffects: []
    };
}
