"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { CLASS_PRESENTATION, CLASS_TEMPLATES, CHARACTER_CLASSES } from "@/features/game/mechanics";
import { GameButton, AppHeader } from "@/components/elements/generic";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { initializeGame } from "@/features/game/store/gameSlice";
import { selectSelectedClassId, setSelectedClassId } from "@/features/core/ui/slice/uiSlice";
import { selectIsLoading } from "@/features/game/store/gameSlice";
import { getClassPortraitUrl, getClassFullPortraitUrl } from "@/features/game/sdk/portraits";
import { Activity, Sparkles, Swords, Wind, Wand2, Heart, Gauge, Gift } from "lucide-react";
import type { AgentClass } from "@/features/game/types";
import presentationData from '../../../data/presentation/class-selection.json';

const PARTICLE_THEME: Record<AgentClass, { color: string; drift: "up" | "side" }> = {
  "Wayfinder": { color: "var(--accent-bright)", drift: "up" },
  "Bridgekeeper": { color: "var(--accent-dim)", drift: "up" },
  "Thornwarden": { color: "var(--accent-dim)", drift: "up" },
  "Ironbark Sentinel": { color: "var(--accent-bright)", drift: "up" },
  "Mist Drifter": { color: "var(--accent-soft)", drift: "side" },
  "Windguard Scout": { color: "var(--palette-white)", drift: "side" },
  "Glow Sentry": { color: "var(--accent-green)", drift: "up" },
  "Fog Wanderer": { color: "var(--accent-soft)", drift: "side" },
  "Thunderoak Elder": { color: "var(--accent-green)", drift: "up" },
  "Hearthkeeper": { color: "var(--accent-dim)", drift: "up" },
  "Tanglevine": { color: "var(--accent-green)", drift: "up" },
  "Silkspinner Scout": { color: "var(--accent-soft)", drift: "side" },
  "Dew Weaver": { color: "var(--accent-green)", drift: "up" },
};

const DEFAULT_PARTICLE_THEME = { color: "var(--accent-bright)", drift: "up" as const };

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function AmbientParticles({ classId }: { classId: AgentClass }) {
  const theme = PARTICLE_THEME[classId] ?? DEFAULT_PARTICLE_THEME;
  const seedBase = classId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const particles = Array.from({ length: 7 }, (_, i) => {
    const r1 = seededRandom(seedBase + i * 3.1);
    const r2 = seededRandom(seedBase + i * 7.7);
    const r3 = seededRandom(seedBase + i * 5.3);
    return {
      key: i,
      left: `${Math.round(r1 * 90) + 5}%`,
      bottom: `${Math.round(r2 * 60)}%`,
      size: 2 + Math.round(r3 * 2),
      duration: 4 + r1 * 3,
      delay: r2 * 4,
      driftX: theme.drift === "side" ? `${60 + r3 * 40}%` : `${(r3 - 0.5) * 20}px`,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.key}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            background: theme.color,
            boxShadow: `0 0 ${p.size * 2}px ${theme.color}`,
            animation: `particle-drift-${theme.drift} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            ["--particle-drift-x" as string]: p.driftX,
          }}
        />
      ))}
    </div>
  );
}

export function ClassSelectionScreen() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const selectedId = useAppSelector(selectSelectedClassId);
  const [previewedId, setPreviewedId] = useState<AgentClass | null>(null);
  const displayId = previewedId ?? selectedId;
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    clearTimeout(previewTimeoutRef.current ?? undefined);
  }, []);

  const startPreview = (id: AgentClass) => {
    clearTimeout(previewTimeoutRef.current ?? undefined);
    previewTimeoutRef.current = setTimeout(() => setPreviewedId(id), 200);
  };

  const cancelPreview = () => {
    clearTimeout(previewTimeoutRef.current ?? undefined);
    setPreviewedId(null);
  };

  const handleStart = () => {
    dispatch(initializeGame({ classId: selectedId }));
  };

  const template = CLASS_TEMPLATES[displayId];
  const presentation = CLASS_PRESENTATION[displayId];
  const selectedPortraitUrl = getClassFullPortraitUrl(displayId);

  const statMaxes = useMemo(() => {
    return CHARACTER_CLASSES.reduce((maxes, id) => {
      const stats = CLASS_TEMPLATES[id].baseStats;
      return {
        Str: Math.max(maxes.Str, stats.Str),
        Agi: Math.max(maxes.Agi, stats.Agi),
        Arcane: Math.max(maxes.Arcane, stats.Arcane),
        maxHp: Math.max(maxes.maxHp, stats.maxHp),
        maxStress: Math.max(maxes.maxStress, stats.maxStress),
      };
    }, CLASS_TEMPLATES[CHARACTER_CLASSES[0]].baseStats);
  }, []);

  const statBarPct = (value: number, max: number) => Math.round(Math.min(100, Math.max(4, (value / max) * 100)));

  return (
    <div className="flex flex-col items-center min-h-screen bg-palette-bg-dark text-palette-white" style={{ zoom: 0.8 }}>
      <AppHeader />
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6 h-full lg:h-[80vh] p-4 py-8">
        <div className="lg:col-span-1 bg-palette-bg-mid/70 border border-palette-border rounded p-4 overflow-y-auto space-y-2">
          <h2 className="text-palette-accent-bright uppercase font-bold text-sm mb-4">Choose your folk</h2>
          {CHARACTER_CLASSES.map((id) => {
            const portraitUrl = getClassPortraitUrl(id);
            return (
              <button
                key={id}
                onClick={() => dispatch(setSelectedClassId(id))}
                onMouseEnter={() => startPreview(id)}
                onMouseLeave={cancelPreview}
                onFocus={() => setPreviewedId(id)}
                onBlur={cancelPreview}
                className={`w-full flex items-center gap-3 text-left p-3 rounded border transition-colors ${selectedId === id ? "bg-palette-accent-bright/20 border-palette-accent-bright text-palette-accent-bright" : id === displayId ? "bg-palette-bg-mid/40 border-palette-accent-bright/50 text-palette-muted-light" : "bg-palette-bg-dark border-palette-border hover:bg-palette-bg-mid/40 text-palette-muted"}`}
              >
                <div className="w-10 h-10 rounded border border-palette-border bg-palette-bg-dark shrink-0 overflow-hidden">
                  {portraitUrl && (
                    <Image
                      src={portraitUrl}
                      alt={CLASS_PRESENTATION[id].name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-[0.22em] text-palette-muted-light">
                    {CLASS_PRESENTATION[id].folk}
                  </span>
                  <span className="block text-sm font-semibold mt-1 text-palette-white">
                    {CLASS_PRESENTATION[id].name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 bg-palette-bg-mid/70 border border-palette-border rounded p-6 flex flex-col">
          <div className="flex items-start gap-6 mb-6 border-b border-palette-border pb-6">
            <div className="portrait-frame relative aspect-[3/4] h-40 sm:h-48 lg:h-56 shrink-0 overflow-hidden bg-palette-bg-dark">
              {selectedPortraitUrl && (
                <>
                  <Image
                    src={selectedPortraitUrl}
                    alt={presentation.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 168px, (min-width: 640px) 144px, 120px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" aria-hidden />
                  <AmbientParticles classId={displayId} />
                </>
              )}
            </div>
            <div className="pt-2">
              <h1 className="text-2xl font-bold text-palette-white tracking-wide">{presentation.name}</h1>
              <p className="text-palette-muted text-sm uppercase tracking-[0.18em]">{presentation.role}</p>
              <p className="text-palette-muted-light text-sm mt-2 max-w-2xl">{presentation.blurb}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xs uppercase text-palette-muted-light font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" /> Base Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-palette-muted flex items-center gap-1.5"><Swords className="w-3.5 h-3.5" /> STR</span>
                    <span className="font-mono text-palette-accent-dim">{template.baseStats.Str}</span>
                  </div>
                  <div className="h-1 rounded-full bg-palette-bg-mid/60 overflow-hidden">
                    <div className="h-full rounded-full bg-palette-accent-dim" style={{ width: `${statBarPct(template.baseStats.Str, statMaxes.Str)}%` }} />
                  </div>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-palette-muted flex items-center gap-1.5"><Wind className="w-3.5 h-3.5" /> AGI</span>
                    <span className="font-mono text-palette-accent-mid">{template.baseStats.Agi}</span>
                  </div>
                  <div className="h-1 rounded-full bg-palette-bg-mid/60 overflow-hidden">
                    <div className="h-full rounded-full bg-palette-accent-mid" style={{ width: `${statBarPct(template.baseStats.Agi, statMaxes.Agi)}%` }} />
                  </div>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-palette-muted flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5" /> ARC</span>
                    <span className="font-mono text-palette-accent-soft">{template.baseStats.Arcane}</span>
                  </div>
                  <div className="h-1 rounded-full bg-palette-bg-mid/60 overflow-hidden">
                    <div className="h-full rounded-full bg-palette-accent-soft" style={{ width: `${statBarPct(template.baseStats.Arcane, statMaxes.Arcane)}%` }} />
                  </div>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-palette-muted flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> HP</span>
                    <span className="font-mono text-palette-accent-green">{template.baseStats.maxHp}</span>
                  </div>
                  <div className="h-1 rounded-full bg-palette-bg-mid/60 overflow-hidden">
                    <div className="h-full rounded-full bg-palette-accent-green" style={{ width: `${statBarPct(template.baseStats.maxHp, statMaxes.maxHp)}%` }} />
                  </div>
                </div>
                <div className="bg-palette-bg-dark p-2 rounded border border-palette-border flex flex-col gap-1.5 col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-palette-muted flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> Stress Cap</span>
                    <span className="font-mono text-palette-white">{template.baseStats.maxStress}</span>
                  </div>
                  <div className="h-1 rounded-full bg-palette-bg-mid/60 overflow-hidden">
                    <div className="h-full rounded-full bg-palette-white/70" style={{ width: `${statBarPct(template.baseStats.maxStress, statMaxes.maxStress)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs uppercase text-palette-muted-light font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Starting Gifts
              </h3>
              <div className="space-y-2">
                {presentation.signatureTalents.length > 0 ? (
                  presentation.signatureTalents.map((talent) => (
                    <div key={talent} className="bg-palette-bg-dark p-2 rounded border border-palette-border text-sm text-palette-accent-soft flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 shrink-0" /> {talent}
                    </div>
                  ))
                ) : (
                  <div className="text-palette-muted italic text-sm">None</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-palette-border">
            <GameButton
              variant="bright"
              onClick={handleStart}
              disabled={isLoading}
              className="w-full py-5 text-xl tracking-[0.3em] border-2 shadow-[0_0_36px_-6px] shadow-palette-accent-bright/60"
              showLabel={true}
            >
              {isLoading ? presentationData.loadingLabel : presentationData.startLabel}
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
