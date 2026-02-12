import type { Spell } from "../../types";

export const ASHWALKER_SPELLS: Record<string, Spell> = {
    "relic_strike": {
        id: "relic_strike",
        name: "Relic Strike",
        class: "Ashwalker",
        description: "Powerful melee strike with ancient relic.",
        damage: "1d8",
        effect: () => "Melee damage"
    },
    "ember_dash": {
        id: "ember_dash",
        name: "Ember Dash",
        class: "Ashwalker",
        description: "Rapid dash leaving ember trails.",
        effect: () => "Mobility boost"
    },
    "smoldering_arsenal": {
        id: "smoldering_arsenal",
        name: "Smoldering Arsenal",
        class: "Ashwalker",
        description: "Switch weapons to adapt to foes.",
        effect: () => "Weapon switch"
    },
    "ignition_burst": {
        id: "ignition_burst",
        name: "Ignition Burst",
        class: "Ashwalker",
        description: "Burst of fiery malevolence in radius.",
        damage: "2d6 Fire",
        effect: () => "AoE Fire Damage"
    },
    "inferno_step": {
        id: "inferno_step",
        name: "Inferno Step",
        class: "Ashwalker",
        description: "Step into ethereal plane, intangible.",
        effect: () => "Immunity duration"
    },
    "eternal_flame": {
        id: "eternal_flame",
        name: "Eternal Flame",
        class: "Ashwalker",
        description: "Absorb residual life after killing, empower attacks.",
        effect: (_a, _d) => "Buff on kill"
    },
    "blazing_trail": {
        id: "blazing_trail",
        name: "Blazing Trail",
        class: "Ashwalker",
        description: "Leave magikal flames in wake.",
        effect: (_a, _d) => "Burning trail"
    },
};
