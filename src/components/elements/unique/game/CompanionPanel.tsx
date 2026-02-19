import { Users, Sword, Shield, Eye } from "lucide-react";
import type { AgentPlayer } from "@/features/game/types";
import { Modal } from "@/components/elements/generic";

interface CompanionPanelProps {
  player: AgentPlayer;
  onClose: () => void;
}

export function CompanionPanel({ player, onClose }: CompanionPanelProps) {
  const companions = player.companions || [];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Warrior":
        return <Sword className="w-4 h-4 text-palette-accent-dim" />;
      case "Scout":
        return <Eye className="w-4 h-4 text-palette-accent-mid" />;
      case "Mystic":
        return <Shield className="w-4 h-4 text-palette-accent-soft" />;
      default:
        return <Users className="w-4 h-4 text-palette-muted" />;
    }
  };

  return (
    <Modal
      title="Companions"
      titleIcon={<Users className="w-5 h-5 text-palette-accent-lime" />}
      onClose={onClose}
      maxWidth="2xl"
      data-testid="companion-panel"
    >
      <div className="space-y-4">
        {companions.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-palette-border rounded text-palette-muted">
            <p>You have no companions.</p>
            <p className="text-xs mt-2">Hire mercenaries from Captains in the tower.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {companions.map((comp) => (
              <div key={comp.id} className="p-3 border border-palette-border bg-palette-bg-mid/10 rounded flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(comp.role)}
                    <span className="font-bold text-palette-white">{comp.name}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-palette-bg-dark border border-palette-border text-palette-muted">
                      {comp.role}
                    </span>
                  </div>
                  <div className="text-xs text-palette-muted">
                    HP: {comp.hp} / {comp.maxHp}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-palette-bg-dark rounded-full overflow-hidden border border-palette-border/50">
                  <div
                    className="h-full bg-palette-accent-dim transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (comp.hp / comp.maxHp) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-palette-muted-light line-clamp-2 md:line-clamp-none italic">
                  &quot;{comp.description}&quot;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
