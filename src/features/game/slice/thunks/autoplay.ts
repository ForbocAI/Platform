import { createAsyncThunk } from '@reduxjs/toolkit';
import { harvestCrop, craftItem } from './baseCamp';
import { useItem, equipItem, pickUpGroundLoot } from './inventory';
import { castSpell, engageHostiles, respawnPlayer } from './combat';
import { movePlayer, scanSector } from './exploration';
import { tradeBuy, tradeSell } from './trade';
import { askOracle, communeWithVoid } from './oracle';
import { handleVignetteProgression } from '../constants';
import type { GameState } from '../types';

const DIRECTIONS = ['North', 'South', 'East', 'West'] as const;

export const runAutoplayTick = createAsyncThunk(
  'game/runAutoplayTick',
  async (_, { getState, dispatch }) => {
    const state = getState() as { game: GameState };
    const { currentRoom: room, player } = state.game;

    if (!room || !player) return;

    if (room.isBaseCamp && room.features) {
      let activityDone = false;
      room.features.forEach((f, idx) => {
        if (f.type === 'farming_plot' && f.ready) {
          dispatch(harvestCrop({ featureIndex: idx }));
          activityDone = true;
        }
      });
      player.recipes.forEach((recipe) => {
        const hasIngredients = recipe.ingredients.every(
          (ing) =>
            player.inventory.filter((i) => i.name === ing.name).length >= ing.quantity
        );
        if (hasIngredients) {
          dispatch(craftItem({ recipeId: recipe.id }));
          activityDone = true;
        }
      });
      if (activityDone) return;
    }

    if (player.hp > 0 && player.hp < player.maxHp * 0.4) {
      const healingItem = player.inventory.find(
        (i) =>
          i.type === 'consumable' &&
          (i.name.includes('Healing') || i.name.includes('Potion') || i.name.includes('Mushroom'))
      );
      if (healingItem) {
        await dispatch(useItem({ itemId: healingItem.id }));
        return;
      }
    }

    if (!player.equipment?.mainHand || !player.equipment?.armor) {
      if (player.inventory.length > 0) {
        if (!player.equipment?.mainHand) {
          const weapon = player.inventory.find((i) => i.type === 'weapon');
          if (weapon) {
            await dispatch(equipItem({ itemId: weapon.id, slot: 'mainHand' }));
            return;
          }
        }
        if (!player.equipment?.armor) {
          const armor = player.inventory.find((i) => i.type === 'armor');
          if (armor) {
            await dispatch(equipItem({ itemId: armor.id, slot: 'armor' }));
            return;
          }
        }
      }
    }

    if (room.enemies.length > 0) {
      const enemy = room.enemies[0];
      const useSpell =
        player.spells &&
        player.spells.length > 0 &&
        (enemy.hp > 20 || Math.random() < 0.4);
      if (useSpell) {
        const randomSpellId = player.spells[Math.floor(Math.random() * player.spells.length)];
        await dispatch(castSpell({ spellId: randomSpellId }));
      } else {
        await dispatch(engageHostiles());
      }
      return;
    }

    if (player.hp <= 0) {
      await dispatch(respawnPlayer());
      return;
    }

    if (player.hp < player.maxHp * 0.2 && room.enemies.length > 0) {
      const available = DIRECTIONS.filter((d) => room.exits[d]);
      if (available.length > 0) {
        const dir = available[Math.floor(Math.random() * available.length)];
        await dispatch(movePlayer(dir));
        return;
      }
    }

    if (room.merchants && room.merchants.length > 0) {
      if ((player.spirit ?? 0) > 50) {
        const merchant = room.merchants[0];
        const usefulItem = merchant.wares.find(
          (w) => w.type === 'relic' || w.type === 'weapon'
        );
        const item = usefulItem || merchant.wares[0];
        if (item) {
          await dispatch(tradeBuy({ merchantId: merchant.id, itemId: item.id }));
          return;
        }
      }
      if (
        player.inventory.length > 8 ||
        ((player.spirit ?? 0) < 10 && player.inventory.length > 2)
      ) {
        const itemToSell = player.inventory[player.inventory.length - 1];
        if (itemToSell) {
          await dispatch(tradeSell({ itemId: itemToSell.id }));
          return;
        }
      }
    }

    if (
      room.groundLoot &&
      room.groundLoot.length > 0 &&
      room.enemies.length === 0
    ) {
      await dispatch(pickUpGroundLoot({ itemId: room.groundLoot[0].id }));
      return;
    }

    const recentLogs = state.game.logs.slice(-5);
    const alreadyScanned = recentLogs.some(
      (l) =>
        l.message.includes('[SCAN RESULT]') && l.message.includes(room.title)
    );
    if (!alreadyScanned) {
      await dispatch(scanSector());
      return;
    }

    if (Math.random() < 0.1) {
      await dispatch(communeWithVoid());
      return;
    }

    const available = DIRECTIONS.filter((d) => room.exits[d]);
    if (available.length > 0) {
      const exploredRoomIds = Object.keys(state.game.exploredRooms);
      const unvisited = available.filter(
        (d) =>
          room.exits[d] === 'new-room' ||
          !exploredRoomIds.includes(room.exits[d]!)
      );
      const dir =
        unvisited.length > 0
          ? unvisited[Math.floor(Math.random() * unvisited.length)]
          : available[Math.floor(Math.random() * available.length)];
      await dispatch(movePlayer(dir));
      handleVignetteProgression(dispatch, getState);
      return;
    }

    const themes = [
      'What shadows lurk in this corner of the otherworld?',
      'Is the fabric of reality weakening here?',
      'Can I hear the whispers of the ancient ones?',
      'Is there a slipgate hidden amidst the eerige foliage?',
      "Does the presence of the Governor of Qua'dar linger here?",
    ];
    const question = themes[Math.floor(Math.random() * themes.length)];
    await dispatch(askOracle(question));
  }
);
