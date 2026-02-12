import { createAsyncThunk } from '@reduxjs/toolkit';
import { initializePlayer } from '@/features/game/engine';
import { getSkillsForLevels } from '@/features/game/mechanics';
import { getKeenSensesScanExtra } from '@/features/game/skills';
import { SDK } from '@/lib/sdk-placeholder';
import { startVignette } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../actions';
import { VIGNETTE_THEMES } from '@/features/narrative/helpers';
import type { GameState, InitializeGameOptions } from '../types';

export const initializeGame = createAsyncThunk(
  'game/initialize',
  async (options: InitializeGameOptions | undefined, { dispatch }) => {
    dispatch(addLog({ message: 'SYSTEM: Establishing Neural Link...', type: 'system' }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const player = initializePlayer(options?.classId);
    player.skills = getSkillsForLevels(player.characterClass, player.level);
    if (options?.lowHp) {
      player.hp = 5;
    }
    if (options?.forceServitor) {
      const servitorHp = options.lowServitorHp ? 1 : 100;
      player.servitors = [{
        id: "test_servitor_1",
        name: "Doomguard Veteran",
        role: "Warrior",
        hp: servitorHp,
        maxHp: servitorHp,
        description: "A seasoned warrior hired for testing."
      }];
    }
    const initialRoom = await SDK.Cortex.generateStartRoom({
      deterministic: options?.deterministic,
      forceMerchant: options?.forceMerchant,
      forceEnemy: options?.forceEnemy === true || typeof options?.forceEnemy === 'string',
    });

    const theme = VIGNETTE_THEMES[Math.floor(Math.random() * VIGNETTE_THEMES.length)];
    dispatch(startVignette({ theme }));

    // Auto-scan initial room
    const enemies = initialRoom.enemies?.length > 0 ? initialRoom.enemies.map(e => `${e.name} (${e.hp} HP)`).join(', ') : 'None';
    const allies = initialRoom.allies ? initialRoom.allies.map(a => a.name).join(', ') : 'None';
    const extra = player.skills?.includes('keen_senses') ? getKeenSensesScanExtra(initialRoom) : '';
    const message = `[SCAN RESULT] ${initialRoom.title}: Enemies: ${enemies}. Allies: ${allies}.${extra ? ` ${extra}` : ''}`;

    dispatch(addLog({ message: 'Scanning sector...', type: 'system' }));
    dispatch(addLog({ message, type: 'exploration' }));

    return { player, initialRoom };
  }
);
