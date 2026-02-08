import { Stats, Enemy, Player } from "./types";

export interface CombatResult {
    hit: boolean;
    damage: number;
    roll: number;
    message: string;
}

/** Shadows of Fate: d20 + Str + Agi + Arcane + optional spell modifier. Higher total wins. */
function rollCombatTotal(stats: Stats, spellModifier = 0): number {
    const d20 = Math.floor(Math.random() * 20) + 1;
    return d20 + stats.Str + stats.Agi + stats.Arcane + spellModifier;
}

export function resolveDuel(attacker: Stats, defender: Enemy, spellModifier = 0): CombatResult {
    const attackerTotal = rollCombatTotal(attacker, spellModifier);
    const defenderTotal = rollCombatTotal(defender);

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        const diff = attackerTotal - defenderTotal;
        damage = Math.max(1, Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1);
        message = `You land a heavy blow on ${defender.name} for ${damage} damage. (${attackerTotal} vs ${defenderTotal})`;
    } else {
        message = `You swing at ${defender.name} but the Shadows guide their movement. Miss! (${attackerTotal} vs ${defenderTotal})`;
    }

    return {
        hit: isHit,
        damage,
        roll: attackerTotal,
        message,
    };
}

/** Enemy attacks the player. Shadows of Fate: both roll d20 + Str + Agi + Arcane, higher wins. */
export function resolveEnemyAttack(attacker: Enemy, defender: Player): CombatResult {
    const attackerTotal = rollCombatTotal(attacker);
    const defenderTotal = rollCombatTotal(defender);

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        const diff = attackerTotal - defenderTotal;
        damage = Math.max(1, Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1);
        message = `${attacker.name} strikes you for ${damage} damage!`;
    } else {
        message = `${attacker.name} attacks but you evade. Miss!`;
    }

    return {
        hit: isHit,
        damage,
        roll: attackerTotal,
        message,
    };
}
