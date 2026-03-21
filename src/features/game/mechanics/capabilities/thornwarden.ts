import type { Capability, StatsComponent } from "../../types";

export const THORNWARDEN_CAPABILITIES: Record<string, Capability> = {
    "seedstorm": {
        id: "seedstorm",
        name: "Seedstorm",
        agentClass: "Thornwarden",
        description: "Burst of swirling seeds that blankets the area.",
        magnitude: "3d6 Nature",
        effect: () => "AoE Nature Damage"
    },
    "briar_charge": {
        id: "briar_charge",
        name: "Briar Charge",
        agentClass: "Thornwarden",
        description: "Thorny charge closing gap with bramble momentum.",
        magnitude: "1d10",
        effect: () => "Charge Damage"
    },
    "seed_bomb_tosses": {
        id: "seed_bomb_tosses",
        name: "Seed-Bomb Tosses",
        agentClass: "Thornwarden",
        description: "Volley of packed seed-bombs at range.",
        magnitude: "2d6 AoE",
        effect: (_a: StatsComponent, _d: StatsComponent) => "AoE"
    },
    "staff_sweeps": {
        id: "staff_sweeps",
        name: "Staff Sweeps",
        agentClass: "Thornwarden",
        description: "Standard staff sweep attack.",
        magnitude: "1d8",
        effect: () => "Melee Damage"
    },
    "bloom_burst": {
        id: "bloom_burst",
        name: "Bloom Burst",
        agentClass: "Thornwarden",
        description: "Explosive bloom projectile tossed at range.",
        magnitude: "2d6",
        effect: () => "AoE Damage"
    },
    "bark_bastion_stance": {
        id: "bark_bastion_stance",
        name: "Bark Bastion Stance",
        agentClass: "Thornwarden",
        description: "Defensive bark stance reducing incoming damage.",
        effect: () => "Defense Buff"
    },
    "verdant_rush": {
        id: "verdant_rush",
        name: "Verdant Rush",
        agentClass: "Thornwarden",
        description: "Enhance speed with a burst of verdant energy.",
        effect: () => "Attack Speed Buff"
    },
    "root_resilience": {
        id: "root_resilience",
        name: "Root Resilience",
        agentClass: "Thornwarden",
        description: "Regenerate health gradually through root connection.",
        effect: () => "Regeneration"
    },
    "shelter_aura": {
        id: "shelter_aura",
        name: "Shelter Aura",
        agentClass: "Thornwarden",
        description: "Defensive bonus to nearby allies through sheltering presence.",
        effect: () => "Aura Buff"
    },
    "vine_binding": {
        id: "vine_binding",
        name: "Vine Binding",
        agentClass: "Thornwarden",
        description: "Restrict movement with tangling vines.",
        effect: () => "Immobilize"
    },
    "wardens_call": {
        id: "wardens_call",
        name: "Warden's Call",
        agentClass: "Thornwarden",
        description: "Inspire allies, boosting morale with a rallying call.",
        effect: () => "Buff Allies"
    },
    "thorn_lash": {
        id: "thorn_lash",
        name: "Thorn Lash",
        agentClass: "Thornwarden",
        description: "Quick lash of thorny vine strike.",
        magnitude: "1d8",
        effect: (_a: StatsComponent, _d: StatsComponent) => "Nature/melee"
    },
};
