"use client";

import { Crosshair, Play, Square, Swords, MessageCircle } from "lucide-react";
import { GameButton } from "@/components/elements/generic";
import type { Sector } from "@/features/game/types";
import { DirectionalPad } from "./DirectionalPad";

export function ActionButtons({
  currentArea,
  onMove,
  onMapClick,
  onScan,
  onEngage,
  onPerformInquiry,
  autoPlay,
  onToggleAutoPlay,
}: {
  currentArea: Sector;
  onMove: (direction: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onPerformInquiry: () => void;
  autoPlay?: boolean;
  onToggleAutoPlay?: () => void;
}) {
  return (
    <div className="flex gap-1 sm:gap-1.5 justify-start items-center min-w-0 shrink-0">
      {onToggleAutoPlay != null && (
        <GameButton
          variant={autoPlay ? "danger" : "default"}
          icon={autoPlay ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          onClick={onToggleAutoPlay}
          className="shrink-0 p-1.5 h-6 sm:h-7"
          data-testid="auto-play-toggle"
          aria-label={autoPlay ? "Stop auto-play" : "Start auto-play"}
          title={autoPlay ? "Stop auto-play" : "Start auto-play"}
        />
      )}
      <DirectionalPad currentArea={currentArea} onMove={onMove} onMapClick={onMapClick} />
      <div className="grid grid-cols-3 lg:flex gap-1 min-w-0 shrink-0">
        <GameButton onClick={onScan} icon={<Crosshair className="app-icon" />} data-testid="action-scan">
          OBSERVE
        </GameButton>
        <GameButton
          onClick={onEngage}
          variant="danger"
          icon={<Swords className="app-icon" />}
          data-testid="action-engage"
          disabled={!currentArea.npcs || currentArea.npcs.length === 0}
        >
          CONFRONT
        </GameButton>
        <GameButton
          onClick={onPerformInquiry}
          variant="magic"
          icon={<MessageCircle className="app-icon" />}
          data-testid="action-perform-inquiry"
        >
          COMMUNE
        </GameButton>
      </div>
    </div>
  );
}
