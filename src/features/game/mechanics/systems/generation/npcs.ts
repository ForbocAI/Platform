import type { NonPlayerActor } from '../../../types';

interface NPCTemplate {
    type: string;
    description?: string;
    baseStats: {
        maxHp: number;
        defense?: number;
        damage?: number;
        speed?: number;
    };
    capabilities?: string[];
}

export const NPC_TEMPLATES: Record<string, NPCTemplate> = {
    "Bridgekeeper": {
        type: "Bridgekeeper",
        description: "A sturdy sentinel wrapped in mossy stone and warm granite.",
        baseStats: { maxHp: 60, defense: 15, damage: 10, speed: 0.5 },
        capabilities: ["root_stone_sheltering", "granite_surge"]
    },
    "Thornwarden": {
        type: "Thornwarden",
        description: "A thorny guardian bristling with seed-pods and bark armor.",
        baseStats: { maxHp: 50, defense: 14, damage: 8, speed: 0.8 },
        capabilities: ["seedstorm", "briar_charge"]
    },
    "Wayfinder Scout": {
        type: "Wayfinder",
        description: "A wandering ranger with a lantern and craft tools.",
        baseStats: { maxHp: 40, defense: 13, damage: 7, speed: 1.0 },
        capabilities: ["lantern_dash", "craft_strike"]
    },
    "Ironbark Sentinel": {
        type: "Ironbark Sentinel",
        description: "A heavily armored sentinel with bark-plated shield.",
        baseStats: { maxHp: 55, defense: 16, damage: 9, speed: 0.6 },
        capabilities: ["ironbark_charge", "root_shield_block"]
    },
    "Mist Drifter": {
        type: "Mist Drifter",
        description: "A fleeting form of shimmering mist and gentle light.",
        baseStats: { maxHp: 35, defense: 12, damage: 12, speed: 1.2 },
        capabilities: ["mistfade_drift", "wisp_grasp"]
    },
    "Windguard Scout": {
        type: "Windguard Scout",
        description: "A swift canopy scout who rides wind currents.",
        baseStats: { maxHp: 45, defense: 13, damage: 11, speed: 1.1 },
        capabilities: ["rain_cape_shield", "thunder_clap"]
    },
    "Thunderoak Elder": {
        type: "Thunderoak Elder",
        description: "A towering elder oak creature crackling with storm energy.",
        baseStats: { maxHp: 120, defense: 18, damage: 20, speed: 0.4 },
        capabilities: ["storm_harvest", "thunderous_stamp"]
    },
    "Hearthkeeper Tender": {
        type: "Hearthkeeper",
        description: "A warm-hearted keeper who tends cooking fires and forge pots.",
        baseStats: { maxHp: 65, defense: 14, damage: 15, speed: 0.7 },
        capabilities: ["ember_pot_toss", "kindling_charge"]
    },
    "Rootwalker": {
        type: "Rootwalker",
        description: "A quiet figure who walks the old root tunnels with patient steps.",
        baseStats: { maxHp: 70, defense: 11, damage: 13, speed: 0.9 },
        capabilities: ["root_strike", "tendril_grasp", "soil_shatter"]
    },
    "Mosshorn Charger": {
        type: "Mosshorn Charger",
        description: "An agile, antlered creature with powerful charging attacks.",
        baseStats: { maxHp: 60, defense: 14, damage: 14, speed: 1.3 },
        capabilities: ["antler_charge", "stomping_impact", "forest_sprint"]
    },
    "Bramble Colossus": {
        type: "Bramble Colossus",
        description: "A massive vine-covered colossus from the deep root hollows.",
        baseStats: { maxHp: 200, defense: 20, damage: 25, speed: 0.3 },
        capabilities: ["vine_surge_sweep", "root_slam_tremor", "tangle_pool_eruption"]
    },
    "The Briarking": {
        type: "The Briarking",
        description: "The great protector of the deep vale. A towering entity of vine and thorn.",
        baseStats: { maxHp: 500, defense: 22, damage: 40, speed: 0.5 },
        capabilities: ["vine_arms", "thorn_gaze", "tangle_storm_call"]
    },
    "Petalwing Herald": {
        type: "Petalwing Herald",
        description: "A graceful flying herald that projects beams of petal-light.",
        baseStats: { maxHp: 120, defense: 15, damage: 18, speed: 1.4 },
        capabilities: ["petal_projection", "petal_storm", "bloom_reckoning"]
    }
};

export function generateRandomNonPlayerActor(): NonPlayerActor {
    const npcNames = Object.keys(NPC_TEMPLATES);
    const npcName = npcNames[Math.floor(Math.random() * npcNames.length)];
    const template = NPC_TEMPLATES[npcName];

    return {
        id: Math.random().toString(36).substring(7),
        type: template.type,
        faction: 'enemy',
        name: npcName,
        description: template.description || "A mysterious entity.",

        // Stats Component
        stats: {
            hp: template.baseStats.maxHp,
            maxHp: template.baseStats.maxHp,
            stress: 0,
            maxStress: 100,
            speed: template.baseStats.speed || 1,
            defense: template.baseStats.defense || 0,
            damage: template.baseStats.damage || 1,
            invulnerable: 0,
        },

        // Capability Component
        capabilities: {
            learned: template.capabilities || [],
        },

        // Inventory Component (Empty for NPCs by default)
        inventory: {
            weapons: [], currentWeaponIndex: 0, items: [], equipment: {}, spirit: 0, blood: 0,
            offensiveAssets: [], currentAssetIndex: 0, genericAssets: [], primaryResource: 0, secondaryResource: 0
        },

        // AI Component
        ai: {
            behaviorState: 'idle',
            targetId: null,
            memory: {},
            awareness: null
        },

        // Physics
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        width: 14,
        height: 24,
        isGrounded: false,
        facingRight: false,

        // Visual State
        state: "idle",
        frame: 0,
        animTimer: 0,

        // Flags
        activeEffects: [],
        active: true
    };
}
