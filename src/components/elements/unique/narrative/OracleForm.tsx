"use client";

import { useRef } from "react";
import { Send } from "lucide-react";
import { useAppDispatch } from "@/features/core/store";
import { playButtonSound } from "@/features/audio";
import { GameButton } from "@/components/elements/generic";

export function OracleForm({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const dispatch = useAppDispatch();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(playButtonSound());
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
          onFocus={() => formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
          onKeyDown={handleKeyDown}
          placeholder="Ask Oracle… (Enter to send)"
          className="w-full bg-palette-bg-dark border border-palette-border text-palette-accent-soft px-1.5 sm:px-2 py-1 sm:py-1.5 leading-relaxed focus:outline-none focus:border-palette-accent-mid/50 placeholder:text-palette-muted min-w-0"
          data-testid="oracle-input"
          aria-label="Ask Oracle (press Enter to send)"
        />
        <GameButton
          type="submit"
          icon={<Send className="app-icon" />}
          data-testid="oracle-submit"
          className="shrink-0"
          aria-label="Send"
        />
      </form>
    </div>
  );
}
