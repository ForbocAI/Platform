import { createAsyncThunk } from '@reduxjs/toolkit';
import { initializePlayer } from '@/lib/game/engine';
import { getSkillsForLevels } from '@/lib/game/mechanics';
import { SDK } from '@/lib/sdk-placeholder';
import { startVignette } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../actions';
import { VIGNETTE_THEMES } from '@/lib/game/narrativeHelpers';
import type { GameState, InitializeGameOptions } from '../types';

export const initializeGame = createAsyncThunk(
  'game/initialize',
  async (options: InitializeGameOptions | undefined, { dispatch }) => {
    dispatch(addLog({ message: 'SYSTEM: Establishing Neural Link...', type: 'system' }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const player = initializePlayer();
    player.skills = getSkillsForLevels(player.characterClass, player.level);
    if (options?.lowHp) {
      player.hp = 5;
    }
    const initialRoom = await SDK.Cortex.generateStartRoom({
      deterministic: options?.deterministic,
      forceMerchant: options?.forceMerchant,
      forceEnemy: options?.forceEnemy,
    });

    const theme = VIGNETTE_THEMES[Math.floor(Math.random() * VIGNETTE_THEMES.length)];
    dispatch(startVignette({ theme }));

    return { player, initialRoom };
  }
);
