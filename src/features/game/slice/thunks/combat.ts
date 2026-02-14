import { createAsyncThunk } from '@reduxjs/toolkit';
import { getEnemyLoot } from '@/features/game/engine';
import { resolveDuel, resolveEnemyAttack, resolveSpellDuel, resolveServitorAttack, resolveEnemyAttackOnServitor } from '@/features/game/combat';
import { SPELLS } from '@/features/game/mechanics/spells';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog, selectSpell } from '../gameSlice';
import { handleVignetteProgression } from '../constants';
import type { GameState } from '../types';
import { parseSpellEffect, createPlayerStatusUpdate, createEnemyStatusEffects } from './combat/helpers';

export const castSpell = createAsyncThunk(
  'game/castSpell',
  async (arg: { spellId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player, currentRoom } = state.game;
    if (!player || !currentRoom) return null;

    const spell = SPELLS[arg.spellId];
    if (!spell) {
      dispatch(addLog({ message: 'Unknown spell.', type: 'system' }));
      return null;
    }

    // Effect Parsing
    const effectStr = spell.effect(player, { ...player, hp: 0, maxHp: 0, maxStress: 0, stress: 0, ac: 0 });
    const flags = parseSpellEffect(effectStr);
    const { isAoE, isBuff, isInvuln, isHeal, isLifeSteal, isSummon } = flags;

    const playerStatusUpdates: any[] = [];
    let playerHeal = 0;

    // 1. Buffs / Healing / Self-Target
    if (isBuff || isInvuln) {
      playerStatusUpdates.push(...createPlayerStatusUpdate(effectStr));
      dispatch(addLog({ message: `You cast ${spell.name}. ${effectStr}!`, type: 'combat' }));
    }

    if (isHeal) {
      playerHeal = 15;
      dispatch(addLog({ message: `You cast ${spell.name} and feel revitalized.`, type: 'combat' }));
    }

    if (isSummon) {
      dispatch(addLog({ message: `You cast ${spell.name}. An echo forms to aid you.`, type: 'combat' }));
      // TODO: Add servitor logic if needed
    }

    // 2. Offensive Spells (AoE or Single Target)
    if (currentRoom.enemies.length === 0 && !isBuff && !isHeal && !isSummon) {
      dispatch(addLog({ message: 'No target for offensive spell.', type: 'system' }));
      return null;
    }

    // If pure buff/heal and no enemies, return early with updates
    if (currentRoom.enemies.length === 0) {
      return {
        enemyId: "",
        enemyDamage: 0,
        enemyDefeated: false,
        playerDamage: 0,
        xpGain: 0,
        lootItems: [],
        aoeUpdates: [],
        playerStatusUpdates,
        playerHeal
      };
    }

    const targets = isAoE ? currentRoom.enemies : [currentRoom.enemies[0]];
    const defeatedEnemies: string[] = [];
    const updates = targets.map(e => {
      const result = resolveSpellDuel(player, e, spell);
      let damage = result.hit ? result.damage : 0;

      // Life Steal Logic
      if (isLifeSteal && result.hit) {
        playerHeal += damage;
      }

      const defeated = (e.hp - damage) <= 0;
      const statusEffects = result.hit ? createEnemyStatusEffects(flags) : [];

      return { enemyId: e.id, damage, defeated, statusEffects };
    });

    // Logging for first target
    const primaryUpdate = updates[0];
    const enemy = currentRoom.enemies.find(e => e.id === primaryUpdate.enemyId);
    if (enemy) {
      if (primaryUpdate.damage > 0) {
        let msg = `You cast ${spell.name}! It hits for ${primaryUpdate.damage} damage.`;
        if (updates.length > 1) msg += ` (And ${updates.length - 1} others)`;
        dispatch(addLog({ message: msg, type: 'combat' }));
        if (flags.isLifeSteal) dispatch(addLog({ message: `You drain life from ${enemy.name}!`, type: 'combat' }));
      } else {
        dispatch(addLog({ message: `You cast ${spell.name} but ${enemy.name} resists!`, type: 'combat' }));
      }
    }

    updates.forEach(u => {
      if (u.defeated) defeatedEnemies.push(u.enemyId);
    });

    if (defeatedEnemies.length > 0) {
      defeatedEnemies.forEach(id => {
        const en = currentRoom.enemies.find(e => e.id === id);
        if (en) {
          dispatch(addLog({ message: `${en.name} (${id}) is vanquished!`, type: 'combat' }));
          dispatch(addFact({ text: `Vanquished ${en.name}.`, questionKind: 'combat', isFollowUp: false }));
        }
      });
      handleVignetteProgression(dispatch, getState);
    }

    // Enemy Retaliation (survivors only)
    // If immobilized, maybe they don't attack?
    // For simplicity, we'll let existing logic handle pure damage, but we should verify status effects in a real turn system.
    // Since this thunk resolves "One Round", we should respect the just-applied status? 
    // Yes, but `resolveEnemyAttack` doesn't know about the status we just applied in `updates`.
    // We would need to pass `updates` to `resolveEnemyAttack` or just apply it.
    // Current architecture limitation: State is not updated yet.
    // So we can check if the enemy IS immobilized in `updates` list.

    let playerDamage = 0;
    const survivors = currentRoom.enemies.filter(e => !defeatedEnemies.includes(e.id));

    if (survivors.length > 0) {
      const attacker = survivors[0]; // Primary attacker
      const attackerUpdate = updates.find(u => u.enemyId === attacker.id);
      const isAttackerDisabled = attackerUpdate?.statusEffects?.some(s => s.id === "immobilized" || s.id === "stun" || s.id === "fear" || s.id === "confused"); // Fear/Confuse might not disable but reduce hit, but for now treating as disable or just ignoring

      // If immobilized/confused/fear, maybe skip attack or reduce it?
      // Let's verify: Immobilize -> Skip. Fear -> ? Confuse -> Self damage?
      if (isAttackerDisabled) {
        dispatch(addLog({ message: `${attacker.name} is affected by status and cannot attack properly!`, type: 'combat' }));
      } else {
        const enemyAttack = resolveEnemyAttack(attacker, player);
        dispatch(addLog({ message: enemyAttack.message, type: 'combat' }));
        if (enemyAttack.hit) playerDamage = enemyAttack.damage;
      }
    }

    const lootItems = defeatedEnemies.map(id => {
      const e = currentRoom.enemies.find(en => en.id === id);
      return e ? getEnemyLoot(e.name) : [];
    }).flat();

    return {
      enemyId: primaryUpdate?.enemyId || "",
      enemyDamage: primaryUpdate?.damage || 0,
      enemyDefeated: primaryUpdate?.defeated || false,
      playerDamage,
      xpGain: defeatedEnemies.length * 50,
      lootItems,
      aoeUpdates: updates,
      playerStatusUpdates,
      playerHeal
    };
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
    let currentEnemyHp = enemy.hp;

    // Player vs Enemy
    const duelResult = resolveDuel(player, enemy);
    dispatch(addLog({ message: duelResult.message, type: 'combat' }));

    let enemyDamage = 0;
    if (duelResult.hit) {
      enemyDamage += duelResult.damage;
      currentEnemyHp -= duelResult.damage;
    }

    // Servitors vs Enemy
    if (player.servitors && currentEnemyHp > 0) {
      for (const servitor of player.servitors) {
        if (servitor.hp > 0) {
          const srvResult = resolveServitorAttack(servitor, enemy);
          dispatch(addLog({ message: srvResult.message, type: 'combat' }));
          if (srvResult.hit) {
            enemyDamage += srvResult.damage;
            currentEnemyHp -= srvResult.damage;
          }
        }
      }
    }

    let enemyDefeated = false;
    if (currentEnemyHp <= 0) {
      enemyDefeated = true;
      dispatch(addLog({ message: `${enemy.name} has fallen!`, type: 'combat' }));
      dispatch(addFact({ text: `Heroically defeated ${enemy.name}.`, questionKind: 'combat', isFollowUp: false }));
      handleVignetteProgression(dispatch, getState);
    }

    let playerDamage = 0;
    const servitorUpdates: { id: string; damageTaken: number }[] = [];

    // Enemy Retaliation
    if (!enemyDefeated) {
      // Check for Stun/Immobilize check
      const isStunned = enemy.activeEffects?.some(e => e.id === "immobilized" || e.id === "stun");

      if (isStunned) {
        dispatch(addLog({ message: `${enemy.name} is stunned and cannot attack!`, type: 'combat' }));
      } else {
        // Determine Target: Player or Servitor
        let targetId = 'player';
        const validServitors = player.servitors?.filter(c => c.hp > 0) || [];

        // 25% chance to target a servitor if any exist
        if (validServitors.length > 0 && Math.random() < 0.25) {
          const victim = validServitors[Math.floor(Math.random() * validServitors.length)];
          targetId = victim.id;

          const victimDefender = {
            name: victim.name,
            ac: 10
          };

          const enemyAttack = resolveEnemyAttackOnServitor(enemy, victimDefender);
          dispatch(addLog({ message: enemyAttack.message, type: 'combat' }));
          if (enemyAttack.hit) {
            servitorUpdates.push({ id: victim.id, damageTaken: enemyAttack.damage });
          }
        } else {
          // Target Player
          const enemyAttack = resolveEnemyAttack(enemy, player);
          dispatch(addLog({ message: enemyAttack.message, type: 'combat' }));
          if (enemyAttack.hit) playerDamage = enemyAttack.damage;
        }
      }
    }

    const lootItems = enemyDefeated ? getEnemyLoot(enemy.name) : [];
    return { enemyId: enemy.id, enemyDamage, enemyDefeated, playerDamage, servitorUpdates, xpGain: enemyDefeated ? 50 : 0, lootItems };
  }
);


export const respawnPlayer = createAsyncThunk('game/respawn', async (_, { dispatch }) => {
  dispatch(addLog({ message: 'Resurrecting...', type: 'system' }));
  dispatch(addLog({ message: 'You gasp for breath as the void releases you.', type: 'system' }));
  dispatch(addFact({ text: 'Died and returned from the void.', questionKind: 'respawn', isFollowUp: false }));
});
