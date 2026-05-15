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
    if (hazards.includes("Sporepuff Haze")) {
        damage += 5;
        stress += 2;
        messages.push("Drifting sporepuff clouds sting your eyes and make breathing heavy.");
    }
    if (hazards.includes("Gloomblight")) {
        damage += 8;
        stress += 5;
        messages.push("A damp blight clings to everything, sapping warmth and strength.");
    }
    if (hazards.includes("Rootsong Dissonance")) {
        damage += 3;
        stress += 8;
        messages.push("The Rootsong clashes with itself here, jangling your nerves.");
    }
    if (hazards.includes("Bitter Frost")) {
        damage += 4;
        stress += 3;
        messages.push("A sharp frost creeps in, numbing your fingers and slowing your step.");
    }
    if (hazards.includes("Scorching Drought")) {
        damage += 4;
        stress += 3;
        messages.push("Dry, scorching air presses down from the canopy, leaving you parched.");
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
