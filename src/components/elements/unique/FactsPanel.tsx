"use client";

import type { Fact } from "@/lib/quadar/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export function FactsPanel({ facts, maxDisplay = 8 }: { facts: Fact[]; maxDisplay?: number }) {
  const [open, setOpen] = useState(false);
  const display = facts.slice(-maxDisplay).reverse();

  if (facts.length === 0) return null;

  return (
    <div className="border-b border-palette-border bg-palette-bg-mid/10 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1 p-1.5 text-left text-palette-muted-light hover:text-palette-muted uppercase tracking-wider"
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
