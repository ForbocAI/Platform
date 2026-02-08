import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameLogEntry } from "@/lib/quadar/types";

export function NeuralLogPanel({ logs, children }: { logs: GameLogEntry[]; children?: React.ReactNode }) {
  return (
    <aside className="vengeance-border bg-zinc-950 flex flex-col h-25 lg:h-full lg:border-l-0">
      <div className="flex items-center gap-2 p-2 lg:p-3 border-b border-zinc-800 bg-zinc-900/20">
        <Terminal size={12} className="text-cyan-500 lg:size-3.5" />
        <span className="text-[8px] lg:text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Neural Log</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {logs.map((log) => (
          <div key={log.id} className="text-[10px] lg:text-xs">
            <p
              className={cn(
                "leading-relaxed pl-2 border-l-2",
                log.type === "combat" && "text-red-400 border-red-900",
                log.type === "system" && "text-cyan-400 border-cyan-900",
                log.type === "loom" && "text-purple-300 border-purple-900 bg-purple-950/10 p-1 italic",
                log.type === "exploration" && "text-zinc-400 border-zinc-800"
              )}
            >
              <span className="opacity-50 mr-2">
                [{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}]
              </span>
              {log.message}
            </p>
          </div>
        ))}
        <div
          key={logs[logs.length - 1]?.id ?? "tail"}
          ref={(el) => el?.scrollIntoView({ behavior: "auto" })}
          aria-hidden
        />
      </div>
      {children}
    </aside>
  );
}
