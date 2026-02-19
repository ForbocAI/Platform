/**
 * Helper functions for combat thunks
 */

export interface CapabilityEffectFlags {
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
 * Parse capability effect string to determine effect flags
 */
export function parseCapabilityEffect(effectStr: string): CapabilityEffectFlags {
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
 * Create player status update based on capability effect
 */
export function createPlayerStatusUpdate(effectStr: string): any[] {
    const updates: any[] = [];
    const lower = effectStr.toLowerCase();

    if (lower.includes("evasion")) {
        updates.push({
            id: "evasion_buff",
            name: "Enhanced Evasion",
            type: "buff",
            statModifiers: { ac: 5 },
            duration: 3,
            description: "Increased evasion rating."
        });
    } else if (lower.includes("defense")) {
        updates.push({
            id: "defense_buff",
            name: "Defensive Matrix",
            type: "buff",
            statModifiers: { ac: 2 },
            duration: 3,
            description: "Reinforced shielding."
        });
    } else if (lower.includes("buff damage")) {
        updates.push({
            id: "damage_buff",
            name: "Damage Overdrive",
            type: "buff",
            damageBonus: 5,
            duration: 3,
            description: "Attacks deal bonus damage."
        });
    }

    return updates;
}

/**
 * Create NPC status effects based on capability effect flags
 */
export function createNPCStatusEffects(flags: CapabilityEffectFlags): any[] {
    const effects: any[] = [];

    if (flags.isImmobilize) {
        effects.push({ id: "immobilized", name: "Immobilized", type: "debuff", duration: 2, description: "Cannot move or attack." });
    }
    if (flags.isStun) {
        effects.push({ id: "stun", name: "Stunned", type: "debuff", duration: 2, description: "Cannot act." });
    }
    if (flags.isBurn) {
        effects.push({ id: "burn", name: "Degradation", type: "debuff", duration: 3, description: "Takes periodic damage.", damagePerTurn: 3 });
    }
    if (flags.isConfuse) {
        effects.push({ id: "confused", name: "Confused", type: "debuff", duration: 2, description: "Chance to attack allies." });
    }
    if (flags.isFear) {
        effects.push({ id: "fear", name: "Suppression", type: "debuff", duration: 2, description: "Reduced accuracy." });
    }

    return effects;
}
