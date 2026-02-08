import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameLogEntry } from "@/lib/quadar/types";
import { RuneSigil } from "./Runes";

export function NeuralLogPanel({ logs, children }: { logs: GameLogEntry[]; children?: React.ReactNode }) {
  return (
    <aside className="vengeance-border bg-palette-bg-dark flex flex-col h-full min-h-0 w-full min-w-0" data-testid="neural-log-panel" aria-label="Neural Log">
      <div className="flex items-center gap-1.5 p-1.5 sm:p-2 border-b border-palette-border bg-palette-bg-mid/20 shrink-0">
        <Terminal className="app-icon text-palette-accent-cyan shrink-0 animate-ambient-breathe" />
        <span className="font-bold tracking-widest text-palette-muted uppercase leading-tight" data-macro-scramble>Neural Log</span>
        <RuneSigil className="ml-auto" />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 sm:p-2 flex flex-col-reverse gap-1.5 sm:gap-2 scrollbar-thin scrollbar-thumb-palette-border scrollbar-track-transparent min-h-0 min-w-0">
        {logs.map((log) => (
          <div key={log.id} className="min-w-0 break-words shrink-0">
            <p
              className={cn(
                "leading-relaxed pl-1.5 border-l-2 break-words",
                log.type === "combat" && "text-palette-accent-red border-palette-border-red",
                log.type === "system" && "text-palette-accent-cyan border-palette-border",
                log.type === "loom" && "text-palette-accent-magic border-palette-border bg-palette-accent-magic/10 p-1 italic",
                log.type === "exploration" && "text-palette-muted-light border-palette-border"
              )}
            >
              <span className="opacity-50 mr-2 shrink-0">
                [{new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}]
              </span>
              <span className="break-words">{log.message}</span>
            </p>
          </div>
        ))}
      </div>
      {children}
    </aside>
  );
}
