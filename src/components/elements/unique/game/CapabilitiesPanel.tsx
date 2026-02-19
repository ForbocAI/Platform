"use client";

import React from "react";
import { X, Zap } from "lucide-react";
import { AgentPlayer } from "@/features/game/types";
import { CAPABILITIES } from "@/features/game/mechanics";
import { GameButton } from "@/components/elements/generic/GameButton";

interface CapabilitiesPanelProps {
  player: AgentPlayer;
  onClose: () => void;
  onSelectCapability?: (id: string) => void;
}

export function CapabilitiesPanel({ player, onClose, onSelectCapability }: CapabilitiesPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl bg-palette-bg border border-palette-accent rounded-lg shadow-2xl overflow-hidden"
        title="Known Capabilities"
      >
        <div className="flex items-center justify-between p-4 border-b border-palette-accent/30 bg-palette-accent/5">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-palette-highlight" />
            <h2 className="text-xl font-bold tracking-wider uppercase">Capabilities</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-palette-accent/20 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {player.capabilities.length === 0 ? (
            <p className="text-palette-muted text-sm">No capabilities learned yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {player.capabilities.map((id) => {
                const capability = CAPABILITIES[id];
                if (!capability) return null;

                return (
                  <div
                    key={id}
                    className="p-4 border border-palette-accent/20 rounded-lg bg-black/20 hover:border-palette-highlight/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-palette-highlight">{capability.name}</h3>
                      {capability.magnitude && (
                        <span className="text-xs font-mono bg-palette-highlight/10 px-2 py-0.5 rounded border border-palette-highlight/20 text-palette-highlight">
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
                        ACTIVATE
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
