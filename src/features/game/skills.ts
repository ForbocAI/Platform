import type { Room } from "./types";

/** Bonus damage dealt to enemies when player has battle_fervor. */
const BATTLE_FERVOR_BONUS = 2;

/** Damage reduction from incoming attacks when player has stone_skin. */
const STONE_SKIN_REDUCTION = 2;

/**
 * Apply skill-based bonus to damage dealt to enemies (e.g. battle_fervor).
 */
import type { StatusEffect } from "./types";

/**
 * Apply skill-based bonus to damage dealt to enemies (e.g. battle_fervor).
 */
export function applyDamageDealtBonus(skills: string[], activeEffects: StatusEffect[] | undefined, damage: number): number {
    let finalDamage = damage;
    if (damage <= 0) return damage;
    if (skills.includes("battle_fervor")) finalDamage += BATTLE_FERVOR_BONUS;

    if (activeEffects) {
        for (const effect of activeEffects) {
            if (effect.damageBonus) {
                finalDamage += effect.damageBonus;
            }
        }
    }
    return finalDamage;
}

/**
 * Apply skill-based reduction to damage taken from enemies (e.g. stone_skin).
 */
export function applyDamageTakenReduction(skills: string[], damage: number): number {
    if (damage <= 0) return damage;
    if (skills.includes("stone_skin")) return Math.max(0, damage - STONE_SKIN_REDUCTION);
    return damage;
}

/**
 * Extra scan line when player has keen_senses. Reveals a hidden detail about the room.
 */
export function getKeenSensesScanExtra(room: Room): string {
    const parts: string[] = [];
    if (room.hazards.length > 0) {
        parts.push(`Hazard intensity: heightened in this sector.`);
    }
    if (room.enemies.length > 0) {
        parts.push(`You sense the combat readiness of ${room.enemies.length} hostile(s).`);
    }
    if (room.merchants && room.merchants.length > 0) {
        parts.push(`Faint trade signatures detected.`);
    }
    if (room.allies && room.allies.length > 0) {
        parts.push(`Allied presence: friendly.`);
    }
    if (parts.length === 0) {
        parts.push(`Ambient void-stability: nominal.`);
    }
    return `[Keen Senses] ${parts.join(" ")}`;
}
