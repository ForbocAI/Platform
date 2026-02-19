import type { RegionalType } from "../../types";
import { ASHWALKER_CAPABILITIES } from "./ashwalker";
import { OBSIDIAN_WARDEN_CAPABILITIES } from "./obsidianWarden";
import { DOOMGUARD_CAPABILITIES } from "./doomguard";
import { TECH_CLASS_CAPABILITIES } from "./techClasses";
import { MYSTICAL_CLASS_CAPABILITIES } from "./mysticalClasses";
import { ENEMY_CAPABILITIES } from "./enemies";

// Combine all capabilities into a single record
export const CAPABILITIES = {
    ...ASHWALKER_CAPABILITIES,
    ...OBSIDIAN_WARDEN_CAPABILITIES,
    ...DOOMGUARD_CAPABILITIES,
    ...TECH_CLASS_CAPABILITIES,
    ...MYSTICAL_CLASS_CAPABILITIES,
    ...ENEMY_CAPABILITIES,
};

export const LEVEL_CAPABILITY_UNLOCKS: Record<string, Record<number, string>> = {
    Ashwalker: {
        13: "smoldering_arsenal",
        14: "inferno_step",
        15: "eternal_flame",
        16: "blazing_trail",
    },
    "Obsidian Warden": { 14: "death_shard_strike" },
    Doomguard: { 14: "ripping_blade_slash" },
};

export function getCapabilityUnlockForLevel(agentClass: string, level: number): string | null {
    const byClass = LEVEL_CAPABILITY_UNLOCKS[agentClass];
    if (!byClass) return null;
    return byClass[level] ?? null;
}
