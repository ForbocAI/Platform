import type { Capability, StatsComponent } from "../../types";

export const BRIDGEKEEPER_CAPABILITIES: Record<string, Capability> = {
    "root_stone_sheltering": {
        id: "root_stone_sheltering",
        name: "Root-Stone Sheltering",
        agentClass: "Bridgekeeper",
        description: "Form protective stone arches around allies, reducing incoming weather damage.",
        effect: (_attacker: StatsComponent) => "Buff stats"
    },
    "granite_shell": {
        id: "granite_shell",
        name: "Granite Shell",
        agentClass: "Bridgekeeper",
        description: "Encase in impenetrable moss-covered shell, becoming immovable.",
        effect: () => "Invulnerability"
    },
    "reflective_warmth": {
        id: "reflective_warmth",
        name: "Reflective Warmth",
        agentClass: "Bridgekeeper",
        description: "Project reflective glow of lantern-light, redirecting gusts back toward source.",
        effect: (_a: StatsComponent, _d: StatsComponent) => "Reduce incoming damage"
    },
    "rootslam": {
        id: "rootslam",
        name: "Rootslam",
        agentClass: "Bridgekeeper",
        description: "Stamp stone form into the ground, creating gentle rumbles that nudge back pests.",
        magnitude: "3d6",
        effect: () => "AoE Knockback"
    },
    "steady_resonance": {
        id: "steady_resonance",
        name: "Steady Resonance",
        agentClass: "Bridgekeeper",
        description: "Attune to stone foundations to calm turbulent magic and settle disruptions.",
        effect: () => "Reflect Ranged"
    },
    "restoration_circle": {
        id: "restoration_circle",
        name: "Restoration Circle",
        agentClass: "Bridgekeeper",
        description: "Nearby allies perform a restoration circle, bringing the tired Keeper back to work.",
        effect: () => "Revive"
    },
    "stone_echo": {
        id: "stone_echo",
        name: "Stone Echo",
        agentClass: "Bridgekeeper",
        description: "Leave gentle stone echoes that linger on the path, sheltering nearby travelers.",
        effect: () => "Summon Echo"
    },
    "creek_stone_embrace": {
        id: "creek_stone_embrace",
        name: "Creek-Stone Embrace",
        agentClass: "Bridgekeeper",
        description: "Root travelers safely in place with gentle stone walls for a rest cycle.",
        effect: () => "Magic Resist"
    },
    "pebble_toss": {
        id: "pebble_toss",
        name: "Pebble Toss",
        agentClass: "Bridgekeeper",
        description: "Send a volley of smooth polished stones, dealing moderate nudging force.",
        effect: () => "Immobilize"
    },
    "granite_surge": {
        id: "granite_surge",
        name: "Granite Surge",
        agentClass: "Bridgekeeper",
        description: "Channel patient power within stone to enhance strength, speed, and resilience.",
        magnitude: "2d6",
        effect: (_a: StatsComponent, _d: StatsComponent) => "Piercing"
    },
};
