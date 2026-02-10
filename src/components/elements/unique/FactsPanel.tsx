"use client";

import type { Fact } from "@/lib/game/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectFactsPanelOpen, toggleFactsPanel } from "@/features/core/ui/slice/uiSlice";
import { usePlayButtonSound } from "@/features/audio";

export function FactsPanel({ facts, maxDisplay = 8 }: { facts: Fact[]; maxDisplay?: number }) {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectFactsPanelOpen);
  const playSound = usePlayButtonSound();
  const display = facts.slice(-maxDisplay).reverse();

  if (facts.length === 0) return null;

  return (
    <div className="border-b border-palette-border bg-palette-bg-mid/10 shrink-0" data-testid="facts-panel">
      <button
        type="button"
        onClick={() => {
          playSound();
          dispatch(toggleFactsPanel());
        }}
        className="w-full flex items-center gap-1 p-1.5 text-left text-palette-muted-light hover:text-palette-muted uppercase tracking-wider"
        data-testid="facts-toggle"
        aria-label={open ? "Close Facts" : "Open Facts"}
      >
        {open ? <ChevronDown className="app-icon" /> : <ChevronRight className="app-icon" />}
        <span>Facts ({facts.length})</span>
      </button>
      {open && (
        <ul className="max-h-32 overflow-y-auto p-1.5 space-y-1 text-sm">
          {display.map((f) => (
            <li
              key={f.id}
              className={`px-1.5 py-0.5 border-l-2 ${f.isFollowUp ? "border-palette-accent-cyan/50" : "border-palette-border"}`}
            >
              {f.questionKind && <span className="text-palette-muted mr-1">[{f.questionKind}]</span>}
              {f.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
