"use client";

import { useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { usePlayButtonSound } from "@/features/audio";

export function OracleForm({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const playSound = usePlayButtonSound();

  const scrollFormIntoView = useCallback(() => {
    formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound();
    onSubmit(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div
      ref={formContainerRef}
      className="p-1.5 sm:p-2 border-t border-palette-border bg-palette-bg-mid/30 shrink-0"
    >
      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={scrollFormIntoView}
          onKeyDown={handleKeyDown}
          placeholder="Ask Oracle… (Enter to send)"
          className="w-full bg-palette-bg-dark border border-palette-border text-palette-accent-magic px-1.5 sm:px-2 py-1 sm:py-1.5 leading-relaxed focus:outline-none focus:border-palette-accent-cyan/50 placeholder:text-palette-muted min-w-0"
          data-testid="oracle-input"
          aria-label="Ask Oracle (press Enter to send)"
        />
        <button
          type="submit"
          data-testid="oracle-submit"
          className="bg-palette-accent-magic/20 border border-palette-accent-cyan/30 text-palette-accent-cyan hover:bg-palette-accent-magic/40 hover:text-palette-white px-1.5 sm:px-2 flex items-center justify-center transition-colors shrink-0 touch-manipulation"
          aria-label="Send"
        >
          <Send className="app-icon" />
        </button>
      </form>
    </div>
  );
}
