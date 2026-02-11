"use client";

import { OracleForm, ActionDeck } from "@/components/elements/unique";
import type { Player, Room } from "@/features/game/types";

export function GameScreenFooter({
  oracleInput,
  onOracleChange,
  onOracleSubmit,
  player,
  currentRoom,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onCommune,
  onOpenInventory,
  onOpenSpells,
  onOpenSkills,
  autoPlay,
  onToggleAutoPlay,
}: {
  oracleInput: string;
  onOracleChange: (v: string) => void;
  onOracleSubmit: (e: React.FormEvent) => void;
  player: Player;
  currentRoom: Room;
  onMove: (dir: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onCommune: () => void;
  onOpenInventory?: () => void;
  onOpenSpells?: () => void;
  onOpenSkills?: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
}) {
  return (
    <>
      <div className="shrink-0 border-t border-palette-border">
        <OracleForm
          value={oracleInput}
          onChange={onOracleChange}
          onSubmit={onOracleSubmit}
        />
      </div>
      <ActionDeck
        player={player}
        currentRoom={currentRoom}
        onMove={onMove}
        onMapClick={onMapClick}
        onScan={onScan}
        onEngage={onEngage}
        onCommune={onCommune}
        onOpenInventory={onOpenInventory}
        onOpenSpells={onOpenSpells}
        onOpenSkills={onOpenSkills}
        autoPlay={autoPlay}
        onToggleAutoPlay={onToggleAutoPlay}
      />
    </>
  );
}
