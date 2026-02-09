
import { Player, Stats, Item, EquipmentSlot } from "./types";

/**
 * Calculates effective stats by summing base stats and equipment bonuses.
 */
export function calculateEffectiveStats(player: Player): Stats {
    // Start with base stats
    const stats: Stats = {
        Str: player.Str,
        Agi: player.Agi,
        Arcane: player.Arcane,
        maxHp: player.maxHp,
        hp: player.hp,
        maxStress: player.maxStress,
        stress: player.stress,
        ac: player.ac,
    };

    const slots: EquipmentSlot[] = ["mainHand", "armor", "relic"];
    for (const slot of slots) {
        const item = player.equipment?.[slot];
        if (item && item.bonus) {
            stats.Str += item.bonus.Str || 0;
            stats.Agi += item.bonus.Agi || 0;
            stats.Arcane += item.bonus.Arcane || 0;
            stats.maxHp += item.bonus.maxHp || 0;
            stats.maxStress += item.bonus.maxStress || 0;
            stats.ac = (stats.ac ?? 0) + (item.bonus.ac || 0);
        }
    }

    return stats;
}

/**
 * Applies a consumable effect to the player.
 * Returns updated player and log message, or null if no effect.
 */
export function useConsumable(player: Player, item: Item): { updatedPlayer: Player; message: string } | null {
    if (item.type !== "consumable" || !item.effect) return null;

    const newPlayer = { ...player };
    let message = "";

    // Handle standard effects: "heal_10", "stress_-5"
    const parts = item.effect.split("_");
    const type = parts[0];
    const value = parseInt(parts[1], 10);

    // If parsing succeeds, apply numeric effect
    if (!isNaN(value)) {
        if (type === "heal") {
            const oldHp = newPlayer.hp;
            newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + value);
            message = `Used ${item.name}. Healed ${newPlayer.hp - oldHp} HP.`;
            return { updatedPlayer: newPlayer, message };
        } else if (type === "stress") {
            const oldStress = newPlayer.stress;
            newPlayer.stress = Math.max(0, newPlayer.stress + value); // value is typically negative
            message = `Used ${item.name}. Stress changed by ${newPlayer.stress - oldStress}.`;
            return { updatedPlayer: newPlayer, message };
        }
    }

    // Handle keywords / fallbacks if numeric parsing failed or type didn't match
    if (item.effect === "arcane_boost") {
        const oldStress = newPlayer.stress;
        newPlayer.stress = Math.max(0, newPlayer.stress - 5);
        message = `Used ${item.name}. Arcane energies soothe your mind (-${oldStress - newPlayer.stress} stress).`;
        return { updatedPlayer: newPlayer, message };
    }

    return null;
}
