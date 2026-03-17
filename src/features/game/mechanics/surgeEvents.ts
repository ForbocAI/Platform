/**
 * Spark events — setbacks triggered when the player's spark count runs too high.
 * Called after each inquiry when spark ≥ 5.
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
        name: "Frayed Nerves",
        description: "Too much spark at once leaves you overstimulated and tense.",
        effectType: "stress",
        magnitude: 15,
    },
    {
        id: "hardware_feedback",
        name: "Lantern Feedback",
        description: "A bright feedback pulse rattles through your gear and leaves you winded.",
        effectType: "hp_drain",
        magnitude: 10,
    },
    {
        id: "data_decay",
        name: "Lost Keepsake",
        description: "A random item in your pack is shaken loose, spoiled, or otherwise ruined.",
        effectType: "item_corrupt",
        magnitude: 1,
    },
    {
        id: "interference_resonance",
        name: "Trouble Stirs",
        description: "Nearby troublemakers find their footing while the sparkstorm distracts you.",
        effectType: "enemy_empower",
        magnitude: 10,
    },
    {
        id: "rift_hazard",
        name: "Weather Shift",
        description: "The local route buckles into a fresh hazard and the air turns jumpy.",
        effectType: "hazard_spawn",
        magnitude: 1,
    },
    {
        id: "inquiry_lockout",
        name: "Quiet Spell",
        description: "The inquiry line goes still for a moment, as if waiting for the valley to settle.",
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
