import { AppDispatch, RootState } from '@/features/core/store';
import { runAutoplayTick } from '@/features/game/slice/gameSlice';
import { setAutoplaySchedule } from '@/features/core/ui/slice/uiSlice';

/**
 * BotOrchestrator — Centralized AI management service.
 * 
 * Replaces simple setIntervals with a deterministic tick cycle
 * that can manage multiple agents (Player, NPCs, Servitors).
 */
export interface BotRegistration {
    id: string;
    type: 'player' | 'npc' | 'servitor';
}

class BotOrchestrator {
    private dispatch: AppDispatch | null = null;
    private stateGetter: (() => RootState) | null = null;
    private registeredBots: Set<string> = new Set();
    private isRunning: boolean = false;

    /** Initialize with Redux primitives. Called by the bootstrap listener. */
    init(dispatch: AppDispatch, stateGetter: () => RootState) {
        this.dispatch = dispatch;
        this.stateGetter = stateGetter;
        console.log('BotOrchestrator: System Initialized.');
    }

    /** Register a bot context for orchestration. */
    register(id: string) {
        this.registeredBots.add(id);
        console.log(`BotOrchestrator: Registered Agent [${id}]`);
    }

    /**
     * Update cycle — called periodically by the middleware poll.
     * Orchestrates the 7-step protocol lifecycle for all active bots.
     */
    update() {
        if (!this.dispatch || !this.stateGetter) return;
        const state = this.stateGetter();

        // 1. Player Autoplay Orchestration
        if (state.ui.autoPlay) {
            this.orchestratePlayer(state);
        }

        // 2. NPC / Servitor Orchestration (Future expansion)
        // iterate over state.game.currentRoom.enemies and state.game.player.servitors
    }

    private orchestratePlayer(state: RootState) {
        if (state.ui.autoplayNextTickAt == null) return;

        if (Date.now() >= state.ui.autoplayNextTickAt) {
            // Step 1: Clear the schedule to prevent double-ticks
            this.dispatch!(setAutoplaySchedule({ nextTickAt: null }));

            // Step 2: Trigger the 7-step protocol thunk
            this.dispatch!(runAutoplayTick());
        }
    }
}

export const botOrchestrator = new BotOrchestrator();
