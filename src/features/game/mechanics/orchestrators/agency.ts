import { createAsyncThunk } from '@reduxjs/toolkit';
import { askAgentCortex } from '@/features/game/sdk/forbocRuntime';
import { computeAwareness } from '@/features/game/mechanics/systems/ai/awareness';
import { getPortraitForAgent } from '@/features/game/sdk/portraits';
import { setAgentPondering, clearAgentPondering, addLog } from '../../store/gameSlice';
import { toObservation } from '../../sdk/mappers';
import type { RootState } from '@/features/core/store';
import {
    agentObservationCommitted,
    selectLastAgentObservation,
} from '@/features/game/sdk/state/forbocSlice';

/**
 * Generic Agent Tick Thunk.
 *
 * Executes the 7-step Neuro-Symbolic Protocol for any agent.
 */
export const runAgentTick = createAsyncThunk(
    'game/runAgentTick',
    async (arg: { agentId: string; type: 'npc' | 'companion' | 'player'; persona?: string; soulId?: string; lore?: { role: string; description: string } }, { getState, dispatch }): Promise<{ agentId: string; nextTickAt: number } | undefined> => {
        const rootState = getState() as RootState;
        const { agentId, type, persona, lore } = arg;

        // 1. OBSERVE
        // Not using awareness currently in standard agency tick, kept for future expansions
        computeAwareness(rootState.game);

        // Map state to agent-specific observation
        const observation = toObservation(rootState.game);

        if (selectLastAgentObservation(rootState, agentId) === observation.content) {
            const delay = 5000 + Math.random() * 5000;
            return { agentId, nextTickAt: Date.now() + delay };
        }

        // 2. SDK DECISION
        try {
            const agentPersona = persona || (type === 'npc' ? 'Neutral Entity' : 'Loyal Companion');
            const agentType = type === 'companion' ? 'companion' : 'npc';

            dispatch(setAgentPondering(agentId));

            const response = await askAgentCortex({
                agentId,
                displayName: agentPersona,
                agentType,
                lore,
            }, observation.content);

            dispatch(agentObservationCommitted({ agentId, observation: observation.content }));

            if (response.dialogue) {
                const portraitUrl = getPortraitForAgent(type, lore?.role ?? agentPersona);
                dispatch(addLog({ message: `[${agentPersona} · ${agentId}] ${response.dialogue}`, type: 'dialogue', portraitUrl }));
            }

            // 3. ACTUATE
            if (response.action) {
                console.log(`Agency: Agent [${agentId}] suggests [${response.action.type}] (not actuated)`);
            }
        } catch (e) {
            console.warn(`Agency: Tick failed for agent [${agentId}]:`, e);
        } finally {
            dispatch(clearAgentPondering(agentId));
        }

        // 4. SCHEDULE
        const delay = 5000 + Math.random() * 5000;
        return { agentId, nextTickAt: Date.now() + delay };
    }
);
