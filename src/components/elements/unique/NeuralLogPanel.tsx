"use client";

import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameLogEntry } from "@/lib/game/types";
import { RuneSigil } from "./Runes";
import { useEffect, useRef } from "react";

export function NeuralLogPanel({ logs, children }: { logs: GameLogEntry[]; children?: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <aside className="vengeance-border bg-palette-bg-dark flex flex-col h-full min-h-0 w-full min-w-0">
      <div className="flex items-center gap-1.5 p-1.5 sm:p-2 border-b border-palette-border bg-palette-bg-mid/20 shrink-0">
        <Terminal className="app-icon text-palette-accent-cyan shrink-0 animate-ambient-breathe" />
        <span className="font-bold tracking-widest text-palette-muted uppercase leading-tight" data-macro-scramble>Neural Log</span>
        <RuneSigil className="ml-auto" />
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 sm:p-2 flex flex-col gap-1.5 sm:gap-2 scrollbar-thin scrollbar-thumb-palette-border scrollbar-track-transparent min-h-0 min-w-0"
      >
        {logs.map((log) => (
          <div key={log.id} className="min-w-0 wrap-break-word shrink-0">
            <p
              className={cn(
                "leading-relaxed pl-1.5 border-l-2 wrap-break-word",
                log.type === "combat" && "text-palette-accent-red border-palette-border-red",
                log.type === "system" && "text-palette-accent-cyan border-palette-border",
                log.type === "oracle" && "text-palette-accent-magic border-palette-border bg-palette-accent-magic/10 p-1 italic",
                log.type === "exploration" && "text-palette-muted-light border-palette-border"
              )}
            >
              <span className="opacity-50 mr-2 shrink-0">
                [{(() => {
                  const d = new Date(log.timestamp);
                  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                })()}]
              </span>
              <span className="wrap-break-word">{log.message}</span>
            </p>
          </div>
        ))}
        <div data-log-anchor className="shrink-0 min-h-1" style={{ overflowAnchor: "auto" }} />
      </div>
      {children}
    </aside>
  );
}
