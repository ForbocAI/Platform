import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameLogEntry } from "@/lib/quadar/types";

export function NeuralLogPanel({ logs, children }: { logs: GameLogEntry[]; children?: React.ReactNode }) {
  return (
    <aside className="vengeance-border bg-zinc-950 flex flex-col h-full min-h-0 w-full min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 lg:p-3 border-b border-zinc-800 bg-zinc-900/20 shrink-0">
        <Terminal size={10} className="text-cyan-500 sm:size-3 lg:size-3.5 shrink-0" />
        <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Neural Log</span>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 sm:p-2 lg:p-4 flex flex-col-reverse gap-1 sm:gap-2 lg:gap-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent min-h-0 min-w-0">
        {logs.map((log) => (
          <div key={log.id} className="text-[9px] sm:text-[10px] lg:text-xs min-w-0 break-words shrink-0">
            <p
              className={cn(
                "leading-relaxed pl-2 border-l-2 break-words",
                log.type === "combat" && "text-red-400 border-red-900",
                log.type === "system" && "text-cyan-400 border-cyan-900",
                log.type === "loom" && "text-purple-300 border-purple-900 bg-purple-950/10 p-1 italic",
                log.type === "exploration" && "text-zinc-400 border-zinc-800"
              )}
            >
              <span className="opacity-50 mr-2 shrink-0">
                [{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}]
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
