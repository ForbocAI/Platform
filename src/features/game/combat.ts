import { Stats, Enemy, Player, Spell } from "./types";
import { calculateEffectiveStats } from "./items";
import { parseDiceString } from "./dice";
import { SPELLS } from "./mechanics";

export interface CombatResult {
    hit: boolean;
    damage: number;
    roll: number;
    message: string;
}

/** Group Score modifier for crowd/ally support (Familiar: "special abilities affecting a crowd contribute to Group Score"). */
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
    attacker: Player,
    defender: Enemy,
    spellModifier = 0,
    groupScore?: GroupScoreModifier
): CombatResult {
    // Attacker roll
    let attackerTotal = rollCombatTotal(spellModifier);
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
export function resolveEnemyAttack(
    attacker: Enemy,
    defender: Player,
    groupScore?: GroupScoreModifier
): CombatResult {
    const effectiveDefender = calculateEffectiveStats(defender);

    // AI Logic: Simple decision making
    // 60% chance to use ability if available
    let spell: Spell | undefined;
    if (attacker.spells && attacker.spells.length > 0 && Math.random() < 0.6) {
        const spellId = attacker.spells[Math.floor(Math.random() * attacker.spells.length)];
        spell = SPELLS[spellId];
    }

    // Roll Combat Total
    let attackerTotal = rollCombatTotal(0);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    let defenderTotal = rollCombatTotal(0);
    defenderTotal += groupScore?.defenderBonus ?? 0;

    // AC Defensive Bonus
    defenderTotal += effectiveDefender.ac ?? 0;

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        if (spell) {
            // Spell Attack
            if (spell.damage) {
                damage = parseDiceString(spell.damage);
            } else {
                // Fallback for utility spells or un-stat-ed spells
                const diff = attackerTotal - defenderTotal;
                damage = Math.floor(diff / 3) + 1;
            }
            damage = Math.max(1, damage);

            let effectMsg = "";
            if (spell.effect) {
                effectMsg = spell.effect(attacker, effectiveDefender);
            }
            message = `${attacker.name} casts ${spell.name}! It hits you for ${damage} damage! ${effectMsg ? `(${effectMsg})` : ""}`;
        } else {
            // Basic Attack
            const diff = attackerTotal - defenderTotal;
            damage = Math.max(1, Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1);
            message = `${attacker.name} strikes you for ${damage} damage!`;
        }
    } else {
        if (spell) {
            message = `${attacker.name} tries to cast ${spell.name}, but you evade the effect!`;
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

export function resolveSpellDuel(
    attacker: Player,
    defender: Enemy,
    spell: Spell,
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
        // Calculate spell damage
        if (spell.damage) {
            damage = parseDiceString(spell.damage);
        } else {
            // Default if no damage string provided (e.g. basic magic missle equivalent)
            const diff = attackerTotal - defenderTotal;
            damage = Math.floor(diff / 3) + 1;
        }

        // Ensure at least 1 damage on hit
        damage = Math.max(1, damage);

        let effectMsg = "";
        if (spell.effect) {
            effectMsg = spell.effect(effectiveAttacker, defender);
        }

        message = `You cast ${spell.name}! It hits for ${damage} damage. ${effectMsg ? `(${effectMsg})` : ""}`;

    } else {
        message = `You cast ${spell.name} but ${defender.name} resists! Miss! (${attackerTotal} vs ${defenderTotal})`;
    }

    return {
        hit: isHit,
        damage,
        roll: attackerTotal,
        message,
    };
}

export function resolveServitorAttack(
    servitor: { name: string },
    defender: Enemy,
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
        message = `${servitor.name} attacks ${defender.name} for ${damage} damage!`;
    } else {
        message = `${servitor.name} attacks ${defender.name} but misses.`;
    }

    return { hit: isHit, damage, roll: attackerTotal, message };
}

export function resolveEnemyAttackOnServitor(
    attacker: Enemy,
    defender: { name: string; ac?: number },
    groupScore?: GroupScoreModifier
): CombatResult {
    let attackerTotal = rollCombatTotal(0);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    let defenderTotal = rollCombatTotal(0);
    defenderTotal += groupScore?.defenderBonus ?? 0;
    // Servitors don't usually have AC yet, but if they do, add it
    defenderTotal += defender.ac ?? 0;
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

    return { hit: isHit, damage, roll: attackerTotal, message };
}
