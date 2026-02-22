import { createAsyncThunk } from '@reduxjs/toolkit';
import { sdkService } from '@/features/game/sdk/cortexService';
import { getKeenSensesScanExtra } from '@/features/game/skills';
import { addLog } from '../gameSlice';
import type { GameState } from '../types';

export const movePlayer = createAsyncThunk(
  'game/movePlayer',
  async (direction: string, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    if (!state.game.currentArea) throw new Error('No area');

    const isValid = await sdkService.validateMove(state.game.currentArea, direction);
    if (!isValid) {
      dispatch(addLog({ message: 'Path blocked or invalid vector.', type: 'system' }));
      throw new Error('Invalid move');
    }

    const areasExplored = state.game.sessionScore?.areasExplored ?? 0;
    const playerLevel = state.game.player?.stats.level ?? 1;
    const newArea = await sdkService.generateArea(undefined, undefined, {
      context: {
        previousArea: state.game.currentArea,
        direction,
        playerLevel,
        areasExplored,
      },
    });

    const { calculateHazardEffects } = await import('@/features/game/mechanics/hazards');
    const hazardEffects = calculateHazardEffects(newArea.hazards);
    const now = Date.now();

    dispatch(addLog({ message: `Moved ${direction}.`, type: 'exploration' }));
    if (hazardEffects.message) {
      dispatch(addLog({ message: hazardEffects.message, type: 'system' }));
    }

    return { area: newArea, direction, hazardEffects, now };
  }
);

export const scanSector = createAsyncThunk(
  'game/scanSector',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const area = state.game.currentArea;
    if (!area) return;

    dispatch(addLog({ message: 'Scanning sector...', type: 'system' }));
    await new Promise((resolve) => setTimeout(resolve, 500));

    const npcs =
      area.npcs.length > 0 ? area.npcs.map((e) => `${e.name} (${e.stats.hp} HP)`).join(', ') : 'None';
    const allies = area.allies ? area.allies.map((a) => a.name).join(', ') : 'None';
    const extra = state.game.player?.capabilities?.learned?.includes('keen_senses')
      ? getKeenSensesScanExtra(area as any) // Cast for now
      : '';
    const message = `[SCAN RESULT] ${area.title}: Agents: ${npcs}. Allies: ${allies}.${extra ? ` ${extra}` : ''}`;
    const now = Date.now();
    dispatch(addLog({ message, type: 'exploration' }));
    return { now };
  }
);
