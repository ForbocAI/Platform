"use client";

import type { ConcessionOutcome } from "@/lib/quadar/types";

const OUTCOMES: { value: ConcessionOutcome; label: string; narrative: string }[] = [
  { value: "flee", label: "Flee", narrative: "You break away and flee the fray." },
  { value: "knocked_away", label: "Knocked away", narrative: "You are knocked from the fight but survive." },
  { value: "captured", label: "Captured", narrative: "You are taken captive instead of slain." },
  { value: "other", label: "Other", narrative: "You concede on your own terms." },
];

export function ConcessionModal({
  onAccept,
  onReject,
}: {
  onAccept: (outcome: ConcessionOutcome, narrative: string) => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-palette-bg-dark/90">
      <div className="vengeance-border bg-palette-bg-mid border-2 border-palette-accent-red/50 p-4 sm:p-6 max-w-md w-full">
        <h3 className="font-black text-palette-accent-red uppercase tracking-widest mb-2">
          Concession offered
        </h3>
        <p className="text-palette-muted-light mb-4">
          You would be taken out. Accept a concession (dramatic escape) or reject and take the blow.
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {OUTCOMES.map(({ value, label, narrative }) => (
            <button
              key={value}
              type="button"
              onClick={() => onAccept(value, narrative)}
              className="w-full px-3 py-2 bg-palette-bg-dark border border-palette-border text-palette-muted-light hover:border-palette-accent-cyan hover:text-palette-accent-cyan transition-colors text-left"
            >
              <span className="font-bold">{label}</span>
              <span className="block text-sm opacity-80">{narrative}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onReject}
          className="w-full px-3 py-2 bg-palette-accent-red/20 border border-palette-accent-red text-palette-accent-red hover:bg-palette-accent-red/30 transition-colors font-bold uppercase tracking-wider"
        >
          Reject — take the blow
        </button>
      </div>
    </div>
  );
}
