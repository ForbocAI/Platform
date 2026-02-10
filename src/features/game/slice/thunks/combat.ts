import { createAsyncThunk } from '@reduxjs/toolkit';
import { getEnemyLoot } from '@/lib/game/engine';
import { resolveDuel, resolveEnemyAttack, resolveSpellDuel } from '@/lib/game/combat';
import { SPELLS } from '@/lib/game/mechanics';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog, selectSpell } from '../actions';
import { handleVignetteProgression } from '../constants';
import type { GameState } from '../types';

export const castSpell = createAsyncThunk(
  'game/castSpell',
  async (arg: { spellId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player, currentRoom } = state.game;
    if (!player || !currentRoom) return null;
    if (currentRoom.enemies.length === 0) {
      dispatch(addLog({ message: 'No target for spell.', type: 'system' }));
      return null;
    }
    const spell = SPELLS[arg.spellId];
    if (!spell) {
      dispatch(addLog({ message: 'Unknown spell.', type: 'system' }));
      return null;
    }
    const enemy = currentRoom.enemies[0];
    const duelResult = resolveSpellDuel(player, enemy, spell);
    dispatch(addLog({ message: duelResult.message, type: 'combat' }));
    let enemyDamage = 0;
    let enemyDefeated = false;
    if (duelResult.hit) {
      enemyDamage = duelResult.damage;
      if (enemy.hp - enemyDamage <= 0) {
        enemyDefeated = true;
        dispatch(addLog({ message: `${enemy.name} has been eradicated by arcane force!`, type: 'combat' }));
        dispatch(addFact({ text: `Vanquished ${enemy.name} with ${spell.name}.`, questionKind: 'combat', isFollowUp: false }));
        handleVignetteProgression(dispatch, getState);
      }
    }
    let playerDamage = 0;
    if (!enemyDefeated) {
      const enemyAttack = resolveEnemyAttack(enemy, player);
      dispatch(addLog({ message: enemyAttack.message, type: 'combat' }));
      if (enemyAttack.hit) playerDamage = enemyAttack.damage;
    }
    const lootItems = enemyDefeated ? getEnemyLoot(enemy.name) : [];
    return { enemyId: enemy.id, enemyDamage, enemyDefeated, playerDamage, xpGain: enemyDefeated ? 50 : 0, lootItems };
  }
);

export const engageHostiles = createAsyncThunk(
  'game/engageHostiles',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player, currentRoom, selectedSpellId } = state.game;
    if (!player || !currentRoom) return null;
    if (selectedSpellId) {
      await dispatch(castSpell({ spellId: selectedSpellId }));
      dispatch(selectSpell(null));
      return null;
    }
    if (currentRoom.enemies.length === 0) {
      dispatch(addLog({ message: 'No hostiles to engage.', type: 'combat' }));
      return null;
    }
    const enemy = currentRoom.enemies[0];
    const duelResult = resolveDuel(player, enemy);
    dispatch(addLog({ message: duelResult.message, type: 'combat' }));
    let enemyDamage = 0;
    let enemyDefeated = false;
    if (duelResult.hit) {
      enemyDamage = duelResult.damage;
      if (enemy.hp - enemyDamage <= 0) {
        enemyDefeated = true;
        dispatch(addLog({ message: `${enemy.name} has fallen!`, type: 'combat' }));
        dispatch(addFact({ text: `Heroically defeated ${enemy.name}.`, questionKind: 'combat', isFollowUp: false }));
        handleVignetteProgression(dispatch, getState);
      }
    }
    let playerDamage = 0;
    if (!enemyDefeated) {
      const enemyAttack = resolveEnemyAttack(enemy, player);
      dispatch(addLog({ message: enemyAttack.message, type: 'combat' }));
      if (enemyAttack.hit) playerDamage = enemyAttack.damage;
    }
    const lootItems = enemyDefeated ? getEnemyLoot(enemy.name) : [];
    return { enemyId: enemy.id, enemyDamage, enemyDefeated, playerDamage, xpGain: enemyDefeated ? 50 : 0, lootItems };
  }
);

export const respawnPlayer = createAsyncThunk('game/respawn', async (_, { dispatch }) => {
  dispatch(addLog({ message: 'Resurrecting...', type: 'system' }));
  await new Promise((r) => setTimeout(r, 1000));
  dispatch(addLog({ message: 'You gasp for breath as the void releases you.', type: 'system' }));
  dispatch(addFact({ text: 'Died and returned from the void.', questionKind: 'respawn', isFollowUp: false }));
});
