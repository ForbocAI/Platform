/**
 * Helper functions for combat thunks
 */

export interface SpellEffectFlags {
    isAoE: boolean;
    isBuff: boolean;
    isInvuln: boolean;
    isHeal: boolean;
    isLifeSteal: boolean;
    isSummon: boolean;
    isImmobilize: boolean;
    isStun: boolean;
    isConfuse: boolean;
    isFear: boolean;
    isBurn: boolean;
    isBuffDamage: boolean;
}

/**
 * Parse spell effect string to determine effect flags
 */
export function parseSpellEffect(effectStr: string): SpellEffectFlags {
    const lower = effectStr.toLowerCase();
    return {
        isAoE: lower.includes("aoe"),
        isBuff: lower.includes("buff") || lower.includes("aura") || lower.includes("defense") || lower.includes("evasion"),
        isInvuln: lower.includes("invulnerability"),
        isHeal: lower.includes("regeneration") || lower.includes("heal"),
        isLifeSteal: lower.includes("life steal"),
        isSummon: lower.includes("summon"),
        isImmobilize: lower.includes("immobilize"),
        isStun: lower.includes("stun"),
        isConfuse: lower.includes("confuse"),
        isFear: lower.includes("fear"),
        isBurn: lower.includes("burn"),
        isBuffDamage: lower.includes("buff damage"),
    };
}

/**
 * Create player status update based on spell effect
 */
export function createPlayerStatusUpdate(effectStr: string): any[] {
    const updates: any[] = [];
    const lower = effectStr.toLowerCase();

    if (lower.includes("evasion")) {
        updates.push({
            id: "evasion_buff",
            name: "Shadowmeld",
            type: "buff",
            statModifiers: { ac: 5 },
            duration: 3,
            description: "Harder to hit."
        });
    } else if (lower.includes("defense")) {
        updates.push({
            id: "defense_buff",
            name: "Defensive Stance",
            type: "buff",
            statModifiers: { ac: 2 },
            duration: 3,
            description: "Braced for impact."
        });
    } else if (lower.includes("buff damage")) {
        updates.push({
            id: "damage_buff",
            name: "Inferno Overdrive",
            type: "buff",
            damageBonus: 5,
            duration: 3,
            description: "Attacks deal +5 damage."
        });
    }

    return updates;
}

/**
 * Create enemy status effects based on spell effect flags
 */
export function createEnemyStatusEffects(flags: SpellEffectFlags): any[] {
    const effects: any[] = [];

    if (flags.isImmobilize) {
        effects.push({ id: "immobilized", name: "Immobilized", type: "debuff", duration: 2, description: "Cannot move or attack." });
    }
    if (flags.isStun) {
        effects.push({ id: "stun", name: "Stunned", type: "debuff", duration: 2, description: "Cannot act." });
    }
    if (flags.isBurn) {
        effects.push({ id: "burn", name: "Burn", type: "debuff", duration: 3, description: "Takes fire damage.", damagePerTurn: 3 });
    }
    if (flags.isConfuse) {
        effects.push({ id: "confused", name: "Confused", type: "debuff", duration: 2, description: "Chance to attack allies." });
    }
    if (flags.isFear) {
        effects.push({ id: "fear", name: "Fear", type: "debuff", duration: 2, description: "Reduced accuracy." });
    }

    return effects;
}
