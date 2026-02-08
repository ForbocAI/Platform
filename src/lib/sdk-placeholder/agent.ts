
import { Player, Room } from '@/lib/quadar/types';

// Agent: Controls NPCs and Entities ("The Shadows")
export const Agent = {
    // Decides enemy actions for a turn
    decideEnemyActions: async (room: Room, player: Player): Promise<string[]> => {
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!room.enemies || room.enemies.length === 0) return [];

        const actions = room.enemies.map(enemy => {
            // Simple logic: 50% chance to attack if player is alive
            if (Math.random() > 0.5) {
                return `${enemy.name} glares at you with malice.`;
            }
            return null;
        }).filter(Boolean) as string[];

        return actions;
    }
};
