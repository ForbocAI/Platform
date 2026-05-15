/**
 * Helper functions for combat thunks
 */

/** Presentation-layer mapping: raw effect strings → cozy Lanternbough labels.
 *  Mechanical parsing (parseCapabilityEffect) still works on the raw strings;
 *  this mapping is applied only at combat-log display time. */
const EFFECT_DISPLAY: Record<string, string> = {
    // Damage
    "Melee damage": "Briar Strike",
    "Melee Damage": "Briar Strike",
    "Piercing": "Thorn Pierce",
    "Pierce": "Thorn Pierce",
    "Ranged Pierce": "Long Thorn",
    "Nature/melee": "Rootlash",
    "Charge Damage": "Rushing Antler",
    "Extra Arcane Dmg": "Moonpetal Surge",
    "Close-range devastation": "Bramble Burst",
    // AoE
    "AoE": "Sweeping Gust",
    "AoE Stun": "Rootsong Daze (Area)",
    "AoE Confuse": "Spore Cloud (Area)",
    "AoE Fear": "Nightbloom Fright (Area)",
    "AoE Knockback": "Gale Push (Area)",
    "AoE Knockdown": "Tremor Stomp (Area)",
    "AoE Melee": "Whirling Thorns (Area)",
    "AoE Ranged": "Petal Volley (Area)",
    "AoE Nature": "Wildbloom Wave (Area)",
    "AoE Nature Damage": "Wildbloom Wave (Area)",
    "AoE Slow": "Honeydew Mire (Area)",
    "AoE Stagger": "Rumbling Roots (Area)",
    "AoE Burn": "Ember Scatter (Area)",
    "AoE Damage": "Thorny Eruption (Area)",
    "AoE Ultimate": "Ancient Canopy Wrath (Area)",
    // DoT / Burn
    "Burn": "Ember Touch",
    "Burning Dot": "Smoldering Trail",
    "Burning trail": "Smoldering Trail",
    "DoT Rot": "Creeping Blight",
    // Control
    "Immobilize": "Vine Snare",
    "Stun": "Rootsong Daze",
    "Knockback/Stun": "Ironbark Slam",
    "Slow": "Honeydew Mire",
    "Confuse": "Spore Haze",
    "Fear debuff": "Nightbloom Shiver",
    "Displacement": "Gust Scatter",
    // Buffs
    "Buff stats": "Woodland Vigor",
    "Buff Damage": "Briar Edge",
    "Buff Speed": "Zephyr Step",
    "Buff Evasion": "Dew Veil",
    "Buff Evasion/Speed": "Windpetal Grace",
    "Buff All": "Canopy Blessing",
    "Buff Allies": "Hearthtree Chorus",
    "Buff on kill": "Harvest Glow",
    "Defense Buff": "Bark Shield",
    "Aura Buff": "Lantern Aura",
    "Attack Speed Buff": "Quickthorn",
    "Block/DR": "Ironbark Guard",
    "Magic Resist": "Dewdrop Ward",
    "Resist Debuffs": "Rootsong Resilience",
    "Reduce incoming damage": "Mosshide",
    "Reflect Ranged": "Briar Mirror",
    // Heal / Utility
    "Invulnerability": "Ancient Bark Shell",
    "Immunity": "Rootsong Immunity",
    "Immunity duration": "Rootsong Immunity",
    "Heal": "Sunpetal Mend",
    "Regeneration": "Dewdrop Renewal",
    "Life Steal": "Pollen Siphon",
    "Drain/Debuff": "Sap Drain",
    "Summon Echo": "Summon Grove Echo",
    "Revive": "Second Bloom",
    // Special
    "High Crit": "Keen Thorn",
    "Homing/Precise": "Seeking Seedpod",
    "Weapon switch": "Swap Armament",
    "Mobility boost": "Fleet of Root",
    "Berserk state": "Wild Growth",
    "Debuff": "Wilt Touch",
    "None": "",
};

/** Returns the cozy display label for a raw effect string.
 *  Falls back to the raw string if no mapping exists. */
export function softenEffectLabel(raw: string): string {
    return EFFECT_DISPLAY[raw] ?? raw;
}

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
export function createPlayerStatusUpdate(effectStr: string): import('../../../types').StatusEffect[] {
    const updates: import('../../../types').StatusEffect[] = [];
    const lower = effectStr.toLowerCase();

    if (lower.includes("evasion")) {
        updates.push({
            id: "evasion_buff",
            name: "Dew Veil",
            type: "buff",
            statModifiers: { defense: 5 },
            duration: 3,
            description: "A shimmer of dew deflects incoming strikes."
        });
    } else if (lower.includes("defense")) {
        updates.push({
            id: "defense_buff",
            name: "Bark Shield",
            type: "buff",
            statModifiers: { defense: 2 },
            duration: 3,
            description: "Hardened bark absorbs blows."
        });
    } else if (lower.includes("buff damage")) {
        updates.push({
            id: "damage_buff",
            name: "Briar Edge",
            type: "buff",
            damageBonus: 5,
            duration: 3,
            description: "Thorns sharpen your strikes."
        });
    }

    return updates;
}

/**
 * Create NPC status effects based on capability effect flags
 */
export function createNPCStatusEffects(flags: CapabilityEffectFlags): import('../../../types').StatusEffect[] {
    const effects: import('../../../types').StatusEffect[] = [];

    if (flags.isImmobilize) {
        effects.push({ id: "immobilized", name: "Vine Snare", type: "debuff", duration: 2, description: "Tangled in roots — cannot move or act." });
    }
    if (flags.isStun) {
        effects.push({ id: "stun", name: "Rootsong Daze", type: "debuff", duration: 2, description: "Overwhelmed by the Rootsong — cannot act." });
    }
    if (flags.isBurn) {
        effects.push({ id: "burn", name: "Ember Touch", type: "debuff", duration: 3, description: "Smoldering embers singe over time.", damagePerTurn: 3 });
    }
    if (flags.isConfuse) {
        effects.push({ id: "confused", name: "Spore Haze", type: "debuff", duration: 2, description: "Spores cloud the senses — may lash out wildly." });
    }
    if (flags.isFear) {
        effects.push({ id: "fear", name: "Nightbloom Shiver", type: "debuff", duration: 2, description: "A chill from the deep woods — aim falters." });
    }

    return effects;
}
