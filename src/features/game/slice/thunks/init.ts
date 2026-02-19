import { createAsyncThunk } from '@reduxjs/toolkit';
import { initializePlayer } from '@/features/game/engine';
import { getSkillsForLevels } from '@/features/game/mechanics';
import { getKeenSensesScanExtra } from '@/features/game/skills';
import { sdkService } from '@/features/game/sdk/cortexService';
import { startVignette } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../gameSlice';
import { VIGNETTE_THEMES } from '@/features/narrative/helpers';
import type { GameState, InitializeGameOptions } from '../types';

export const initializeGame = createAsyncThunk(
  'game/initialize',
  async (options: InitializeGameOptions | undefined, { dispatch }) => {
    dispatch(addLog({ message: 'SYSTEM: Establishing Neural Link...', type: 'system' }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const player = initializePlayer(options?.classId) as any;
    player.capabilities = getSkillsForLevels(player.agentClass, player.level);
    if (options?.lowHp) {
      player.hp = 5;
    }
    if (options?.forceCompanion) {
      const companionHp = options.lowCompanionHp ? 1 : 100;
      player.companions = [{
        id: "test_companion_1",
        name: "Standard Unit",
        role: "Warrior",
        hp: companionHp,
        maxHp: companionHp,
        description: "A seasoned unit recruited for testing."
      }];
    }
    const initialArea = await sdkService.generateStartArea({
      deterministic: options?.deterministic,
      forceVendor: options?.forceVendor,
      forceNPC: options?.forceNPC === true || typeof options?.forceNPC === 'string',
    });

    const theme = VIGNETTE_THEMES[Math.floor(Math.random() * VIGNETTE_THEMES.length)];
    dispatch(startVignette({ theme }));

    // Auto-scan initial area
    const npcs = (initialArea.npcs || []).length > 0 ? initialArea.npcs.map(e => `${e.name} (${e.hp} HP)`).join(', ') : 'None';
    const allies = initialArea.allies ? initialArea.allies.map(a => a.name).join(', ') : 'None';
    const extra = player.capabilities?.includes('keen_senses') ? getKeenSensesScanExtra(initialArea as any) : '';
    const message = `[SCAN RESULT] ${initialArea.title}: Agents: ${npcs}. Allies: ${allies}.${extra ? ` ${extra}` : ''}`;

    dispatch(addLog({ message: 'Scanning sector...', type: 'system' }));
    dispatch(addLog({ message, type: 'exploration' }));

    return { player, initialArea };
  }
);
