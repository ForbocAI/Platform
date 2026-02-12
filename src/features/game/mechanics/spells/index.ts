import type { CharacterClass } from "../../types";
import { ASHWALKER_SPELLS } from "./ashwalker";
import { OBSIDIAN_WARDEN_SPELLS } from "./obsidianWarden";
import { DOOMGUARD_SPELLS } from "./doomguard";
import { TECH_CLASS_SPELLS } from "./techClasses";
import { MYSTICAL_CLASS_SPELLS } from "./mysticalClasses";
import { ENEMY_SPELLS } from "./enemies";

// Combine all spells into a single record
export const SPELLS = {
    ...ASHWALKER_SPELLS,
    ...OBSIDIAN_WARDEN_SPELLS,
    ...DOOMGUARD_SPELLS,
    ...TECH_CLASS_SPELLS,
    ...MYSTICAL_CLASS_SPELLS,
    ...ENEMY_SPELLS,
};

export const LEVEL_SPELL_UNLOCKS: Partial<Record<CharacterClass, Partial<Record<number, string>>>> = {
    Ashwalker: {
        13: "smoldering_arsenal",
        14: "inferno_step",
        15: "eternal_flame",
        16: "blazing_trail",
    },
    "Obsidian Warden": { 14: "death_shard_strike" },
    Doomguard: { 14: "ripping_blade_slash" },
};

export function getSpellUnlockForLevel(characterClass: CharacterClass, level: number): string | null {
    const byClass = LEVEL_SPELL_UNLOCKS[characterClass];
    if (!byClass) return null;
    return byClass[level] ?? null;
}
