import type { Spell, Stats } from "../../types";

export const DOOMGUARD_SPELLS: Record<string, Spell> = {
    "hellfire_explosion": {
        id: "hellfire_explosion",
        name: "Hellfire Explosion",
        class: "Doomguard",
        description: "Evoke fire from hell exploding nearby.",
        damage: "3d6 Fire",
        effect: () => "AoE Fire Damage"
    },
    "dreadful_charge": {
        id: "dreadful_charge",
        name: "Dreadful Charge",
        class: "Doomguard",
        description: "Bludgeoning charge closing gap.",
        damage: "1d10",
        effect: () => "Charge Damage"
    },
    "explosive_barrage": {
        id: "explosive_barrage",
        name: "Explosive Barrage",
        class: "Doomguard",
        description: "Barrage of ranged death attacks.",
        damage: "2d6 AoE",
        effect: (_a: Stats, _d: Stats) => "AoE"
    },
    "sword_attacks": {
        id: "sword_attacks",
        name: "Sword Attack",
        class: "Doomguard",
        description: "Standard sword strike.",
        damage: "1d8",
        effect: () => "Melee Damage"
    },
    "ranged_explosive_attacks": {
        id: "ranged_explosive_attacks",
        name: "Ranged Explosive",
        class: "Doomguard",
        description: "Explosive projectile thrown at range.",
        damage: "2d6",
        effect: () => "AoE Damage"
    },
    "shielded_bastion_stance": {
        id: "shielded_bastion_stance",
        name: "Shielded Bastion Stance",
        class: "Doomguard",
        description: "Defensive stance reducing incoming damage.",
        effect: () => "Defense Buff"
    },
    "infernal_overdrive_assault": {
        id: "infernal_overdrive_assault",
        name: "Infernal Overdrive Assault",
        class: "Doomguard",
        description: "Enhance attack speed and fury.",
        effect: () => "Attack Speed Buff"
    },
    "demonic_resilience": {
        id: "demonic_resilience",
        name: "Demonic Resilience",
        class: "Doomguard",
        description: "Regenerate health gradually.",
        effect: () => "Regeneration"
    },
    "dark_ward_aura": {
        id: "dark_ward_aura",
        name: "Dark Ward Aura",
        class: "Doomguard",
        description: "Defensive bonus to nearby allies.",
        effect: () => "Aura Buff"
    },
    "cursed_chains": {
        id: "cursed_chains",
        name: "Cursed Chains",
        class: "Doomguard",
        description: "Restrict movement of enemies.",
        effect: () => "Immobilize"
    },
    "dreadlords_command": {
        id: "dreadlords_command",
        name: "Dreadlord's Command",
        class: "Doomguard",
        description: "Inspire allies, boosting morale.",
        effect: () => "Buff Allies"
    },
    "ripping_blade_slash": {
        id: "ripping_blade_slash",
        name: "Ripping Blade Slash",
        class: "Doomguard",
        description: "Searing jagged blade slash.",
        damage: "1d8",
        effect: (_a: Stats, _d: Stats) => "Fire/melee"
    },
};
