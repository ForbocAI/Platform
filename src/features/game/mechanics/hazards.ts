/**
 * Calculate effects of active hazards in a room.
 * Returns damage and stress to apply to the player.
 */
export function calculateHazardEffects(hazards: string[]): { damage: number; stress: number; message?: string } {
    let damage = 0;
    let stress = 0;
    const messages: string[] = [];

    if (hazards.includes("Wayward Rootsong")) {
        stress += 4;
        messages.push("The Rootsong hums off-key, making every step feel uncertain.");
    }
    if (hazards.includes("Path Trouble")) {
        stress += 10;
        messages.push("The path grows busy and unsettled, and your nerves rise with it.");
    }
    if (hazards.includes("Lantern Flare")) {
        damage += 2;
        stress += 4;
        messages.push("A burst of lantern static crackles through the air.");
    }
    if (hazards.includes("Toxic Air")) {
        damage += 5;
        stress += 2;
        messages.push("Toxic spores burn your lungs.");
    }
    if (hazards.includes("Radioactive Decay")) {
        damage += 8;
        stress += 5;
        messages.push("A sharp metallic haze leaves you reeling.");
    }
    if (hazards.includes("Void Instability")) {
        damage += 3;
        stress += 8;
        messages.push("The air wobbles strangely around you, straining your mind.");
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

    if (damage === 0 && stress === 0) {
        return { damage: 0, stress: 0 };
    }

    return {
        damage,
        stress,
        message: messages.join(" "),
    };
}
