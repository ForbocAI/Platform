"use client";

import { InquiryForm, ActionDeck } from "@/components/elements/unique";
import type { AgentPlayer, Area } from "@/features/game/types";

export function GameScreenFooter({
  inquiryInput,
  onInquiryChange,
  onInquirySubmit,
  player,
  currentArea,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onPerformInquiry,
  onOpenInventory,
  onOpenCapabilities,
  onOpenSkills,
  onOpenCompanion,
  autoPlay,
  onToggleAutoPlay,
}: {
  inquiryInput: string;
  onInquiryChange: (v: string) => void;
  onInquirySubmit: (e: React.FormEvent) => void;
  player: AgentPlayer;
  currentArea: Area;
  onMove: (dir: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onPerformInquiry: () => void;
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
        <InquiryForm
          value={inquiryInput}
          onChange={onInquiryChange}
          onSubmit={onInquirySubmit}
        />
      </div>
      <ActionDeck
        player={player}
        currentArea={currentArea}
        onMove={onMove}
        onMapClick={onMapClick}
        onScan={onScan}
        onEngage={onEngage}
        onPerformInquiry={onPerformInquiry}
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
