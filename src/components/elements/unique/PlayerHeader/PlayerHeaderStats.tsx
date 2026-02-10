import { Shield, Zap, Skull } from "lucide-react";
import { StatBox } from "@/components/elements/generic";
import type { Player } from "@/lib/game/types";

export function PlayerHeaderStats({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
      <StatBox label="STR" value={player.Str} icon={<Shield className="app-icon text-palette-accent-warm" />} />
      <StatBox label="AGI" value={player.Agi} icon={<Zap className="app-icon text-palette-accent-gold" />} />
      <StatBox label="ARC" value={player.Arcane} icon={<Skull className="app-icon text-palette-accent-magic" />} />
    </div>
  );
}
