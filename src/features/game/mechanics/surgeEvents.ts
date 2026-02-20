/**
 * Surge Events — negative outcomes triggered when the player's surge count is high.
 * Called after each Oracle consultation when surge ≥ 5.
 */

export interface SurgeEvent {
    id: string;
    name: string;
    description: string;
    /** Effect type determines how the inquiry flow applies the consequence */
    effectType: "stress" | "hp_drain" | "item_corrupt" | "enemy_empower" | "hazard_spawn" | "inquiry_lockout";
    /** Magnitude of the effect (stress points, HP drained, etc.) */
    magnitude: number;
}

export const SURGE_EVENTS: SurgeEvent[] = [
    {
        id: "system_strain",
        name: "System Strain",
        description: "The accumulated stress tears at your psyche. Data floods your neural link.",
        effectType: "stress",
        magnitude: 15,
    },
    {
        id: "hardware_feedback",
        name: "Hardware Feedback",
        description: "Power surges course through your chassis, draining your vitality.",
        effectType: "hp_drain",
        magnitude: 10,
    },
    {
        id: "data_decay",
        name: "Data Decay",
        description: "A random item in your inventory suffers catastrophic data corruption.",
        effectType: "item_corrupt",
        magnitude: 1,
    },
    {
        id: "interference_resonance",
        name: "Interference Resonance",
        description: "Nearby hostiles absorb the system surge, growing stronger.",
        effectType: "enemy_empower",
        magnitude: 10,
    },
    {
        id: "rift_hazard",
        name: "Regional Hazard",
        description: "An environmental rupture opens, flooding the area with toxic energy.",
        effectType: "hazard_spawn",
        magnitude: 1,
    },
    {
        id: "inquiry_lockout",
        name: "Inquiry Lockout",
        description: "The inquiry engine recoils from the surge. It refuses to answer for a time.",
        effectType: "inquiry_lockout",
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
