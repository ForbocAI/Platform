
export function rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
}

export function parseDiceString(diceString: string): number {
    // Parser for "XdY" or "XdY + Z" (dice + optional numeric modifier).
    // e.g. "2d6", "1d8 + 4"

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
        } else {
            const val = parseInt(part);
            if (!isNaN(val)) total += val;
        }
    }
    return total;
}
