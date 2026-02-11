
import { Player, Room } from '@/features/game/types';

// Bridge: Validates actions and manages state rules ("The Body/Law")
export const Bridge = {
    // Validates movement (e.g. checking exits)
    // For now, this just passes through, but in real SDK it would check complex constraints
    validateMove: async (_currentRoom: Room, _direction: string): Promise<boolean> => {
        // Simulate validation latency
        await new Promise(resolve => setTimeout(resolve, 100));

        // In a real check: return !!currentRoom.exits[direction];
        // For now, allow procedural generation on any move to simulate exploration of infinite space
        return true;
    },

    // Validates combat actions or interactions
    validateAction: async (player: Player, _actionType: string): Promise<{ success: boolean; message?: string }> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (player.hp <= 0) return { success: false, message: "Use the Lazarus Protocol. You are dead." };
        return { success: true };
    }
};
