import { createAsyncThunk } from '@reduxjs/toolkit';
import { initializePlayer } from '@/features/game/engine';
import { getSkillsForLevels } from '@/features/game/mechanics';
import { getKeenSensesScanExtra } from '@/features/game/skills';
import { sdkService } from '@/features/game/sdk/cortexService';
import { startVignette } from '@/features/narrative/slice/narrativeSlice';
import { addLog } from '../../store/gameSlice';
import { VIGNETTE_THEMES } from '@/features/narrative/helpers';
import type { GameState, InitializeGameOptions } from '../../store/types';

export const initializeGame = createAsyncThunk(
  'game/initialize',
  async (options: InitializeGameOptions | undefined, { dispatch }) => {
    dispatch(addLog({ message: 'SYSTEM: Establishing Neural Link...', type: 'system' }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const player = initializePlayer(options?.classId) as import('../../types').AgentPlayer;
    player.capabilities = { learned: getSkillsForLevels(player.agentClass, player.stats.level ?? 1) };
    if (options?.lowHp) {
      player.stats.hp = 5;
    }
    if (options?.forceCompanion) {
      const companionHp = options.lowCompanionHp ? 1 : 100;
      player.companions = [{
        id: "test_companion_1",
        type: "companion",
        faction: "ally" as const,
        name: "Standard Unit",
        role: "Warrior" as const,
        description: "A seasoned unit recruited for testing.",
        stats: {
          hp: companionHp,
          maxHp: companionHp,
          stress: 0,
          maxStress: 100,
          speed: 1,
          defense: 10,
          damage: 5,
          invulnerable: 0,
        },
        inventory: { weapons: [], currentWeaponIndex: 0, items: [], equipment: {}, spirit: 0, blood: 0 },
        capabilities: { learned: [] },
        activeEffects: [],
        x: 0, y: 0, vx: 0, vy: 0, width: 14, height: 24,
        isGrounded: true, facingRight: true,
        state: "idle", frame: 0, animTimer: 0,
        active: true,
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
    const npcs = (initialArea.npcs || []).length > 0 ? initialArea.npcs.map(e => `${e.name} (${e.stats?.hp ?? '?'} HP)`).join(', ') : 'None';
    const allies = initialArea.allies ? initialArea.allies.map(a => a.name).join(', ') : 'None';
    const extra = player.capabilities?.learned?.includes('keen_senses') ? getKeenSensesScanExtra(initialArea) : '';
    const message = `[SCAN RESULT] ${initialArea.title}: Agents: ${npcs}. Allies: ${allies}.${extra ? ` ${extra}` : ''}`;

    dispatch(addLog({ message: 'Scanning sector...', type: 'system' }));
    dispatch(addLog({ message, type: 'exploration' }));
    dispatch(addLog({ message: "SYSTEM: Connection Stable. Welcome to Quadar Tower, Ranger.", type: "system" }));

    return { player, initialArea };
  }
);
