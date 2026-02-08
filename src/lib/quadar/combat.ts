import { Stats, Enemy, Player } from "./types";

export interface CombatResult {
    hit: boolean;
    damage: number;
    roll: number;
    message: string;
}

export function resolveDuel(attacker: Stats, defender: Enemy): CombatResult {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const attackBonus = Math.floor((attacker.Str + attacker.Agi + attacker.Arcane) / 10);
    const totalAttack = d20 + attackBonus;

    const isHit = totalAttack >= defender.ac;
    let damage = 0;
    let message = "";

    if (isHit) {
        // Damage logic: Base + random factor
        damage = Math.floor(Math.random() * 10) + attackBonus + 1;
        message = `Critical hit! You land a heavy blow on ${defender.name} for ${damage} damage.`;
    } else {
        message = `You swing at ${defender.name} but the Shadows guide their movement. Miss!`;
    }

    return {
        hit: isHit,
        damage,
        roll: totalAttack,
        message,
    };
}

/** Enemy attacks the player; defender must have ac and name. */
export function resolveEnemyAttack(attacker: Enemy, defender: Player): CombatResult {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const attackBonus = Math.floor((attacker.Str + attacker.Agi + attacker.Arcane) / 10);
    const totalAttack = d20 + attackBonus;

    const isHit = totalAttack >= defender.ac;
    let damage = 0;
    let message = "";

    if (isHit) {
        damage = Math.floor(Math.random() * 10) + attackBonus + 1;
        message = `${attacker.name} strikes you for ${damage} damage!`;
    } else {
        message = `${attacker.name} attacks but you evade. Miss!`;
    }

    return {
        hit: isHit,
        damage,
        roll: totalAttack,
        message,
    };
}
