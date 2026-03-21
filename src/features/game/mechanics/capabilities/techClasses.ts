import type { Capability } from "../../types";

export const TECH_CLASS_CAPABILITIES: Record<string, Capability> = {
    // Windguard Scout
    "gust_tool_sweep": {
        id: "gust_tool_sweep",
        name: "Gust Tool Sweep",
        agentClass: "Windguard Scout",
        description: "A gust-powered sweep that staggers nearby foes.",
        magnitude: "2d6",
        effect: () => "AoE Stun"
    },
    "wind_step_agility": {
        id: "wind_step_agility",
        name: "Wind-Step Agility",
        agentClass: "Windguard Scout",
        description: "Ride wind currents for enhanced evasion.",
        effect: () => "Buff Evasion"
    },
    "rain_cape_shield": {
        id: "rain_cape_shield",
        name: "Rain Cape Shield",
        agentClass: "Windguard Scout",
        description: "Rapid volley of wind-driven strikes.",
        magnitude: "3d6",
        effect: () => "Close-range devastation"
    },
    "thunder_clap": {
        id: "thunder_clap",
        name: "Thunder Clap",
        agentClass: "Windguard Scout",
        description: "Clap of thunder that disorients and damages.",
        magnitude: "2d8",
        effect: () => "AoE"
    },
    // Glow Sentry
    "light_pulse": {
        id: "light_pulse",
        name: "Light Pulse",
        agentClass: "Glow Sentry",
        description: "A pulse of warm light that illuminates and nudges pests.",
        magnitude: "3d6",
        effect: () => "None"
    },
    "glow_shield": {
        id: "glow_shield",
        name: "Glow Shield",
        agentClass: "Glow Sentry",
        description: "Self-repair through warm light restoration.",
        effect: () => "Heal"
    },
    // Hearthkeeper
    "ember_pot_toss": {
        id: "ember_pot_toss",
        name: "Ember Pot Toss",
        agentClass: "Hearthkeeper",
        description: "Toss a warming ember pot that spreads heat.",
        magnitude: "2d6",
        effect: () => "Burning Dot"
    },
    "kindling_charge": {
        id: "kindling_charge",
        name: "Kindling Charge",
        agentClass: "Hearthkeeper",
        description: "Heightened state of warmth and energy.",
        effect: () => "Berserk state"
    },
    "hearth_volley": {
        id: "hearth_volley",
        name: "Hearth Volley",
        agentClass: "Hearthkeeper",
        description: "Volley of warming coals over time.",
        magnitude: "1d6",
        effect: () => "AoE Burn"
    },
    "forge_overdrive": {
        id: "forge_overdrive",
        name: "Forge Overdrive",
        agentClass: "Hearthkeeper",
        description: "Significantly boosts output but causes strain.",
        effect: () => "Buff Damage"
    },
    // Thunderoak Elder
    "storm_harvest": {
        id: "storm_harvest",
        name: "Storm Harvest",
        agentClass: "Thunderoak Elder",
        description: "Imbue strikes with storm-gathered energy.",
        effect: () => "Extra Arcane Dmg"
    },
    "thunderous_stamp": {
        id: "thunderous_stamp",
        name: "Thunderous Stamp",
        agentClass: "Thunderoak Elder",
        description: "Shockwaves that scatter nearby pests.",
        magnitude: "4d6",
        effect: () => "AoE Knockback"
    },
    "lightning_bark": {
        id: "lightning_bark",
        name: "Lightning Bark",
        agentClass: "Thunderoak Elder",
        description: "A jolt of stored storm energy through bark.",
        magnitude: "2d8",
        effect: () => "None"
    },
    "chain_spark": {
        id: "chain_spark",
        name: "Chain Spark",
        agentClass: "Thunderoak Elder",
        description: "Massive area of crackling energy.",
        magnitude: "2d6",
        effect: () => "AoE Stun"
    },
};
