import type { AgentClass } from "../types";

export const LEVEL_SKILL_UNLOCKS: Partial<Record<AgentClass, Partial<Record<number, string>>>> = {
    Wayfinder: { 12: "keen_senses", 14: "leaf_veil", 16: "scout_instinct" },
    "Bridgekeeper": { 13: "stone_skin", 15: "keeper_resolve", 17: "granite_aura" },
    Thornwarden: { 13: "garden_fervor", 15: "sap_flow", 17: "shelter_presence" },
    "Ironbark Sentinel": { 12: "ironbark_will", 14: "root_bash" },
    "Mist Drifter": { 12: "mist_sight", 14: "drift_step" },
};

export function getSkillUnlockForLevel(agentClass: AgentClass, level: number): string | null {
    const byClass = LEVEL_SKILL_UNLOCKS[agentClass];
    if (!byClass) return null;
    return byClass[level] ?? null;
}

export function getSkillsForLevels(agentClass: AgentClass, level: number): string[] {
    const skills: string[] = [];
    for (let l = 1; l <= level; l++) {
        const skill = getSkillUnlockForLevel(agentClass, l);
        if (skill && !skills.includes(skill)) skills.push(skill);
    }
    return skills;
}
