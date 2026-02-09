import { Stats, Enemy, Player, Spell } from "./types";
import { calculateEffectiveStats } from "./items";
import { parseDiceString } from "./dice";

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

/** Shadows of Fate: d20 + Str + Agi + Arcane + optional spell modifier. Higher total wins. */
function rollCombatTotal(stats: Stats, spellModifier = 0): number {
    const d20 = Math.floor(Math.random() * 20) + 1;
    return d20 + stats.Str + stats.Agi + stats.Arcane + spellModifier;
}

export function resolveDuel(
    attacker: Player,
    defender: Enemy,
    spellModifier = 0,
    groupScore?: GroupScoreModifier
): CombatResult {
    const effectiveAttacker = calculateEffectiveStats(attacker);

    // Attacker roll
    let attackerTotal = rollCombatTotal(effectiveAttacker, spellModifier);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    // Defender roll
    let defenderTotal = rollCombatTotal(defender);
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

    let attackerTotal = rollCombatTotal(attacker);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    let defenderTotal = rollCombatTotal(effectiveDefender);
    defenderTotal += groupScore?.defenderBonus ?? 0;

    // Check vs AC? 
    // The previous logic was contest roll. 
    // "higher total wins"
    // Also AC is in Stats now. Should AC be a threshold or modifier?
    // Familiar doc doesn't explicitly specify AC vs Dodge. 
    // "Shadows of Fate: d20 + Str + Agi + Arcane + optional spell modifier. Higher total wins."
    // Let's stick to contest roll for now. If Defender wins, it's a miss/block.

    // Maybe AC adds to the defender total?
    // Let's add AC to defender's total for defensive rolls.
    defenderTotal += effectiveDefender.ac ?? 0;

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        const diff = attackerTotal - defenderTotal;
        damage = Math.max(1, Math.floor(diff / 3) + Math.floor(Math.random() * 4) + 1);
        message = `${attacker.name} strikes you for ${damage} damage!`;
    } else {
        message = `${attacker.name} attacks but you evade/block. Miss!`;
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

    // Roll d20 + Total Stats vs Defender Total Stats
    let attackerTotal = rollCombatTotal(effectiveAttacker, 0);
    attackerTotal += groupScore?.attackerBonus ?? 0;

    let defenderTotal = rollCombatTotal(defender);
    defenderTotal += groupScore?.defenderBonus ?? 0;

    const isHit = attackerTotal > defenderTotal;
    let damage = 0;
    let message = "";

    if (isHit) {
        // Calculate spell damage
        if (spell.damage) {
            damage = parseDiceString(spell.damage, effectiveAttacker);
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
