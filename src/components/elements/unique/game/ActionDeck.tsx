import { Map as MapIcon, Crosshair, Package, Play, Square, Swords, MessageCircle, Wand2, Box, Award } from "lucide-react";
import { GameButton, NavButton } from "@/components/elements/generic";
import type { Player, Room } from "@/features/game/types";

export function ActionDeck({
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
  player: Player;
  currentRoom: Room;
  onMove: (direction: string) => void;
  onMapClick: () => void;
  onScan: () => void;
  onEngage: () => void;
  onCommune: () => void;
  onOpenInventory?: () => void;
  onOpenSpells?: () => void;
  onOpenSkills?: () => void;
  autoPlay?: boolean;
  onToggleAutoPlay?: () => void;
}) {
  return (
    <footer className="shrink-0 vengeance-border bg-palette-bg-mid/80 p-1.5 sm:p-2 flex flex-row gap-1.5 sm:gap-2 items-center justify-start overflow-x-auto min-h-0" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="flex gap-1 sm:gap-1.5 justify-start items-center min-w-0 shrink-0">
        {onToggleAutoPlay != null && (
          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={autoPlay
              ? "p-1.5 rounded border border-palette-accent-red/50 bg-palette-accent-red/20 text-palette-accent-red hover:bg-palette-accent-red/30 transition-colors shrink-0"
              : "p-1.5 rounded border border-palette-border hover:border-palette-accent-cyan text-palette-muted hover:text-palette-accent-cyan transition-colors shrink-0"
            }
            data-testid="auto-play-toggle"
            aria-label={autoPlay ? "Stop auto-play" : "Start auto-play"}
            title={autoPlay ? "Stop auto-play" : "Start auto-play"}
          >
            {autoPlay ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
        <div className="grid grid-cols-3 gap-px sm:gap-0.5 w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <div />
          <NavButton dir="N" onClick={() => onMove("North")} active={!!currentRoom.exits.North} data-testid="move-north" />
          <div />
          <NavButton dir="W" onClick={() => onMove("West")} active={!!currentRoom.exits.West} data-testid="move-west" />
          <button
            type="button"
            onClick={onMapClick}
            className="w-full h-full border border-palette-accent-cyan/50 bg-palette-bg-dark/20 text-palette-accent-cyan flex items-center justify-center rounded-sm hover:bg-palette-accent-cyan/20 hover:border-palette-accent-cyan/50 transition-colors touch-manipulation"
            title="Toggle map"
            data-testid="map-toggle"
          >
            <MapIcon className="app-icon" />
          </button>
          <NavButton dir="E" onClick={() => onMove("East")} active={!!currentRoom.exits.East} data-testid="move-east" />
          <div />
          <NavButton dir="S" onClick={() => onMove("South")} active={!!currentRoom.exits.South} data-testid="move-south" />
          <div />
        </div>
        <div className="grid grid-cols-3 lg:flex gap-1 min-w-0 shrink-0">
          <GameButton onClick={onScan} icon={<Crosshair className="app-icon" />} data-testid="action-scan">
            SCAN
          </GameButton>
          <GameButton onClick={onEngage} variant="danger" icon={<Swords className="app-icon" />} data-testid="action-engage" disabled={currentRoom.enemies.length === 0}>
            ENGAGE
          </GameButton>
          <GameButton onClick={onCommune} variant="magic" icon={<MessageCircle className="app-icon" />} data-testid="action-commune">
            COMMUNE
          </GameButton>
        </div>
      </div>
      <div className="flex flex-row gap-2 border-l border-palette-border pl-2 items-center shrink-0">
        <button
          type="button"
          onClick={onOpenSpells}
          className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-cyan/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
          data-testid="spells-toggle"
          aria-label="View spells"
          title="View spells"
        >
          <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs flex items-center gap-1 whitespace-nowrap">
            <Wand2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">View spells</span>
          </span>
          <div className="flex gap-px">
            {player.spells.map((spell) => (
              <div
                key={spell}
                className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
                title={spell}
              >
                <Wand2 className="app-icon" />
              </div>
            ))}
          </div>
        </button>
        <button
          type="button"
          onClick={onOpenSkills}
          className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-gold/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
          data-testid="skills-toggle"
          aria-label="View skills"
          title="View skills"
        >
          <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs flex items-center gap-1 whitespace-nowrap">
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">View skills</span>
          </span>
          <div className="flex gap-px">
            {(player.skills ?? []).map((skill) => (
              <div
                key={skill}
                className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
                title={skill}
              >
                <Award className="app-icon" />
              </div>
            ))}
          </div>
        </button>
        <button
          type="button"
          onClick={onOpenInventory}
          className="flex flex-col gap-0.5 text-left border border-transparent hover:border-palette-accent-gold/50 rounded p-1 -m-1 transition-colors cursor-pointer min-w-0"
          data-testid="inventory-toggle"
          aria-label="Open inventory"
          title="View items"
        >
          <span className="text-palette-muted uppercase tracking-widest leading-tight text-xs flex items-center gap-1 whitespace-nowrap">
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">View items</span>
          </span>
          <div className="flex gap-px">
            {player.inventory.map((item) => (
              <div
                key={item.id}
                className="w-5 h-5 bg-palette-bg-mid border border-palette-border flex items-center justify-center text-palette-muted pointer-events-none"
                title={item.name}
              >
                <Box className="app-icon" />
              </div>
            ))}
          </div>
        </button>
      </div>
    </footer>
  );
}
