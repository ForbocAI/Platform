import { WAYFINDER_CAPABILITIES } from "./wayfinder";
import { BRIDGEKEEPER_CAPABILITIES } from "./bridgekeeper";
import { THORNWARDEN_CAPABILITIES } from "./thornwarden";
import { TECH_CLASS_CAPABILITIES } from "./techClasses";
import { MYSTICAL_CLASS_CAPABILITIES } from "./mysticalClasses";
import { ENEMY_CAPABILITIES } from "./enemies";

export const CAPABILITIES = {
    ...WAYFINDER_CAPABILITIES,
    ...BRIDGEKEEPER_CAPABILITIES,
    ...THORNWARDEN_CAPABILITIES,
    ...TECH_CLASS_CAPABILITIES,
    ...MYSTICAL_CLASS_CAPABILITIES,
    ...ENEMY_CAPABILITIES,
};

export const LEVEL_CAPABILITY_UNLOCKS: Record<string, Record<number, string>> = {
    Wayfinder: {
        13: "versatile_pack",
        14: "root_step",
        15: "hearth_flame",
        16: "lantern_trail",
    },
    "Bridgekeeper": { 14: "granite_surge" },
    Thornwarden: { 14: "thorn_lash" },
};

export function getCapabilityUnlockForLevel(agentClass: string, level: number): string | null {
    const byClass = LEVEL_CAPABILITY_UNLOCKS[agentClass];
    if (!byClass) return null;
    return byClass[level] ?? null;
}
