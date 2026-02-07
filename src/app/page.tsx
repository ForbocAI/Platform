"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { generateRoom } from "@/lib/quadar/engine";
import { Shield, Zap, Skull, Map as MapIcon, Terminal, Activity, Crosshair } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function GamePage() {
  const { player, currentRoom, history, setCurrentRoom, addLog, move } = useGameStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize starting room
    if (!currentRoom) {
      const startRoom = generateRoom("start", "Obsidian Spire");
      setCurrentRoom({
        ...startRoom,
        title: "Chamber in the Tower",
        description: "The air hums with suppressed Arcane pressure. Cold glass walls enclose you, reflecting only the dim crimson glow of the terminal.",
      });
    }
  }, [currentRoom, setCurrentRoom]);

  if (!isClient) return null;

  return (
    <main className="h-screen w-screen grid grid-cols-[1fr_350px] grid-rows-[80px_1fr_250px] gap-2 p-2 bg-zinc-950 font-mono text-zinc-300">

      {/* 1. TOP BAR: Player Stats */}
      <header className="col-span-2 vengeance-border bg-zinc-900/50 flex items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Image src="/logo.png" alt="Forboc AI" width={32} height={32} className="object-contain shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Ident: Ranger</span>
            <span className="text-xl font-bold text-cyan tracking-tighter">LVL {player.level}</span>
          </div>

          <div className="w-48">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-red">VITALITY</span>
              <span>{player.hp} / {player.maxHp}</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 vengeance-border !p-0">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
          </div>

          <div className="w-48">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-cyan">COGNITION</span>
              <span>{player.stress} / {player.maxStress}</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 vengeance-border !p-0">
              <div
                className="h-full bg-cyan-600 transition-all duration-500"
                style={{ width: `${(player.stress / player.maxStress) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <StatBox label="STR" value={player.Str} icon={<Shield size={14} />} />
          <StatBox label="AGI" value={player.Agi} icon={<Zap size={14} />} />
          <StatBox label="ARC" value={player.Arcane} icon={<Skull size={14} />} />
        </div>
      </header>

      {/* 2. CENTER STAGE: Viewport */}
      <section className="vengeance-border bg-zinc-900/30 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]" />

        {currentRoom && (
          <div className="max-w-xl text-center z-10">
            <h2 className="text-3xl font-bold text-red mb-4 tracking-widest uppercase">
              {currentRoom.title}
            </h2>
            <div className="w-32 h-[1px] bg-red-900 mx-auto mb-6" />
            <p className="text-lg leading-relaxed text-zinc-400 italic">
              "{currentRoom.description}"
            </p>

            {currentRoom.hazards.length > 0 && (
              <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 inline-block">
                <span className="text-red font-bold flex items-center gap-2">
                  <Activity size={18} /> HAZARD DETECTED: {currentRoom.hazards.join(", ")}
                </span>
              </div>
            )}

            {currentRoom.enemies.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4">
                {currentRoom.enemies.map(enemy => (
                  <div key={enemy.id} className="p-4 bg-red-950/40 border border-red-500 animate-pulse text-left flex justify-between items-center">
                    <div>
                      <h3 className="text-red font-bold text-xl uppercase italic tracking-tighter">{enemy.name}</h3>
                      <p className="text-xs text-red-400/70">{enemy.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-zinc-500">THREAT LEVEL</span>
                      <span className="text-2xl font-black text-red">AC {enemy.ac}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. RIGHT PANEL: The Log */}
      <aside className="vengeance-border bg-zinc-950 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
          <Terminal size={16} className="text-cyan" />
          <span className="text-xs font-bold tracking-widest text-zinc-500">VOX-LOG RECEPTACLE</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {history.map((log) => (
            <div key={log.id} className="text-xs border-l-2 border-zinc-800 pl-3 py-1">
              <span className="text-zinc-600 block mb-1">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <p className={cn(
                log.type === "combat" ? "text-red-400" :
                  log.type === "system" ? "text-cyan-400" :
                    "text-zinc-400"
              )}>
                {log.message}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* 4. BOTTOM DECK: Action Grid */}
      <footer className="vengeance-border bg-zinc-900/80 p-6 flex gap-6">
        <div className="grid grid-cols-2 gap-4 w-1/3">
          <GameButton onClick={() => addLog("Searching the area...", "exploration")}>
            <Crosshair size={18} /> Inspect
          </GameButton>
          <GameButton onClick={() => addLog("Your hand rests on your blade.", "combat")} variant="danger">
            <Skull size={18} /> Attack
          </GameButton>
          <GameButton onClick={() => addLog("Channeling the shadows...", "combat")}>
            <Activity size={18} /> Skill
          </GameButton>
          <GameButton onClick={() => addLog("Nothing worth salvaging here.", "exploration")}>
            <Shield size={18} /> Loot
          </GameButton>
        </div>

        <div className="h-full w-[1px] bg-zinc-800" />

        <div className="flex-1 flex flex-col justify-center items-center relative">
          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48">
            <div />
            <NavButton dir="North" onClick={() => move("North")} active={!!currentRoom?.exits.North} />
            <div />
            <NavButton dir="West" onClick={() => move("West")} active={!!currentRoom?.exits.West} />
            <div className="flex items-center justify-center text-zinc-500">
              <MapIcon size={24} />
            </div>
            <NavButton dir="East" onClick={() => move("East")} active={!!currentRoom?.exits.East} />
            <div />
            <NavButton dir="South" onClick={() => move("South")} active={!!currentRoom?.exits.South} />
            <div />
          </div>
          <span className="absolute bottom-[-10px] text-[8px] text-zinc-600 tracking-[0.5em] uppercase">Tactical Navigation Engaged</span>
        </div>
      </footer>
    </main>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-zinc-500 mb-1">{label}</span>
      <div className="flex items-center gap-2 text-zinc-100 font-bold">
        <span className="text-zinc-500">{icon}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

function GameButton({ children, onClick, variant = "default" }: { children: React.ReactNode; onClick: () => void; variant?: "default" | "danger" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "vengeance-button py-3 flex items-center justify-center gap-3",
        variant === "danger" ? "border-red-500 text-red-500 hover:bg-red-500/20" : ""
      )}
    >
      {children}
    </button>
  );
}

function NavButton({ dir, onClick, active }: { dir: string; onClick: () => void; active: boolean }) {
  return (
    <button
      disabled={!active}
      onClick={onClick}
      className={cn(
        "w-full h-10 border transition-all duration-300 flex items-center justify-center text-[10px] font-bold",
        active ? "border-cyan-900 bg-cyan-950/20 text-cyan-500 hover:bg-cyan-500 hover:text-white" : "border-zinc-800 text-zinc-700 opacity-20 cursor-not-allowed"
      )}
    >
      {dir[0]}
    </button>
  );
}
