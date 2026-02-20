import type { Capability, StatsComponent } from "../../types";

export const DOOMGUARD_CAPABILITIES: Record<string, Capability> = {
    "hellfire_explosion": {
        id: "hellfire_explosion",
        name: "Hellfire Explosion",
        agentClass: "Doomguard",
        description: "Evoke fire from hell exploding nearby.",
        magnitude: "3d6 Fire",
        effect: () => "AoE Fire Damage"
    },
    "dreadful_charge": {
        id: "dreadful_charge",
        name: "Dreadful Charge",
        agentClass: "Doomguard",
        description: "Bludgeoning charge closing gap.",
        magnitude: "1d10",
        effect: () => "Charge Damage"
    },
    "explosive_barrage": {
        id: "explosive_barrage",
        name: "Explosive Barrage",
        agentClass: "Doomguard",
        description: "Barrage of ranged death attacks.",
        magnitude: "2d6 AoE",
        effect: (_a: StatsComponent, _d: StatsComponent) => "AoE"
    },
    "sword_attacks": {
        id: "sword_attacks",
        name: "Sword Attack",
        agentClass: "Doomguard",
        description: "Standard sword strike.",
        magnitude: "1d8",
        effect: () => "Melee Damage"
    },
    "ranged_explosive_attacks": {
        id: "ranged_explosive_attacks",
        name: "Ranged Explosive",
        agentClass: "Doomguard",
        description: "Explosive projectile thrown at range.",
        magnitude: "2d6",
        effect: () => "AoE Damage"
    },
    "shielded_bastion_stance": {
        id: "shielded_bastion_stance",
        name: "Shielded Bastion Stance",
        agentClass: "Doomguard",
        description: "Defensive stance reducing incoming damage.",
        effect: () => "Defense Buff"
    },
    "infernal_overdrive_assault": {
        id: "infernal_overdrive_assault",
        name: "Infernal Overdrive Assault",
        agentClass: "Doomguard",
        description: "Enhance attack speed and fury.",
        effect: () => "Attack Speed Buff"
    },
    "demonic_resilience": {
        id: "demonic_resilience",
        name: "Demonic Resilience",
        agentClass: "Doomguard",
        description: "Regenerate health gradually.",
        effect: () => "Regeneration"
    },
    "dark_ward_aura": {
        id: "dark_ward_aura",
        name: "Dark Ward Aura",
        agentClass: "Doomguard",
        description: "Defensive bonus to nearby allies.",
        effect: () => "Aura Buff"
    },
    "cursed_chains": {
        id: "cursed_chains",
        name: "Cursed Chains",
        agentClass: "Doomguard",
        description: "Restrict movement of enemies.",
        effect: () => "Immobilize"
    },
    "dreadlords_command": {
        id: "dreadlords_command",
        name: "Dreadlord's Command",
        agentClass: "Doomguard",
        description: "Inspire allies, boosting morale.",
        effect: () => "Buff Allies"
    },
    "ripping_blade_slash": {
        id: "ripping_blade_slash",
        name: "Ripping Blade Slash",
        agentClass: "Doomguard",
        description: "Searing jagged blade slash.",
        magnitude: "1d8",
        effect: (_a: StatsComponent, _d: StatsComponent) => "Fire/melee"
    },
};
