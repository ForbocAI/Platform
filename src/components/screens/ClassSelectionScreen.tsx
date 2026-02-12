"use client";

import { CLASS_TEMPLATES, CHARACTER_CLASSES } from "@/features/game/mechanics";
import { GameButton } from "@/components/elements/generic";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { initializeGame } from "@/features/game/slice/gameSlice";
import { selectSelectedClassId, setSelectedClassId } from "@/features/core/ui/slice/uiSlice";
import { selectIsLoading } from "@/features/game/slice/gameSlice";
import { User, Shield, Zap, Heart, Activity } from "lucide-react";

export function ClassSelectionScreen() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const selectedId = useAppSelector(selectSelectedClassId);

  const handleStart = () => {
    dispatch(initializeGame({ classId: selectedId }));
  };

  const template = CLASS_TEMPLATES[selectedId];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-palette-bg-dark text-palette-white p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6 h-full lg:h-[80vh]">
        {/* List */}
        <div className="lg:col-span-1 bg-palette-bg-mid/20 border border-palette-border rounded p-4 overflow-y-auto space-y-2">
          <h2 className="text-palette-accent-bright uppercase font-bold text-sm mb-4">Select Class</h2>
          {CHARACTER_CLASSES.map((id) => (
            <button
              key={id}
              onClick={() => dispatch(setSelectedClassId(id))}
              className={`w-full text-left p-3 rounded border transition-colors ${selectedId === id ? "bg-palette-accent-bright/20 border-palette-accent-bright text-palette-accent-bright" : "bg-palette-bg-dark border-palette-border hover:bg-palette-bg-mid/40 text-palette-muted"}`}
            >
              <span className="font-mono text-sm uppercase">{id}</span>
            </button>
          ))}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-palette-bg-mid/20 border border-palette-border rounded p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-6 border-b border-palette-border pb-4">
            <div className="p-3 bg-palette-bg-dark border border-palette-accent-bright rounded">
              <User className="w-8 h-8 text-palette-accent-bright" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-palette-white uppercase tracking-wider">{selectedId}</h1>
              <p className="text-palette-muted text-sm uppercase">Level 12 Initiation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Stats */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase text-palette-muted-light font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" /> Base Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex justify-between items-center">
                  <span className="text-xs text-palette-muted">STR</span>
                  <span className="font-mono text-palette-accent-dim">{template.baseStats.Str}</span>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex justify-between items-center">
                  <span className="text-xs text-palette-muted">AGI</span>
                  <span className="font-mono text-palette-accent-mid">{template.baseStats.Agi}</span>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex justify-between items-center">
                  <span className="text-xs text-palette-muted">ARC</span>
                  <span className="font-mono text-palette-accent-soft">{template.baseStats.Arcane}</span>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex justify-between items-center">
                  <span className="text-xs text-palette-muted">HP</span>
                  <span className="font-mono text-palette-accent-green">{template.baseStats.maxHp}</span>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex justify-between items-center col-span-2">
                  <span className="text-xs text-palette-muted">Stress Cap</span>
                  <span className="font-mono text-palette-white">{template.baseStats.maxStress}</span>
                </div>
              </div>
            </div>

            {/* Starting Loadout */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase text-palette-muted-light font-bold flex items-center gap-2">
                <Zap className="w-4 h-4" /> Starting Spells
              </h3>
              <div className="space-y-2">
                {template.startingSpells.length > 0 ? (
                  template.startingSpells.map((spell) => (
                    <div key={spell} className="bg-palette-bg-dark p-2 rounded border border-palette-border text-sm text-palette-accent-soft">
                      {spell.replace(/_/g, " ")}
                    </div>
                  ))
                ) : (
                  <div className="text-palette-muted italic text-sm">None</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-end">
            <GameButton
              variant="bright"
              onClick={handleStart}
              disabled={isLoading}
              className="px-8 py-4 text-lg"
            >
              {isLoading ? "Initializing..." : "Embark"}
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
