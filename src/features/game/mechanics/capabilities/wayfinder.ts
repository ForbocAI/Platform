import type { Capability, StatsComponent } from "../../types";

export const WAYFINDER_CAPABILITIES: Record<string, Capability> = {
    "craft_strike": {
        id: "craft_strike",
        name: "Craft Strike",
        agentClass: "Wayfinder",
        description: "Powerful melee strike with craft tool.",
        magnitude: "1d8",
        effect: () => "Melee damage"
    },
    "lantern_dash": {
        id: "lantern_dash",
        name: "Lantern Dash",
        agentClass: "Wayfinder",
        description: "Rapid dash leaving lantern light trails.",
        effect: () => "Mobility boost"
    },
    "versatile_pack": {
        id: "versatile_pack",
        name: "Versatile Pack",
        agentClass: "Wayfinder",
        description: "Switch gear and tools to adapt to challenges.",
        effect: () => "Weapon switch"
    },
    "pollen_storm": {
        id: "pollen_storm",
        name: "Pollen Storm",
        agentClass: "Wayfinder",
        description: "Burst of pollen that disorients in a radius.",
        magnitude: "2d6 Nature",
        effect: () => "AoE Nature Damage"
    },
    "root_step": {
        id: "root_step",
        name: "Root Step",
        agentClass: "Wayfinder",
        description: "Step through root networks, becoming briefly intangible.",
        effect: () => "Immunity duration"
    },
    "hearth_flame": {
        id: "hearth_flame",
        name: "Hearth Flame",
        agentClass: "Wayfinder",
        description: "Draw warmth from hearth fires to empower attacks.",
        effect: (_a: StatsComponent, _d: StatsComponent) => "Buff on kill"
    },
    "lantern_trail": {
        id: "lantern_trail",
        name: "Lantern Trail",
        agentClass: "Wayfinder",
        description: "Leave glowing lantern marks along the path.",
        effect: (_a: StatsComponent, _d: StatsComponent) => "Burning trail"
    },
};
