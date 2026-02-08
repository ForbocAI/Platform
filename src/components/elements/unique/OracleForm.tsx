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
    <div className="p-1.5 sm:p-2 border-t border-palette-border bg-palette-bg-mid/30 shrink-0">
      <form onSubmit={onSubmit} className="flex gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask Oracle..."
          className="w-full bg-palette-bg-dark border border-palette-border text-palette-accent-magic px-1.5 sm:px-2 py-1 sm:py-1.5 leading-relaxed focus:outline-none focus:border-palette-accent-cyan/50 placeholder:text-palette-muted min-w-0"
          data-testid="oracle-input"
        />
        <button
          type="submit"
          data-testid="oracle-submit"
          className="bg-palette-accent-magic/20 border border-palette-accent-cyan/30 text-palette-accent-cyan hover:bg-palette-accent-magic/40 hover:text-palette-white px-1.5 sm:px-2 flex items-center justify-center transition-colors shrink-0 touch-manipulation"
        >
          <Send className="app-icon" />
        </button>
      </form>
    </div>
  );
}
