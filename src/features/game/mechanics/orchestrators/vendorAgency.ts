import { createAsyncThunk } from '@reduxjs/toolkit';
import { askVendorCortex } from '@/features/game/sdk/forbocRuntime';
import { getPortraitForAgent } from '@/features/game/sdk/portraits';
import { addLog } from '../../store/gameSlice';
import type { RootState } from '@/features/core/store';
import {
    selectLastVendorResponseAt,
    vendorResponseCommitted,
} from '@/features/game/sdk/state/forbocSlice';
import { vendorSpeakCooldownMilliseconds } from '@/features/game/sdk/runtimeAdapters';

export const runVendorTick = createAsyncThunk(
    'game/runVendorTick',
    async (
        arg: { vendorId: string; name: string; description: string; specialty?: string; displayType?: string; actionSummary: string },
        { dispatch, getState }
    ): Promise<void> => {
        const { vendorId, name, description, specialty, displayType, actionSummary } = arg;
        const lastResponseAt = selectLastVendorResponseAt(getState() as RootState, vendorId);
        const now = Date.now();
        if (lastResponseAt && now - lastResponseAt < vendorSpeakCooldownMilliseconds) return;
        try {
            const response = await askVendorCortex({
                vendorId,
                name,
                description,
                specialty,
            }, actionSummary);
            if (response.dialogue) {
                const portraitUrl = getPortraitForAgent('npc', displayType);
                dispatch(addLog({ message: `[${name} · ${vendorId}] ${response.dialogue}`, type: 'dialogue', portraitUrl }));
                dispatch(vendorResponseCommitted({ vendorId, respondedAt: Date.now() }));
            }
        } catch (e) {
            console.warn(`VendorAgency: Tick failed for vendor [${vendorId}]:`, e);
        }
    }
);
