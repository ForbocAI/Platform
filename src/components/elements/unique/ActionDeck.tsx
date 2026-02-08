import { Shield, Zap, Skull, Map as MapIcon, Activity, Crosshair } from "lucide-react";
import { GameButton, NavButton } from "../generic";
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
  return (
    <footer className="shrink-0 vengeance-border bg-zinc-900/80 p-1.5 sm:p-2 lg:p-6 flex flex-col lg:flex-row gap-1.5 sm:gap-2 lg:gap-8 items-center justify-between h-full min-h-0">
      <div className="flex w-full lg:w-auto gap-1.5 sm:gap-2 lg:gap-4 justify-between lg:justify-start items-center min-w-0">
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-24 shrink-0">
          <div />
          <NavButton dir="N" onClick={() => onMove("North")} active={!!currentRoom.exits.North} data-testid="move-north" />
          <div />
          <NavButton dir="W" onClick={() => onMove("West")} active={!!currentRoom.exits.West} data-testid="move-west" />
          <button
            type="button"
            onClick={onMapClick}
            className="w-full h-full border border-cyan-900/50 bg-cyan-950/20 text-cyan-500 flex items-center justify-center rounded-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors touch-manipulation"
            title="Toggle map"
            data-testid="map-toggle"
          >
            <MapIcon size={10} className="sm:size-3 lg:size-4" />
          </button>
          <NavButton dir="E" onClick={() => onMove("East")} active={!!currentRoom.exits.East} data-testid="move-east" />
          <div />
          <NavButton dir="S" onClick={() => onMove("South")} active={!!currentRoom.exits.South} data-testid="move-south" />
          <div />
        </div>
        <div className="grid grid-cols-3 lg:flex gap-1 sm:gap-2 lg:gap-4 flex-1 min-w-0">
          <GameButton onClick={onScan} icon={<Crosshair size={12} className="sm:size-3.5 lg:size-4" />} data-testid="action-scan">
            SCAN
          </GameButton>
          <GameButton onClick={onEngage} variant="danger" icon={<Skull size={12} className="sm:size-3.5 lg:size-4" />} data-testid="action-engage">
            ENGAGE
          </GameButton>
          <GameButton onClick={onCommune} variant="magic" icon={<Activity size={12} className="sm:size-3.5 lg:size-4" />} data-testid="action-commune">
            COMMUNE
          </GameButton>
        </div>
      </div>
      <div className="hidden lg:flex gap-4 border-l border-zinc-800 pl-8">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Known Spells</span>
          <div className="flex gap-1">
            {player.spells.map((spell) => (
              <div
                key={spell}
                className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-cyan-500 hover:text-cyan-500 cursor-pointer transition-colors"
                title={spell}
              >
                <Zap size={14} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Inventory</span>
          <div className="flex gap-1">
            {player.inventory.map((item) => (
              <div
                key={item.id}
                className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 cursor-pointer transition-colors"
                title={item.name}
              >
                <Shield size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
