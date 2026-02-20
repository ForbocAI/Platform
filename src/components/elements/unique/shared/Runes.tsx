"use client";

import { useState, useEffect } from "react";

const PLACEHOLDER = "\u00A0";

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

export function RuneSigil({ className = "" }: { className?: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return <span className={className}>{PLACEHOLDER}</span>;
  return (
    <span
      className={`font-runic text-(--color-rune-ink) opacity-60 select-none ${className}`}
      aria-hidden
    >
      ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ
    </span>
  );
}

export function TopRunes() {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="py-0.5">{PLACEHOLDER}</div>;
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.15em] text-(--color-rune-ink)">
        ᚠ·ᚠᚠᛁ·ᚲᚾᛁᛏᛁ·ᛗᚷᛈᛁᛊᛏᛁ
      </p>
      <p className="font-bold tracking-[0.12em] text-(--color-rune-ink)">
        ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ
      </p>
    </div>
  );
}

export function BottomRunes() {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="py-0.5">{PLACEHOLDER}</div>;
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none">
      <p className="font-bold tracking-[0.12em] text-(--color-rune-ink)">
        ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ
      </p>
      <p className="font-bold tracking-[0.15em] text-(--color-rune-ink)">
        ᛊᚢᛁᚲ·ᚲᛁᛃᛏᛃ·ᛏᛏᛊᛁᚢ·ᛊᛗᛟᚹ
      </p>
    </div>
  );
}
