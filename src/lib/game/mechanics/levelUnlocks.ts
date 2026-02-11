import type { CharacterClass } from "@/features/game/types";

export const LEVEL_SKILL_UNLOCKS: Partial<Record<CharacterClass, Partial<Record<number, string>>>> = {
    Ashwalker: { 12: "keen_senses", 14: "ember_veil", 16: "scout_instinct" },
    "Obsidian Warden": { 13: "stone_skin", 15: "warden_resolve", 17: "obsidian_aura" },
    Doomguard: { 13: "battle_fervor", 15: "hellfire_blood", 17: "dread_presence" },
    "Iron Armored Guardian": { 12: "iron_will", 14: "shield_bash" },
    "Aether Spirit": { 12: "astral_sight", 14: "phase_step" },
};

export function getSkillUnlockForLevel(characterClass: CharacterClass, level: number): string | null {
    const byClass = LEVEL_SKILL_UNLOCKS[characterClass];
    if (!byClass) return null;
    return byClass[level] ?? null;
}

export function getSkillsForLevels(characterClass: CharacterClass, level: number): string[] {
    const skills: string[] = [];
    for (let l = 1; l <= level; l++) {
        const skill = getSkillUnlockForLevel(characterClass, l);
        if (skill && !skills.includes(skill)) skills.push(skill);
    }
    return skills;
}
