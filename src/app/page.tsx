
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { initializeGame, askOracle, movePlayer, addLog, selectPlayer, selectCurrentRoom, selectLogs } from '@/features/game/slice/gameSlice';
import { setOracleInput, selectOracleInput } from '@/features/core/ui/slice/uiSlice';
import { Shield, Zap, Skull, Map as MapIcon, Terminal, Activity, Crosshair, HelpCircle, Send } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 lg:gap-3 bg-zinc-950 border border-zinc-800 px-2 lg:px-3 py-1 lg:py-2 min-w-[60px] lg:min-w-[80px]">
      <div className="opacity-80 scale-75 lg:scale-100">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[6px] lg:text-[8px] text-zinc-500 uppercase font-bold">{label}</span>
        <span className="text-xs lg:text-sm font-bold text-zinc-200 leading-none">{value}</span>
      </div>
    </div>
  );
}

function GameButton({ children, onClick, variant = "default", icon }: { children: React.ReactNode; onClick: () => void; variant?: "default" | "danger" | "magic"; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 lg:h-12 px-3 lg:px-6 border transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 text-[10px] lg:text-xs font-bold tracking-wider uppercase group w-full lg:w-auto",
        variant === "default" && "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500",
        variant === "danger" && "border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40 hover:border-red-500",
        variant === "magic" && "border-purple-900/50 bg-purple-950/20 text-purple-400 hover:bg-purple-900/40 hover:border-purple-500"
      )}
    >
      {icon}
      <span className="hidden sm:inline group-hover:translate-x-1 transition-transform">{children}</span>
    </button>
  );
}

function NavButton({ dir, onClick, active }: { dir: string; onClick: () => void; active: boolean }) {
  return (
    <button
      disabled={!active}
      onClick={onClick}
      className={cn(
        "w-full h-full border transition-all duration-300 flex items-center justify-center text-[10px] font-bold rounded-sm touch-manipulation",
        active
          ? "border-cyan-900/50 bg-cyan-950/20 text-cyan-500 active:bg-cyan-500 active:text-zinc-950 lg:hover:bg-cyan-500 lg:hover:text-zinc-950 lg:hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          : "border-zinc-900/50 bg-zinc-950/50 text-zinc-800 cursor-not-allowed"
      )}
    >
      {dir}
    </button>
  );
}

export default function GamePage() {
  const dispatch = useDispatch<AppDispatch>();
  const player = useSelector(selectPlayer);
  const currentRoom = useSelector(selectCurrentRoom);
  const logs = useSelector(selectLogs);
  const oracleInput = useSelector(selectOracleInput);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!player) {
      dispatch(initializeGame());
    }
  }, [dispatch, player]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleAskOracle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleInput.trim()) return;
    dispatch(askOracle(oracleInput));
    dispatch(setOracleInput(""));
  };

  if (!player || !currentRoom) return <div className="h-screen w-screen bg-black text-red-500 font-mono flex items-center justify-center animate-pulse text-xs lg:text-base">INITIALIZING...</div>;

  return (
    <main className="h-screen w-screen flex flex-col lg:grid lg:grid-cols-[1fr_400px] lg:grid-rows-[80px_1fr_250px] gap-2 p-2 bg-zinc-950 font-mono text-zinc-300 overflow-hidden">

      {/* 1. TOP BAR: Player Stats */}
      <header className="flex-shrink-0 lg:col-span-2 vengeance-border bg-zinc-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 lg:px-8 gap-3">

        {/* Identity & Health Row */}
        <div className="flex items-center gap-4 lg:gap-8 w-full lg:w-auto">
          <Image src="/logo.png" alt="Forboc AI" width={24} height={24} className="logo-theme object-contain shrink-0 lg:w-[32px] lg:h-[32px]" />
          <div className="flex flex-col">
            <span className="text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Ident: {player.characterClass}</span>
            <span className="text-sm lg:text-xl font-bold text-cyan tracking-tighter leading-none">{player.name} <span className="text-[8px] lg:text-xs text-zinc-600 align-top">LVL {player.level}</span></span>
          </div>

          <div className="flex-1 flex gap-2 lg:gap-8 justify-end lg:justify-start">
            {/* Simple Bars for Mobile */}
            <div className="w-20 lg:w-48">
              <div className="h-1 lg:h-2 w-full bg-zinc-950/50 border border-zinc-800">
                <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
              </div>
            </div>
            <div className="w-20 lg:w-48">
              <div className="h-1 lg:h-2 w-full bg-zinc-950/50 border border-zinc-800">
                <div className="h-full bg-cyan-600 transition-all duration-500" style={{ width: `${(player.stress / player.maxStress) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row (Hidden on very small screens or compacted) */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-4 lg:gap-8">
          <div className="flex items-center gap-2 lg:gap-6">
            <StatBox label="STR" value={player.Str} icon={<Shield size={12} className="text-orange-500 lg:w-[14px] lg:h-[14px]" />} />
            <StatBox label="AGI" value={player.Agi} icon={<Zap size={12} className="text-yellow-500 lg:w-[14px] lg:h-[14px]" />} />
            <StatBox label="ARC" value={player.Arcane} icon={<Skull size={12} className="text-purple-500 lg:w-[14px] lg:h-[14px]" />} />
          </div>

          <div className="border-l border-zinc-800 pl-4 lg:pl-8 flex flex-col items-end">
            <span className="text-[8px] lg:text-[9px] text-zinc-600 uppercase tracking-widest">Surge</span>
            <span className="text-lg lg:text-2xl font-black text-white leading-none">{player.surgeCount}</span>
          </div>
        </div>
      </header>

      {/* 2. CENTER STAGE: Viewport */}
      {/* On mobile, this takes remaining space minus logs */}
      <section className="flex-1 min-h-0 vengeance-border bg-zinc-900/10 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/80 pointer-events-none" />

        <div className="w-full max-w-2xl text-center z-10 relative overflow-y-auto max-h-full scrollbar-hide">
          <span className="text-[8px] lg:text-[10px] text-red-500/50 tracking-[0.5em] uppercase mb-1 block">{currentRoom.biome}</span>
          <h2 className="text-2xl lg:text-4xl font-black text-white mb-4 lg:mb-6 tracking-widest uppercase contrast-125 drop-shadow-md">
            {currentRoom.title}
          </h2>
          <div className="w-16 lg:w-24 h-[1px] lg:h-[2px] bg-red-900 mx-auto mb-4 lg:mb-8" />
          <p className="text-sm lg:text-lg leading-relaxed text-zinc-400 font-serif italic mb-6">
            "{currentRoom.description}"
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {currentRoom.hazards.length > 0 && (
              <div className="p-2 lg:p-4 bg-red-950/30 border border-red-900/50 inline-flex items-center gap-2 animate-pulse">
                <Activity size={14} className="text-red-500 lg:w-[18px] lg:h-[18px]" />
                <span className="text-red-500 font-bold text-[10px] lg:text-sm tracking-widest">HAZARD!</span>
              </div>
            )}
          </div>

          {currentRoom.enemies.length > 0 && (
            <div className="mt-6 lg:mt-12 grid grid-cols-1 gap-2 lg:gap-4 w-full">
              {currentRoom.enemies.map(enemy => (
                <div key={enemy.id} className="p-3 lg:p-6 bg-zinc-950/80 border border-red-900/30 text-left flex justify-between items-center">
                  <div>
                    <h3 className="text-red-500 font-bold text-sm lg:text-xl uppercase tracking-wider flex items-center gap-2">
                      <Skull size={14} className="lg:w-[18px] lg:h-[18px]" /> {enemy.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm lg:text-xl font-bold text-white">HP {enemy.hp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. NEURAL LOG (Collapsible or smaller on mobile) */}
      <aside className="vengeance-border bg-zinc-950 flex flex-col h-[150px] lg:h-full lg:border-l-0">
        <div className="flex items-center gap-2 p-2 lg:p-3 border-b border-zinc-800 bg-zinc-900/20">
          <Terminal size={12} className="text-cyan-500 lg:w-[14px] lg:h-[14px]" />
          <span className="text-[8px] lg:text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Neural Log</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {logs.map((log) => (
            <div key={log.id} className="text-[10px] lg:text-xs">
              <p className={cn(
                "leading-relaxed pl-2 border-l-2",
                log.type === "combat" ? "text-red-400 border-red-900" :
                  log.type === "system" ? "text-cyan-400 border-cyan-900" :
                    log.type === "loom" ? "text-purple-300 border-purple-900 bg-purple-950/10 p-1 italic" :
                      "text-zinc-400 border-zinc-800"
              )}>
                <span className="opacity-50 mr-2">[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                {log.message}
              </p>
            </div>
          ))}
        </div>

        {/* Oracle Input */}
        <div className="p-2 lg:p-4 border-t border-zinc-800 bg-zinc-900/30">
          <form onSubmit={handleAskOracle} className="flex gap-2 mb-1">
            <input
              type="text"
              value={oracleInput}
              onChange={(e) => dispatch(setOracleInput(e.target.value))}
              placeholder="Ask Oracle..."
              className="w-full bg-zinc-950 border border-zinc-800 text-[10px] lg:text-xs text-purple-200 px-2 lg:px-3 py-2 lg:py-3 focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-700"
            />
            <button type="submit" className="bg-purple-900/20 border border-purple-500/30 text-purple-400 hover:bg-purple-900/40 hover:text-white px-3 flex items-center justify-center transition-colors">
              <Send size={12} className="lg:w-[14px] lg:h-[14px]" />
            </button>
          </form>
        </div>
      </aside>

      {/* 4. BOTTOM DECK: Action Grid */}
      <footer className="flex-shrink-0 vengeance-border lg:col-span-2 bg-zinc-900/80 p-3 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-between">

        {/* Navigation & Actions Container */}
        <div className="flex w-full lg:w-auto gap-4 justify-between lg:justify-start">
          {/* D-PAD */}
          <div className="grid grid-cols-3 gap-1 w-24 h-24 lg:w-32 lg:h-24 flex-shrink-0">
            <div />
            <NavButton dir="N" onClick={() => dispatch(movePlayer("North"))} active={!!currentRoom.exits.North} />
            <div />
            <NavButton dir="W" onClick={() => dispatch(movePlayer("West"))} active={!!currentRoom.exits.West} />
            <div className="bg-zinc-800/50 flex items-center justify-center rounded">
              <MapIcon size={12} className="text-zinc-500 lg:w-[16px] lg:h-[16px]" />
            </div>
            <NavButton dir="E" onClick={() => dispatch(movePlayer("East"))} active={!!currentRoom.exits.East} />
            <div />
            <NavButton dir="S" onClick={() => dispatch(movePlayer("South"))} active={!!currentRoom.exits.South} />
            <div />
          </div>

          {/* Action Buttons (Stacked on mobile) */}
          <div className="grid grid-cols-1 lg:flex gap-2 lg:gap-4 flex-1">
            <GameButton onClick={() => dispatch(addLog({ message: "Scanning current sector...", type: "exploration" }))} icon={<Crosshair size={14} className="lg:w-[16px] lg:h-[16px]" />}>
              SCAN
            </GameButton>
            <GameButton onClick={() => dispatch(addLog({ message: "You ready your weapon.", type: "combat" }))} variant="danger" icon={<Skull size={14} className="lg:w-[16px] lg:h-[16px]" />}>
              ENGAGE
            </GameButton>
            <GameButton onClick={() => dispatch(addLog({ message: "You attempt to commune with the void...", type: "loom" }))} variant="magic" icon={<Activity size={14} className="lg:w-[16px] lg:h-[16px]" />}>
              COMMUNE
            </GameButton>
          </div>
        </div>

        {/* Inventory / Spells Mini-View (Hidden on Mobile for cleaner UI) */}
        <div className="hidden lg:flex gap-4 border-l border-zinc-800 pl-8">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Known Spells</span>
            <div className="flex gap-1">
              {player.spells.map(spell => (
                <div key={spell} className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-cyan-500 hover:text-cyan-500 cursor-pointer transition-colors" title={spell}>
                  <Zap size={14} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Inventory</span>
            <div className="flex gap-1">
              {player.inventory.map(item => (
                <div key={item.id} className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 cursor-pointer transition-colors" title={item.name}>
                  <Shield size={14} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </footer>
    </main>
  );
}
