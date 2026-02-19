"use client";

import { OracleForm, ActionDeck } from "@/components/elements/unique";
import type { AgentPlayer, Area } from "@/features/game/types";

export function GameScreenFooter({
  oracleInput,
  onOracleChange,
  onOracleSubmit,
  player,
  currentArea,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onCommune,
  onOpenInventory,
  onOpenCapabilities,
  onOpenSkills,
  onOpenCompanion,
  autoPlay,
  onToggleAutoPlay,
}: {
  oracleInput: string;
  onOracleChange: (v: string) => void;
  onOracleSubmit: (e: React.FormEvent) => void;
  player: AgentPlayer;
  currentArea: Area;
  onMove: (dir: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onCommune: () => void;
  onOpenInventory?: () => void;
  onOpenCapabilities?: () => void;
  onOpenSkills?: () => void;
  onOpenCompanion?: () => void;
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
        currentArea={currentArea}
        onMove={onMove}
        onMapClick={onMapClick}
        onScan={onScan}
        onEngage={onEngage}
        onCommune={onCommune}
        onOpenInventory={onOpenInventory}
        onOpenCapabilities={onOpenCapabilities}
        onOpenSkills={onOpenSkills}
        onOpenCompanion={onOpenCompanion}
        autoPlay={autoPlay}
        onToggleAutoPlay={onToggleAutoPlay}
      />
    </>
  );
}
