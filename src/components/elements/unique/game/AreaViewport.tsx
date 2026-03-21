import { Activity, ShoppingBag, Clapperboard, Hash, Sparkles } from "lucide-react";
import type { Area, NonPlayerActor, Vendor, AreaFeature } from "@/features/game/types";
import { RuneSigil } from "../shared/Runes";
import { useAppSelector } from "@/features/core/store";
import { GameButton } from "@/components/elements/generic";
import { selectVignette, selectMainThread, selectCurrentScene } from "@/features/narrative/slice/narrativeSlice";

export function AreaViewport({
  area,
  onTradeVendor,
}: {
  area: Area;
  onTradeVendor?: (vendorId: string) => void;
}) {
  const vignette = useAppSelector(selectVignette);
  const mainThread = useAppSelector(selectMainThread);
  const currentScene = useAppSelector(selectCurrentScene);

  const isSceneHere = currentScene?.locationAreaId === area.id;

  return (
    <section className="flex-1 min-h-0 cozy-panel bg-palette-bg-mid/10 flex flex-col items-center justify-center p-1.5 sm:p-3 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(248,231,181,0.14),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(146,180,125,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-palette-bg-dark/70 pointer-events-none" />
      <div className="w-full max-w-2xl text-center z-10 relative overflow-y-auto max-h-full scrollbar-hide">
        <RuneSigil className="block mb-1.5 sm:mb-2" />
        <span className="font-runic text-palette-accent-mid/80 tracking-[0.28em] uppercase mb-1 block leading-tight animate-holo-flicker">ᚠ ᚢ ᚦ ᚨ ᚱ</span>
        <span className="text-palette-accent-mid/70 tracking-[0.22em] uppercase mb-1 block leading-tight">{area.regionalType}</span>
        <h2 className="font-display font-black text-palette-white mb-1.5 sm:mb-2 tracking-[0.14em] uppercase contrast-125 drop-shadow-md leading-tight lantern-glyph" data-text={area.title}>
          {area.title}
        </h2>
        <div className="w-8 sm:w-12 h-px bg-palette-border-light/60 mx-auto mb-1.5 sm:mb-2" />
        <p className="leading-relaxed text-palette-muted-light italic mb-2 sm:mb-3 max-w-xl mx-auto px-2">
          &quot;{area.description}&quot;
        </p>

        {/* Narrative Overlays */}
        {vignette && (
          <div className="mb-2 p-1.5 border border-palette-accent-soft/50 bg-palette-accent-soft/10 rounded-full inline-flex items-center justify-center gap-2 animate-pulse">
            <Clapperboard className="w-4 h-4 text-palette-accent-soft" />
            <span className="text-palette-accent-soft font-bold text-xs uppercase tracking-widest">
              Lantern Scene: {vignette.theme} ({vignette.stage})
            </span>
          </div>
        )}
        {!vignette && isSceneHere && mainThread && (
          <div className="mb-2 p-1.5 border border-palette-accent-mid/50 bg-palette-accent-mid/10 rounded-full inline-flex items-center justify-center gap-2">
            <Hash className="w-4 h-4 text-palette-accent-mid" />
            <span className="text-palette-accent-mid font-bold text-xs uppercase tracking-widest">
              Story Thread: {mainThread.name} ({currentScene?.stageOfScene})
            </span>
          </div>
        )}
        {area.hazards && area.hazards.length > 0 && (
          <div className="flex flex-col items-center gap-1 mt-1.5">
            <div className="p-1 sm:p-1.5 bg-palette-accent-dim/15 border border-palette-accent-dim/35 rounded-full inline-flex items-center gap-1 animate-pulse">
              <Activity className="app-icon text-palette-accent-bright" />
              <span className="text-palette-accent-bright font-bold tracking-widest">WAYWARD PATH</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {area.hazards.map((hazard) => (
                <span
                  key={hazard}
                  className="px-2 py-0.5 bg-palette-accent-mid/10 border border-palette-accent-mid/30 rounded-full text-palette-accent-mid text-[10px] uppercase tracking-[0.2em]"
                >
                  {hazard}
                </span>
              ))}
            </div>
          </div>
        )}
        {area.allies && area.allies.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1">
            {area.allies.map((ally: { id: string; name: string }) => (
              <span
                key={ally.id}
                className="px-2 py-0.5 bg-palette-accent-mid/20 border border-palette-accent-mid/50 text-palette-accent-mid text-xs uppercase"
              >
                {ally.name}
              </span>
            ))}
          </div>
        )}
        {area.vendors && area.vendors.length > 0 && (
          <div className="mt-1.5 flex flex-col items-center gap-1">
            {area.isMarketplace && (
              <span className="text-palette-accent-bright font-bold text-xs uppercase tracking-[0.3em] mb-0.5 animate-pulse">ᚠ Market Stalls ᚢ</span>
            )}
            <div className="flex flex-wrap justify-center gap-1">
              {area.vendors.map((vendor: Vendor) => (
                <GameButton
                  key={vendor.id}
                  icon={<ShoppingBag className="app-icon" />}
                  onClick={() => onTradeVendor?.(vendor.id)}
                  data-testid={`trade-vendor-${vendor.id}`}
                  aria-label={`Visit ${vendor.name}`}
                  className="px-2 py-0.5 h-auto bg-palette-accent-bright/16 border-palette-accent-bright/45 text-palette-accent-bright text-xs hover:bg-palette-accent-bright/24"
                >
                  {vendor.name}{vendor.specialty ? ` [${vendor.specialty}]` : ""} — Visit Stall
                </GameButton>
              ))}
            </div>
          </div>
        )}
        {area.npcs && area.npcs.length > 0 && (
          <div className="mt-2 sm:mt-3 grid grid-cols-1 gap-1 sm:gap-1.5 w-full">
            {area.npcs.map((npc: NonPlayerActor) => {
              const lastAttack = npc.lastActionTime || 0;
              const lastDamage = npc.lastDamageTime || 0;
              const latestActionTime = Math.max(lastAttack, lastDamage);

              let animationClass = "";
              if (latestActionTime > 0) {
                // If timestamps are close/equal, prioritize damage visualization
                if (lastDamage >= lastAttack) {
                  animationClass = "animate-enemy-damage";
                } else {
                  animationClass = "animate-enemy-attack";
                }
              }

              return (
                <div
                  key={`${npc.id}-${latestActionTime}`}
                  className={`p-1.5 sm:p-2 bg-palette-bg-dark/72 border border-palette-border-light/20 rounded-2xl text-left flex justify-between items-center ${animationClass}`}
                >
                  <h3 className="text-palette-accent-bright font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="app-icon" /> {npc.name}
                  </h3>
                  <span className="font-bold text-palette-white">Health {npc.stats.hp}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Base Camp Features */}
        {area.isBaseCamp && area.features && (
          <div className="mt-4 w-full border-t border-palette-border/60 pt-3">
            <h3 className="text-palette-accent-mid font-bold uppercase tracking-widest text-xs mb-2">Thimble Market Workboard</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {area.features.map((feature: AreaFeature, idx: number) => {
                if (feature.type === 'resource_plot') {
                  return (
                    <div key={idx} className="p-2 border border-palette-accent-soft/30 bg-palette-accent-soft/8 rounded-2xl flex flex-col items-center min-w-[120px]">
                      <span className="text-xs text-palette-muted uppercase">Moon Garden</span>
                      <span className="font-bold text-palette-white capitalize">{feature.resourceId ?? 'Seasonal Crop'}</span>
                      <div className="w-full h-1 bg-palette-bg-dark mt-1 mb-1 rounded-full overflow-hidden">
                        <div className="h-full bg-palette-accent-soft transition-all duration-500" style={{ width: `${feature.progress}%` }} />
                      </div>
                      {feature.ready ? (
                        <GameButton
                          variant="magic"
                          className="text-xs px-2 py-0.5 h-auto"
                          onClick={() => window.dispatchEvent(new CustomEvent('harvest_crop', { detail: { index: idx } }))}
                        >
                          Gather
                        </GameButton>
                      ) : (
                        <span className="text-[10px] text-palette-muted-light">Growing quietly... ({feature.progress}%)</span>
                      )}
                    </div>
                  );
                }
                if (feature.type === 'work_station') {
                  return (
                    <div key={idx} className="p-2 border border-palette-accent-bright/30 bg-palette-accent-bright/5 rounded-2xl flex flex-col items-center min-w-[120px]">
                      <span className="text-xs text-palette-muted uppercase">Workshop</span>
                      <span className="font-bold text-palette-white capitalize">{feature.kind}</span>
                      <GameButton
                        className="mt-2 text-xs px-2 py-0.5 h-auto"
                        onClick={() => window.dispatchEvent(new CustomEvent('open_crafting', { detail: { kind: feature.kind } }))}
                      >
                        Step In
                      </GameButton>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
