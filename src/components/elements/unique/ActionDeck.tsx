"use client";

import { Shield, Zap, Skull, Map as MapIcon, Activity, Crosshair } from "lucide-react";
import { GameButton, NavButton } from "../generic";
import { usePlayButtonSound } from "@/features/audio";
import type { Player, Room } from "@/lib/quadar/types";

export function ActionDeck({
  player,
  currentRoom,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onCommune,
}: {
  player: Player;
  currentRoom: Room;
  onMove: (direction: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onCommune: () => void;
}) {
  const playSound = usePlayButtonSound();
  return (
    <footer className="shrink-0 vengeance-border bg-palette-bg-mid/80 p-1.5 sm:p-2 flex flex-col lg:flex-row gap-1.5 sm:gap-2 items-center justify-between h-full min-h-0">
      <div className="flex w-full lg:w-auto gap-1 sm:gap-1.5 justify-between lg:justify-start items-center min-w-0">
        <div className="grid grid-cols-3 gap-px sm:gap-0.5 w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <div />
          <NavButton dir="N" onClick={() => onMove("North")} active={!!currentRoom.exits.North} data-testid="move-north" aria-label="Move North" />
          <div />
          <NavButton dir="W" onClick={() => onMove("West")} active={!!currentRoom.exits.West} data-testid="move-west" aria-label="Move West" />
          <button
            type="button"
            onClick={() => {
              playSound();
              onMapClick();
            }}
            className="w-full h-full border border-palette-accent-cyan/50 bg-palette-bg-dark/20 text-palette-accent-cyan flex items-center justify-center rounded-sm hover:bg-palette-accent-cyan/20 hover:border-palette-accent-cyan/50 transition-colors touch-manipulation"
            title="Toggle map"
            data-testid="map-toggle"
            aria-label="Toggle map"
          >
            <MapIcon className="app-icon" />
          </button>
          <NavButton dir="E" onClick={() => onMove("East")} active={!!currentRoom.exits.East} data-testid="move-east" aria-label="Move East" />
          <div />
          <NavButton dir="S" onClick={() => onMove("South")} active={!!currentRoom.exits.South} data-testid="move-south" aria-label="Move South" />
          <div />
        </div>
        <div className="grid grid-cols-3 lg:flex gap-1 flex-1 min-w-0">
          <GameButton onClick={onScan} icon={<Crosshair className="app-icon" />} data-testid="action-scan" aria-label="Scan sector">
            SCAN
          </GameButton>
          <GameButton onClick={onEngage} variant="danger" icon={<Skull className="app-icon" />} data-testid="action-engage" aria-label="Engage enemy">
            ENGAGE
          </GameButton>
          <GameButton onClick={onCommune} variant="magic" icon={<Activity className="app-icon" />} data-testid="action-commune" aria-label="Commune with void">
            COMMUNE
          </GameButton>
        </div>
      </div>
      <div className="hidden lg:flex gap-2 border-l border-palette-border pl-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-palette-muted uppercase tracking-widest leading-tight">Known Spells</span>
          <div className="flex gap-px">
            {player.spells.map((spell) => (
              <div
                key={spell}
                className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted hover:border-palette-accent-cyan hover:text-palette-accent-cyan cursor-pointer transition-colors"
                title={spell}
              >
                <Zap className="app-icon" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-palette-muted uppercase tracking-widest leading-tight">Inventory</span>
          <div className="flex gap-px">
            {player.inventory.map((item) => (
              <div
                key={item.id}
                className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted hover:border-palette-accent-gold hover:text-palette-accent-gold cursor-pointer transition-colors"
                title={item.name}
              >
                <Shield className="app-icon" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
