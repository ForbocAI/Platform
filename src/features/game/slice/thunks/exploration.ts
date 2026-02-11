import { createAsyncThunk } from '@reduxjs/toolkit';
import { SDK } from '@/lib/sdk-placeholder';
import { getKeenSensesScanExtra } from '@/features/game/skills';
import { addLog } from '../actions';
import type { GameState } from '../types';

export const movePlayer = createAsyncThunk(
  'game/movePlayer',
  async (direction: string, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    if (!state.game.currentRoom) throw new Error('No room');

    const isValid = await SDK.Bridge.validateMove(state.game.currentRoom, direction);
    if (!isValid) {
      dispatch(addLog({ message: 'Path blocked or invalid vector.', type: 'system' }));
      throw new Error('Invalid move');
    }

    const roomsExplored = state.game.sessionScore?.roomsExplored ?? 0;
    const playerLevel = state.game.player?.level ?? 1;
    const newRoom = await SDK.Cortex.generateRoom(undefined, undefined, {
      context: {
        previousRoom: state.game.currentRoom,
        direction,
        playerLevel,
        roomsExplored,
      },
    });
    dispatch(addLog({ message: `Moved ${direction}.`, type: 'exploration' }));

    return { room: newRoom, direction };
  }
);

export const scanSector = createAsyncThunk(
  'game/scanSector',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const room = state.game.currentRoom;
    if (!room) return;

    dispatch(addLog({ message: 'Scanning sector...', type: 'system' }));
    await new Promise((resolve) => setTimeout(resolve, 500));

    const enemies =
      room.enemies.length > 0 ? room.enemies.map((e) => `${e.name} (${e.hp} HP)`).join(', ') : 'None';
    const allies = room.allies ? room.allies.map((a) => a.name).join(', ') : 'None';
    const extra = state.game.player?.skills?.includes('keen_senses')
      ? getKeenSensesScanExtra(room)
      : '';
    const message = `[SCAN RESULT] ${room.title}: Enemies: ${enemies}. Allies: ${allies}.${extra ? ` ${extra}` : ''}`;
    dispatch(addLog({ message, type: 'exploration' }));
  }
);
