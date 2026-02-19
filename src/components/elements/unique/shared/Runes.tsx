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
  return (
    <span
      className={`font-runic text-(--color-rune-ink) opacity-60 select-none ${className}`}
      aria-hidden
      suppressHydrationWarning
    >
      {hydrated ? "ᚠ ᛫ ᛟ ᛫ ᚱ ᛫ ᛒ ᛫ ᛟ ᛫ ᚲ" : PLACEHOLDER}
    </span>
  );
}

export function TopRunes() {
  const hydrated = useHydrated();
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none" suppressHydrationWarning>
      <p className="font-bold tracking-[0.15em] text-(--color-rune-ink)" suppressHydrationWarning>
        {hydrated ? "ᚠ·ᚠᚠᛁ·ᚲᚾᛁᛏᛁ·ᛗᚷᛈᛁᛊᛏᛁ" : PLACEHOLDER}
      </p>
      <p className="font-bold tracking-[0.12em] text-(--color-rune-ink)" suppressHydrationWarning>
        {hydrated ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : PLACEHOLDER}
      </p>
    </div>
  );
}

export function BottomRunes() {
  const hydrated = useHydrated();
  return (
    <div className="font-runic text-center py-0.5 space-y-px opacity-50 select-none" suppressHydrationWarning>
      <p className="font-bold tracking-[0.12em] text-(--color-rune-ink)" suppressHydrationWarning>
        {hydrated ? "ᛊᛁᛁᛗᛏ·ᛁᛈᛁᛏᛁ·ᛈᛁᚨᛗᛟ" : PLACEHOLDER}
      </p>
      <p className="font-bold tracking-[0.15em] text-(--color-rune-ink)" suppressHydrationWarning>
        {hydrated ? "ᛊᚢᛁᚲ·ᚲᛁᛃᛏᛃ·ᛏᛏᛊᛁᚢ·ᛊᛗᛟᚹ" : PLACEHOLDER}
      </p>
    </div>
  );
}
