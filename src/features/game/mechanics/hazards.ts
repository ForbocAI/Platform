/**
 * Calculate effects of active hazards in a room.
 * Returns damage and stress to apply to the player.
 */
export function calculateHazardEffects(hazards: string[]): { damage: number; stress: number; message?: string } {
    let damage = 0;
    let stress = 0;
    const messages: string[] = [];

    if (hazards.includes("Toxic Air")) {
        damage += 5;
        stress += 2;
        messages.push("Toxic spores burn your lungs.");
    }
    if (hazards.includes("Radioactive Decay")) {
        damage += 8;
        stress += 5;
        messages.push("Invisible radiation sears your flesh.");
    }
    if (hazards.includes("Void Instability")) {
        damage += 3;
        stress += 8;
        messages.push("The fabric of reality wavers, straining your mind.");
    }
    if (hazards.includes("Extreme Cold")) {
        damage += 4;
        stress += 3;
        messages.push("Bitter cold numbs your extremities.");
    }
    if (hazards.includes("Scorching Heat")) {
        damage += 4;
        stress += 3;
        messages.push("Oppressive heat saps your strength.");
    }

    // New "Threat Imminent" hazard logic
    if (hazards.includes("Threat Imminent")) {
        stress += 10;
        messages.push("A profound sense of dread washes over you.");
    }

    if (damage === 0 && stress === 0) {
        return { damage: 0, stress: 0 };
    }

    return {
        damage,
        stress,
        message: messages.join(" "),
    };
}
