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
    <div className="p-2 lg:p-4 border-t border-zinc-800 bg-zinc-900/30">
      <form onSubmit={onSubmit} className="flex gap-2 mb-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask Oracle..."
          className="w-full bg-zinc-950 border border-zinc-800 text-[10px] lg:text-xs text-purple-200 px-2 lg:px-3 py-2 lg:py-3 focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-700"
        />
        <button
          type="submit"
          className="bg-purple-900/20 border border-purple-500/30 text-purple-400 hover:bg-purple-900/40 hover:text-white px-3 flex items-center justify-center transition-colors"
        >
          <Send size={12} className="lg:w-[14px] lg:h-[14px]" />
        </button>
      </form>
    </div>
  );
}
