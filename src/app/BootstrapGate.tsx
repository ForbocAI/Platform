'use client';

import { useEffect } from "react";
import { flushTtsQueue } from "@/features/audio";

/**
 * Flush TTS queue on user click so speechSynthesis.speak() runs with a user gesture
 * (required by Chrome: https://stackoverflow.com/questions/54265423).
 */
export default function BootstrapGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onUserClick = () => flushTtsQueue();
    document.addEventListener("click", onUserClick, true);
    return () => document.removeEventListener("click", onUserClick, true);
  }, []);

  return <>{children}</>;
}
