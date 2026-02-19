"use client";

import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/features/core/utils";
import type { GameLogEntry } from "@/features/game/types";
import { RuneSigil } from "../shared/Runes";

import { TypewriterText } from "../../shared/TypewriterText";

export function NeuralLogPanel({ logs, children }: { logs: GameLogEntry[]; children?: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [logs]);

  return (
    <aside className="vengeance-border bg-palette-bg-dark flex flex-col h-full min-h-0 w-full min-w-0">
      <div className="flex items-center gap-1.5 p-1.5 sm:p-2 border-b border-palette-border bg-palette-bg-mid/20 shrink-0">
        <Terminal className="app-icon text-palette-accent-mid shrink-0 animate-ambient-breathe" />
        <span className="font-bold tracking-widest text-palette-muted uppercase leading-tight" data-macro-scramble>Neural Log</span>
        <RuneSigil className="ml-auto" />
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 sm:p-2 flex flex-col gap-1.5 sm:gap-2 scrollbar-thin scrollbar-thumb-palette-border scrollbar-track-transparent min-h-0 min-w-0"
      >
        {logs.map((log, index) => (
          <div key={log.id} className="min-w-0 wrap-break-word shrink-0 flex gap-2">
            {log.type === "dialogue" && log.portraitUrl && (
              <div className="shrink-0 mt-1">
                <img
                  src={log.portraitUrl}
                  alt="Agent Portrait"
                  className="w-10 h-10 rounded-sm border border-palette-border object-cover opacity-80"
                />
              </div>
            )}
            <p
              className={cn(
                "leading-relaxed pl-1.5 border-l-2 wrap-break-word flex-1",
                log.type === "combat" && "text-palette-accent-mid border-palette-border-dim",
                log.type === "system" && "text-palette-accent-mid border-palette-border",
                log.type === "oracle" && "text-palette-accent-soft border-palette-border bg-palette-accent-soft/10 p-1 italic",
                log.type === "exploration" && "text-palette-muted-light border-palette-border",
                log.type === "dialogue" && "text-palette-accent-bright border-palette-accent-mid bg-palette-accent-mid/5 p-1.5 rounded-sm font-medium"
              )}
            >
              <span className="opacity-50 mr-2 shrink-0">
                [{(() => {
                  const d = new Date(log.timestamp);
                  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                })()}]
              </span>
              <span className="wrap-break-word">
                {log.type === "dialogue" && index === logs.length - 1 ? (
                  <TypewriterText text={log.message} speed={25} />
                ) : (
                  log.message
                )}
              </span>
            </p>
          </div>
        ))}
        <div data-log-anchor className="shrink-0 min-h-1" style={{ overflowAnchor: "auto" }} />
      </div>
      {children}
    </aside>
  );
}
