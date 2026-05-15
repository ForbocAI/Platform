import type { PlayerActor, AgentClass } from "../types";
import { CLASS_TEMPLATES } from "../mechanics";

export function initializePlayer(classId?: string): PlayerActor {
    // Valid player classes
    const validClasses: Partial<Record<string, boolean>> = {
        "Wayfinder": true,
        "Bridgekeeper": true,
        "Thornwarden": true,
        "Ironbark Sentinel": true,
        "Mist Drifter": true,
        "Windguard Scout": true,
        "Glow Sentry": true,
        "Fog Wanderer": true,
        "Thunderoak Elder": true,
        "Hearthkeeper": true,
        "Dew Weaver": true,
        "Tanglevine": true,
        "Silkspinner Scout": true,
        "Rootwalker": true,
        "Mosshorn Charger": true,
        "Bramble Colossus": true,
        "The Briarking": true,
        "Petalwing Herald": true
    };

    const selectedClass = (classId && validClasses[classId]) ? classId as AgentClass : "Wayfinder";
    const template = CLASS_TEMPLATES[selectedClass];

    return {
        // Identity
        id: "player_1",
        type: selectedClass,
        faction: 'player',
        name: "Kamenal", // Lore preserved in metadata for now
        agentClass: selectedClass,
        archetype: selectedClass as any,
        entropyModifier: 0,

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
                { id: "rogue_blade", name: "Brambleknife", type: "weapon", description: "A dependable trail blade for roots, rope, and rough surprises.", cost: { primary: 5 } },
                { id: "scout_garb", name: "Mossstep Cloak", type: "armor", description: "Light travel gear stitched for fast routes and damp weather.", cost: { primary: 5 } },
                { id: "relic_shard", name: "Keepsake Shard", type: "relic", description: "A small humming keepsake that still holds a trace of light.", cost: { primary: 10 } }
            ],
            equipment: {
                mainHand: { id: "rogue_blade", name: "Brambleknife", type: "weapon", description: "A dependable trail blade for roots, rope, and rough surprises.", cost: { primary: 5 } },
                armor: { id: "scout_garb", name: "Mossstep Cloak", type: "armor", description: "Light travel gear stitched for fast routes and damp weather.", cost: { primary: 5 } }
            },
            spirit: 20, // resourcePrimary mapping
            blood: 0,   // resourceSecondary mapping
            offensiveAssets: ["rogue_blade"],
            currentAssetIndex: 0,
            genericAssets: [],
            primaryResource: 20,
            secondaryResource: 0,
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
                    name: "Hearth Poultice",
                    type: "consumable",
                    description: "A warm herbal dressing for cuts, aches, and frayed nerves.",
                    effect: "heal_20_stress_10",
                    cost: { primary: 5 }
                }
            }
        ],
        activeEffects: []
    };
}
