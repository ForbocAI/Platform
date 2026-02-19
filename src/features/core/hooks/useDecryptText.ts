"use client";

import { useEffect, useRef } from "react";
import { decryptText } from "@/features/core/effects/sneakers";

export type UseDecryptTextOptions = {
  text: string;
  speed?: number;
  enabled?: boolean;
};

/**
 * Hook to run Sneakers decrypt effect when element mounts.
 * Apply ref to an element with class "encrypted-text".
 */
export function useDecryptText({
  text,
  speed = 30,
  enabled = true,
}: UseDecryptTextOptions) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled || !text || !ref.current) return;
    const cleanup = decryptText(ref.current, text, { speed });
    return cleanup;
  }, [text, speed, enabled]);

  return ref;
}
