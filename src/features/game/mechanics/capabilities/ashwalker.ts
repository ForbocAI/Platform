import type { Capability } from "../../types";

export const ASHWALKER_CAPABILITIES: Record<string, Capability> = {
    "relic_strike": {
        id: "relic_strike",
        name: "Relic Strike",
        agentClass: "Ashwalker",
        description: "Powerful melee strike with ancient relic.",
        magnitude: "1d8",
        effect: () => "Melee damage"
    },
    "ember_dash": {
        id: "ember_dash",
        name: "Ember Dash",
        agentClass: "Ashwalker",
        description: "Rapid dash leaving ember trails.",
        effect: () => "Mobility boost"
    },
    "smoldering_arsenal": {
        id: "smoldering_arsenal",
        name: "Smoldering Arsenal",
        agentClass: "Ashwalker",
        description: "Switch weapons to adapt to foes.",
        effect: () => "Weapon switch"
    },
    "ignition_burst": {
        id: "ignition_burst",
        name: "Ignition Burst",
        agentClass: "Ashwalker",
        description: "Burst of fiery malevolence in radius.",
        magnitude: "2d6 Fire",
        effect: () => "AoE Fire Damage"
    },
    "inferno_step": {
        id: "inferno_step",
        name: "Inferno Step",
        agentClass: "Ashwalker",
        description: "Step into ethereal plane, intangible.",
        effect: () => "Immunity duration"
    },
    "eternal_flame": {
        id: "eternal_flame",
        name: "Eternal Flame",
        agentClass: "Ashwalker",
        description: "Absorb residual life after killing, empower attacks.",
        effect: (_a, _d) => "Buff on kill"
    },
    "blazing_trail": {
        id: "blazing_trail",
        name: "Blazing Trail",
        agentClass: "Ashwalker",
        description: "Leave magikal flames in wake.",
        effect: (_a, _d) => "Burning trail"
    },
};
