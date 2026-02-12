/**
 * Surge Events — negative outcomes triggered when the player's surge count is high.
 * Called after each Oracle consultation when surge ≥ 5.
 */

export interface SurgeEvent {
    id: string;
    name: string;
    description: string;
    /** Effect type determines how the Oracle thunk applies the consequence */
    effectType: "stress" | "hp_drain" | "item_corrupt" | "enemy_empower" | "hazard_spawn" | "oracle_lockout";
    /** Magnitude of the effect (stress points, HP drained, etc.) */
    magnitude: number;
}

export const SURGE_EVENTS: SurgeEvent[] = [
    {
        id: "void_whisper",
        name: "Void Whisper",
        description: "The accumulated surge tears at your psyche. Stress floods your neural link.",
        effectType: "stress",
        magnitude: 15,
    },
    {
        id: "necrotic_feedback",
        name: "Necrotic Feedback",
        description: "Dark energy courses through your veins, draining your vitality.",
        effectType: "hp_drain",
        magnitude: 10,
    },
    {
        id: "entropic_decay",
        name: "Entropic Decay",
        description: "A random item in your inventory corrodes and disintegrates.",
        effectType: "item_corrupt",
        magnitude: 1,
    },
    {
        id: "abyssal_resonance",
        name: "Abyssal Resonance",
        description: "Nearby enemies absorb the surge, growing stronger.",
        effectType: "enemy_empower",
        magnitude: 10,
    },
    {
        id: "rift_hazard",
        name: "Rift Hazard",
        description: "A dimensional rift opens, flooding the area with toxic energy.",
        effectType: "hazard_spawn",
        magnitude: 1,
    },
    {
        id: "oracle_silence",
        name: "Oracle Silence",
        description: "The Oracle recoils from the surge. It refuses to answer for a time.",
        effectType: "oracle_lockout",
        magnitude: 1,
    },
];

/**
 * Check if a surge event triggers based on current surge count.
 * Events fire when surge ≥ 5 with increasing probability.
 * @returns A SurgeEvent if one fires, or null.
 */
export function checkSurgeEvent(surgeCount: number): SurgeEvent | null {
    if (surgeCount < 5) return null;

    // Probability scales: 20% at surge 5, +10% per surge above 5, max 80%
    const chance = Math.min(0.8, 0.2 + (surgeCount - 5) * 0.1);
    if (Math.random() >= chance) return null;

    const event = SURGE_EVENTS[Math.floor(Math.random() * SURGE_EVENTS.length)];
    return event;
}
