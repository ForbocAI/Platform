
import { X, Users, Sword, Shield, Eye } from "lucide-react";
import type { Player } from "@/features/game/types";

interface ServitorPanelProps {
    player: Player;
    onClose: () => void;
}

export function ServitorPanel({ player, onClose }: ServitorPanelProps) {
    const servitors = player.servitors || [];

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "Warrior": return <Sword className="w-4 h-4 text-palette-accent-warm" />;
            case "Scout": return <Eye className="w-4 h-4 text-palette-accent-cyan" />;
            case "Mystic": return <Shield className="w-4 h-4 text-palette-accent-magic" />;
            default: return <Users className="w-4 h-4 text-palette-muted" />;
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-palette-bg-dark/95 backdrop-blur-sm p-3 sm:p-4 flex flex-col items-center justify-center overflow-y-auto" data-testid="servitor-panel">
            <div className="w-full max-w-2xl bg-palette-bg-dark border border-palette-border shadow-2xl flex flex-col max-h-full min-h-0 my-auto animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-palette-border bg-palette-bg-mid/50">
                    <h2 className="text-lg font-bold text-palette-white tracking-widest uppercase flex items-center gap-2">
                        <Users className="w-5 h-5 text-palette-accent-lime" />
                        Servitors
                    </h2>
                    <button onClick={onClose} className="p-2 -m-1 hover:text-palette-accent-red transition-colors touch-manipulation" data-testid="servitor-close" aria-label="Close servitors panel">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {servitors.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-palette-border rounded text-palette-muted">
                            <p>You have no servitors.</p>
                            <p className="text-xs mt-2">Hire mercenaries from Captains in the tower.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {servitors.map((comp) => (
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

                                    {/* HP Bar */}
                                    <div className="h-1.5 w-full bg-palette-bg-dark rounded-full overflow-hidden border border-palette-border/50">
                                        <div
                                            className="h-full bg-palette-accent-warm transition-all duration-300"
                                            style={{ width: `${Math.max(0, Math.min(100, (comp.hp / comp.maxHp) * 100))}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <p className="text-xs text-palette-muted-light line-clamp-2 md:line-clamp-none italic">
                                            "{comp.description}"
                                        </p>
                                        <div className="flex gap-2 text-[10px] text-palette-muted uppercase tracking-wider">
                                            <span>STR {comp.Str}</span>
                                            <span>AGI {comp.Agi}</span>
                                            <span>ARC {comp.Arcane}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
