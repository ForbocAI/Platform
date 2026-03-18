import { Users, Sword, Shield, Eye } from "lucide-react";
import type { PlayerActor } from "@/features/game/types";
import { Modal } from "@/components/elements/generic";

interface CompanionPanelProps {
  player: PlayerActor;
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
          <div className="text-center p-8 border border-dashed border-palette-border rounded-[24px] text-palette-muted-light bg-palette-bg-dark/30">
            <p>No companions are traveling with you yet.</p>
            <p className="text-xs mt-2">Invite neighbors and familiars from Thimble Market as new routes reopen.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {companions.map((comp) => (
              <div key={comp.id} className="p-3 border border-palette-border/60 bg-palette-bg-mid/20 rounded-[24px] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(comp.role)}
                    <span className="font-bold text-palette-white">{comp.name}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-palette-bg-dark border border-palette-border/70 text-palette-muted-light">
                      {comp.role}
                    </span>
                  </div>
                  <div className="text-xs text-palette-muted-light">
                    Health: {comp.stats.hp} / {comp.stats.maxHp}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-palette-bg-dark rounded-full overflow-hidden border border-palette-border/50">
                  <div
                    className="h-full bg-palette-accent-soft transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (comp.stats.hp / comp.stats.maxHp) * 100))}%` }}
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
