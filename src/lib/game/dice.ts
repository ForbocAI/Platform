
export function rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
}

export function parseDiceString(diceString: string, stats?: import("./types").Stats): number {
    // Basic parser for "XdY + Z" or "XdY + STR"
    // e.g. "2d6", "1d8 + 4", "1d10 + STR"

    let total = 0;
    const parts = diceString.replace(/\s+/g, '').split('+');

    for (const part of parts) {
        if (part.includes('d')) {
            const [countStr, sidesStr] = part.split('d');
            const count = parseInt(countStr) || 1;
            const sides = parseInt(sidesStr);
            for (let i = 0; i < count; i++) {
                total += rollDie(sides);
            }
        } else if (stats && ["STR", "AGI", "ARCANE"].includes(part.toUpperCase())) {
            const statName = part.toUpperCase();
            if (statName === "STR") total += stats.Str;
            if (statName === "AGI") total += stats.Agi;
            if (statName === "ARCANE") total += stats.Arcane;
        } else {
            const val = parseInt(part);
            if (!isNaN(val)) total += val;
        }
    }
    return total;
}
