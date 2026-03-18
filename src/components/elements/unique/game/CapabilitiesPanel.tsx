"use client";

import React from "react";
import { X, Zap } from "lucide-react";
import { PlayerActor } from "@/features/game/types";
import { CAPABILITIES } from "@/features/game/mechanics";
import { GameButton } from "@/components/elements/generic/GameButton";

interface CapabilitiesPanelProps {
  player: PlayerActor;
  onClose: () => void;
  onSelectCapability?: (id: string) => void;
}

export function CapabilitiesPanel({ player, onClose, onSelectCapability }: CapabilitiesPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,13,10,0.76)] backdrop-blur-md p-4">
      <div
        className="w-full max-w-2xl bg-[linear-gradient(180deg,rgba(67,54,42,0.98),rgba(27,21,17,0.98))] border border-palette-border-light/45 rounded-[28px] shadow-[0_22px_60px_rgba(0,0,0,0.34)] overflow-hidden"
        title="Known Gifts"
      >
        <div className="flex items-center justify-between p-4 border-b border-palette-border-light/25 bg-palette-bg-light/65">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-palette-highlight" />
            <h2 className="text-xl font-display font-bold tracking-[0.18em] uppercase text-palette-accent-bright">Gifts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-palette-bg/30 rounded-full transition-colors border border-transparent hover:border-palette-border-light/40"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {player.capabilities.learned.length === 0 ? (
            <p className="text-palette-muted-light text-sm">No gifts gathered yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {player.capabilities.learned.map((id) => {
                const capability = CAPABILITIES[id];
                if (!capability) return null;

                return (
                  <div
                    key={id}
                    className="p-4 border border-palette-border/35 rounded-[24px] bg-palette-bg-dark/35 hover:border-palette-highlight/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-palette-highlight">{capability.name}</h3>
                      {capability.magnitude && (
                        <span className="text-xs font-mono bg-palette-highlight/10 px-2 py-0.5 rounded-full border border-palette-highlight/20 text-palette-highlight">
                          {capability.magnitude}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-palette-muted mb-4 leading-relaxed">
                      {capability.description}
                    </p>
                    {onSelectCapability && (
                      <GameButton
                        variant="magic"
                        onClick={() => onSelectCapability(id)}
                        className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        CALL GIFT
                      </GameButton>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
