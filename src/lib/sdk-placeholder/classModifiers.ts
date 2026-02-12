/**
 * Get class-specific behavior modifiers
 */
export function getClassModifiers(characterClass: string): {
    healingThreshold: number;      // HP ratio threshold for healing (lower = heal earlier)
    aggression: number;            // Combat aggression (0-1)
    prefersShields: boolean;       // Prioritize defensive equipment
    prefersSpeed: boolean;         // Prioritize speed/damage equipment
} {
    switch (characterClass) {
        case 'Doomguard':
            return {
                healingThreshold: 0.6,  // Doomguard heals earlier (more defensive)
                aggression: 0.5,         // Moderate aggression
                prefersShields: true,    // Prioritize shields/armor
                prefersSpeed: false,
            };
        case 'Ashwalker':
            return {
                healingThreshold: 0.4,  // Ashwalker heals later (more aggressive)
                aggression: 0.8,        // High aggression
                prefersShields: false,
                prefersSpeed: true,     // Prioritize speed/damage
            };
        case 'Obsidian Warden':
            return {
                healingThreshold: 0.55, // Balanced
                aggression: 0.6,
                prefersShields: true,   // Tank class
                prefersSpeed: false,
            };
        default:
            return {
                healingThreshold: 0.5,  // Default balanced behavior
                aggression: 0.6,
                prefersShields: false,
                prefersSpeed: false,
            };
    }
}
