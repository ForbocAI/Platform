import type { StageOfScene } from "@/lib/quadar/types";
import { cn } from "@/lib/utils";

const STAGES: { value: StageOfScene; label: string }[] = [
  { value: "To Knowledge", label: "Knowledge" },
  { value: "To Conflict", label: "Conflict" },
  { value: "To Endings", label: "Endings" },
];

export function StageSelector({
  stage,
  onStageChange,
}: {
  stage: StageOfScene;
  onStageChange: (s: StageOfScene) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-2 border-b border-zinc-800 bg-zinc-900/10 shrink-0">
      <span className="text-[6px] sm:text-[7px] text-zinc-600 uppercase tracking-wider mr-0.5 shrink-0">Stage:</span>
      {STAGES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onStageChange(value)}
          className={cn(
            "px-1 sm:px-2 py-0.5 text-[7px] sm:text-[8px] font-bold uppercase tracking-wider transition-colors touch-manipulation",
            stage === value
              ? "bg-purple-900/50 text-purple-300 border border-purple-700/50"
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
