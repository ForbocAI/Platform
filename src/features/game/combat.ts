import { StatsComponent, AgentNPC, AgentPlayer, Capability } from "./types";
import { calculateEffectiveStats } from "./items";
import { parseDiceString } from "./dice";
import { CAPABILITIES } from "./mechanics";

export interface CombatResult {
    hit: boolean;
    damage: number;
    roll: number;
    message: string;
}

/** Group Score modifier for crowd/ally support (Companion: "special abilities affecting a crowd contribute to Group Score"). */
export interface GroupScoreModifier {
    attackerBonus?: number;
    defenderBonus?: number;
}

/** Combat roll: d20 + modifier. Higher total wins. */
function rollCombatTotal(modifier = 0): number {
    const d20 = Math.floor(Math.random() * 20) + 1;
    return d20 + modifier;
}

export function resolveDuel(
    attacker: AgentPlayer,
    defender: AgentNPC,
    capabilityModifier = 0,
    groupScore?: GroupScoreModifier
): CombatResult {
    // Attacker roll
    let attackerTotal = rollCombatTotal(capabilityModifier);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    // Defender roll
    let defenderTotal = rollCombatTotal(0);
    defenderTotal += groupScore?.defenderBonus ?? 0;

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        const diff = attackerTotal - defenderTotal;
        // Base damage formula
        let damageRoll = Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1;
        damage = Math.max(1, damageRoll);
        message = `You land a heavy blow on ${defender.name} for ${damage} damage. (${attackerTotal} vs ${defenderTotal})`;
    } else {
        message = `You strike at ${defender.name} but they evade. Miss! (${attackerTotal} vs ${defenderTotal})`;
    }

    return {
        hit: isHit,
        damage,
        roll: attackerTotal,
        message,
    };
}

/** NPC attacks the player. Shadows of Fate: both roll d20 + Str + Agi + Arcane, higher wins. */
export function resolveNPCAttack(
    attacker: AgentNPC,
    defender: AgentPlayer,
    groupScore?: GroupScoreModifier
): CombatResult {
    const effectiveDefender = calculateEffectiveStats(defender);

    // AI Logic: Simple decision making
    // 60% chance to use capability if available
    let capability: Capability | undefined;
    if (attacker.capabilities && attacker.capabilities.learned.length > 0 && Math.random() < 0.6) {
        const capabilityId = attacker.capabilities.learned[Math.floor(Math.random() * attacker.capabilities.learned.length)];
        capability = CAPABILITIES[capabilityId];
    }

    // Roll Combat Total
    let attackerTotal = rollCombatTotal(0);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    let defenderTotal = rollCombatTotal(0);
    defenderTotal += groupScore?.defenderBonus ?? 0;

    // Defensive Bonus
    defenderTotal += effectiveDefender.defense ?? 0;

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        if (capability) {
            // Capability Attack
            if (capability.magnitude) {
                damage = parseDiceString(capability.magnitude);
            } else {
                // Fallback for utility capabilities or un-stat-ed capabilities
                const diff = attackerTotal - defenderTotal;
                damage = Math.floor(diff / 3) + 1;
            }
            damage = Math.max(1, damage);

            let effectMsg = "";
            if (capability.effect) {
                effectMsg = capability.effect(attacker.stats, effectiveDefender);
            }
            message = `${attacker.name} activates ${capability.name}! It hits you for ${damage} damage! ${effectMsg ? `(${effectMsg})` : ""}`;
        } else {
            // Basic Attack
            const diff = attackerTotal - defenderTotal;
            damage = Math.max(1, Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1);
            message = `${attacker.name} strikes you for ${damage} damage!`;
        }
    } else {
        if (capability) {
            message = `${attacker.name} tries to activate ${capability.name}, but you evade the effect!`;
        } else {
            message = `${attacker.name} attacks but you evade/block. Miss!`;
        }
    }

    return {
        hit: isHit,
        damage,
        roll: attackerTotal,
        message,
    };
}

export function resolveCapabilityDuel(
    attacker: AgentPlayer,
    defender: AgentNPC,
    capability: Capability,
    groupScore?: GroupScoreModifier
): CombatResult {
    const effectiveAttacker = calculateEffectiveStats(attacker);

    // Roll d20 vs d20
    let attackerTotal = rollCombatTotal(0);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    let defenderTotal = rollCombatTotal(0);
    defenderTotal += groupScore?.defenderBonus ?? 0;

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        // Calculate capability damage
        if (capability.magnitude) {
            damage = parseDiceString(capability.magnitude);
        } else {
            // Default if no damage string provided
            const diff = attackerTotal - defenderTotal;
            damage = Math.floor(diff / 3) + 1;
        }

        // Ensure at least 1 damage on hit
        damage = Math.max(1, damage);

        let effectMsg = "";
        if (capability.effect) {
            effectMsg = capability.effect(effectiveAttacker, defender.stats);
        }

        message = `You activate ${capability.name}! It hits for ${damage} damage. ${effectMsg ? `(${effectMsg})` : ""}`;

    } else {
        message = `You activate ${capability.name} but ${defender.name} resists! Miss! (${attackerTotal} vs ${defenderTotal})`;
    }

    return {
        hit: isHit,
        damage,
        roll: attackerTotal,
        message,
    };
}

export function resolveCompanionAttack(
    companion: { name: string },
    defender: AgentNPC,
    groupScore?: GroupScoreModifier
): CombatResult {
    let attackerTotal = rollCombatTotal(0);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    let defenderTotal = rollCombatTotal(0);
    defenderTotal += groupScore?.defenderBonus ?? 0;

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        const diff = attackerTotal - defenderTotal;
        damage = Math.max(1, Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1);
        message = `${companion.name} attacks ${defender.name} for ${damage} damage!`;
    } else {
        message = `${companion.name} attacks ${defender.name} but misses.`;
    }

    return { hit: isHit, damage, roll: attackerTotal, message };
}

export interface SurvivorDefender {
    name: string;
    defense: number;
}

export const resolveNPCAttackOnCompanion = (
    attacker: AgentNPC,
    defender: SurvivorDefender
): { hit: boolean; damage: number; message: string } => {
    const attackerTotal = (attacker.stats.hp / attacker.stats.maxHp) * 20 + (Math.random() * 10);
    const defenderTotal = defender.defense + (Math.random() * 5);
    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        const diff = attackerTotal - defenderTotal;
        damage = Math.max(1, Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1);
        message = `${attacker.name} strikes ${defender.name} for ${damage} damage!`;
    } else {
        message = `${attacker.name} attacks ${defender.name} but misses!`;
    }

    return { hit: isHit, damage, message };
}
