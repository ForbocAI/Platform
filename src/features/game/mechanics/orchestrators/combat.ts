import { createAsyncThunk } from '@reduxjs/toolkit';
import { getNPCLoot } from '@/features/game/engine';
import { resolveDuel, resolveNPCAttack, resolveCapabilityDuel, resolveCompanionAttack, resolveNPCAttackOnCompanion } from '@/features/game/combat';
import { CAPABILITIES } from '@/features/game/mechanics/capabilities';
import { addFact } from '@/features/narrative/slice/narrativeSlice';
import { addLog, selectCapability } from '../../store/gameSlice';
import { handleVignetteProgression } from '../../store/constants';
import type { GameState } from '../../store/types';
import { parseCapabilityEffect, createPlayerStatusUpdate, createNPCStatusEffects } from './combat/helpers';

export const castCapability = createAsyncThunk(
  'game/castCapability',
  async (arg: { capabilityId: string }, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player, currentArea } = state.game;
    if (!player || !currentArea) return null;

    const capability = CAPABILITIES[arg.capabilityId];
    if (!capability) {
      dispatch(addLog({ message: 'Unknown capability.', type: 'system' }));
      return null;
    }

    // Effect Parsing
    const effectStr = capability.effect(player.stats, { ...player.stats, hp: 0, maxHp: 0, maxStress: 0, stress: 0, defense: 0 });
    const flags = parseCapabilityEffect(effectStr);
    const { isAoE, isBuff, isInvuln, isHeal, isLifeSteal, isSummon } = flags;

    const playerStatusUpdates: import('../../types').StatusEffect[] = [];
    let playerHeal = 0;

    // 1. Buffs / Healing / Self-Target
    if (isBuff || isInvuln) {
      playerStatusUpdates.push(...createPlayerStatusUpdate(effectStr));
      dispatch(addLog({ message: `You activate ${capability.name}. ${effectStr}!`, type: 'combat' }));
    }

    if (isHeal) {
      dispatch(addLog({ message: `You activate ${capability.name} and feel revitalized.`, type: 'combat' }));
      playerHeal = 15;
    }

    if (isSummon) {
      dispatch(addLog({ message: `You activate ${capability.name}. An echo forms to aid you.`, type: 'combat' }));
      // TODO: Add companion logic if needed
    }

    // 2. Offensive Capabilities (AoE or Single Target)
    if (currentArea.npcs.length === 0 && !isBuff && !isHeal && !isSummon) {
      dispatch(addLog({ message: 'No target for offensive capability.', type: 'system' }));
      return null;
    }

    // If pure buff/heal and no npcs, return early with updates
    if (currentArea.npcs.length === 0) {
      return {
        npcId: "",
        npcDamage: 0,
        npcDefeated: false,
        playerDamage: 0,
        xpGain: 0,
        lootItems: [],
        aoeUpdates: [],
        playerStatusUpdates,
        playerHeal
      };
    }

    const targets = isAoE ? currentArea.npcs : [currentArea.npcs[0]];
    const defeatedNPCs: string[] = [];
    const updates = targets.map(e => {
      const result = resolveCapabilityDuel(player, e, capability);
      const damage = result.hit ? result.damage : 0;

      // Life Steal Logic
      if (isLifeSteal && result.hit) {
        playerHeal += damage;
      }

      const defeated = (e.stats.hp - damage) <= 0;
      const statusEffects = result.hit ? createNPCStatusEffects(flags) : [];

      return { npcId: e.id, damage, defeated, statusEffects };
    });

    // Logging for first target
    const primaryUpdate = updates[0];
    const targetNPC = currentArea.npcs.find(e => e.id === primaryUpdate.npcId);
    if (targetNPC) {
      if (primaryUpdate.damage > 0) {
        let msg = `You activate ${capability.name}! It hits for ${primaryUpdate.damage} damage.`;
        if (updates.length > 1) msg += ` (And ${updates.length - 1} others)`;
        dispatch(addLog({ message: msg, type: 'combat' }));
        if (flags.isLifeSteal) dispatch(addLog({ message: `You drain resource from ${targetNPC.name}!`, type: 'combat' }));
      } else {
        dispatch(addLog({ message: `You activate ${capability.name} but ${targetNPC.name} resists!`, type: 'combat' }));
      }
    }

    updates.forEach(u => {
      if (u.defeated) defeatedNPCs.push(u.npcId);
    });

    if (defeatedNPCs.length > 0) {
      defeatedNPCs.forEach(id => {
        const en = currentArea.npcs.find(e => e.id === id);
        if (en) {
          dispatch(addLog({ message: `${en.name} (${id}) is neutralized!`, type: 'combat' }));
          dispatch(addFact({ text: `Neutralized ${en.name}.`, questionKind: 'combat', isFollowUp: false }));
        }
      });
      handleVignetteProgression(dispatch, getState);
    }

    // NPC Retaliation (survivors only)
    // If immobilized, maybe they don't attack?
    // For simplicity, we'll let existing logic handle pure damage, but we should verify status effects in a real turn system.
    // Since this thunk resolves "One Round", we should respect the just-applied status? 
    // Yes, but `resolveNPCAttack` doesn't know about the status we just applied in `updates`.
    // We would need to pass `updates` to `resolveNPCAttack` or just apply it.
    // Current architecture limitation: State is not updated yet.
    // So we can check if the enemy IS immobilized in `updates` list.

    let playerDamage = 0;
    const survivors = currentArea.npcs.filter(e => !defeatedNPCs.includes(e.id));

    if (survivors.length > 0) {
      const attacker = survivors[0]; // Primary attacker
      const attackerUpdate = updates.find(u => u.npcId === attacker.id);
      const isAttackerDisabled = attackerUpdate?.statusEffects?.some(s => s.id === "immobilized" || s.id === "stun" || s.id === "fear" || s.id === "confused"); // Fear/Confuse might not disable but reduce hit, but for now treating as disable or just ignoring

      // If immobilized/confused/fear, maybe skip attack or reduce it?
      // Let's verify: Immobilize -> Skip. Fear -> ? Confuse -> Self damage?
      if (isAttackerDisabled) {
        dispatch(addLog({ message: `${attacker.name} is affected by status and cannot counter properly!`, type: 'combat' }));
      } else {
        const npcAttack = resolveNPCAttack(attacker, player);
        dispatch(addLog({ message: npcAttack.message, type: 'combat' }));
        if (npcAttack.hit) playerDamage = npcAttack.damage;
      }
    }

    const lootItems = defeatedNPCs.map(id => {
      const e = currentArea.npcs.find(en => en.id === id);
      return e ? getNPCLoot(e.name) : [];
    }).flat();

    return {
      npcId: primaryUpdate?.npcId || "",
      npcDamage: primaryUpdate?.damage || 0,
      npcDefeated: primaryUpdate?.defeated || false,
      playerDamage,
      xpGain: defeatedNPCs.length * 50,
      lootItems,
      aoeUpdates: updates,
      playerStatusUpdates,
      playerHeal,
      now: Date.now()
    };
  }
);

export const engageHostiles = createAsyncThunk(
  'game/engageHostiles',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { player, currentArea, selectedCapabilityId } = state.game;
    if (!player || !currentArea) return null;
    if (selectedCapabilityId) {
      await dispatch(castCapability({ capabilityId: selectedCapabilityId }));
      dispatch(selectCapability(null));
      return null;
    }
    if (currentArea.npcs.length === 0) {
      dispatch(addLog({ message: 'No hostiles to engage.', type: 'combat' }));
      return null;
    }
    const targetNPC = currentArea.npcs[0];
    let currentNPCHp = targetNPC.stats.hp;

    // Player vs NPC
    const duelResult = resolveDuel(player, targetNPC);
    dispatch(addLog({ message: duelResult.message, type: 'combat' }));

    let npcDamage = 0;
    if (duelResult.hit) {
      npcDamage += duelResult.damage;
      currentNPCHp -= duelResult.damage;
    }

    // Companions vs NPC
    if (player.companions && currentNPCHp > 0) {
      for (const companion of player.companions) {
        if (companion.stats.hp > 0) {
          const companionResult = resolveCompanionAttack(companion, targetNPC);
          dispatch(addLog({ message: companionResult.message, type: 'combat' }));
          if (companionResult.hit) {
            npcDamage += companionResult.damage;
            currentNPCHp -= companionResult.damage;
          }
        }
      }
    }

    let npcDefeated = false;
    if (currentNPCHp <= 0) {
      npcDefeated = true;
      dispatch(addLog({ message: `${targetNPC.name} has been neutralized!`, type: 'combat' }));
      dispatch(addFact({ text: `Effectively neutralized ${targetNPC.name}.`, questionKind: 'combat', isFollowUp: false }));
      handleVignetteProgression(dispatch, getState);
    }

    let playerDamage = 0;
    const companionUpdates: { id: string; damageTaken: number }[] = [];

    // NPC Retaliation
    if (!npcDefeated) {
      // Check for Stun/Immobilize check
      const isStunned = targetNPC.activeEffects?.some(e => e.id === "immobilized" || e.id === "stun");

      if (isStunned) {
        dispatch(addLog({ message: `${targetNPC.name} is stunned and cannot counter!`, type: 'combat' }));
      } else {
        // Determine Target: Player or Companion
        let targetId = 'player';
        const validCompanions = player.companions?.filter(c => c.stats.hp > 0) || [];

        // 25% chance to target a companion if any exist
        if (validCompanions.length > 0 && Math.random() < 0.25) {
          const victim = validCompanions[Math.floor(Math.random() * validCompanions.length)];
          targetId = victim.id;

          const victimDefender = {
            name: victim.name,
            defense: 10
          };

          const npcAttack = resolveNPCAttackOnCompanion(targetNPC, victimDefender);
          dispatch(addLog({ message: npcAttack.message, type: 'combat' }));
          if (npcAttack.hit) {
            companionUpdates.push({ id: victim.id, damageTaken: npcAttack.damage });
          }
        } else {
          // Target Player
          const npcAttack = resolveNPCAttack(targetNPC, player);
          dispatch(addLog({ message: npcAttack.message, type: 'combat' }));
          if (npcAttack.hit) playerDamage = npcAttack.damage;
        }
      }
    }

    const now = Date.now();
    const lootItems = npcDefeated ? getNPCLoot(targetNPC.name) : [];
    return { npcId: targetNPC.id, npcDamage, npcDefeated, playerDamage, companionUpdates, xpGain: npcDefeated ? 50 : 0, lootItems, now };
  }
);


export const respawnPlayer = createAsyncThunk('game/respawn', async (_, { dispatch }) => {
  dispatch(addLog({ message: 'Resurrecting...', type: 'system' }));
  dispatch(addLog({ message: 'You gasp for breath as the void releases you.', type: 'system' }));
  dispatch(addFact({ text: 'Died and returned from the void.', questionKind: 'respawn', isFollowUp: false }));
});
