import { Send } from "lucide-react";

export function OracleForm({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="p-1.5 sm:p-2 lg:p-4 border-t border-zinc-800 bg-zinc-900/30 shrink-0">
      <form onSubmit={onSubmit} className="flex gap-1.5 sm:gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask Oracle..."
          className="w-full bg-zinc-950 border border-zinc-800 text-[9px] sm:text-[10px] lg:text-xs text-purple-200 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-700 min-w-0"
          data-testid="oracle-input"
        />
        <button
          type="submit"
          data-testid="oracle-submit"
          className="bg-purple-900/20 border border-purple-500/30 text-purple-400 hover:bg-purple-900/40 hover:text-white px-2 sm:px-3 flex items-center justify-center transition-colors shrink-0 touch-manipulation"
        >
          <Send size={10} className="sm:size-3 lg:size-3.5" />
        </button>
      </form>
    </div>
  );
}
