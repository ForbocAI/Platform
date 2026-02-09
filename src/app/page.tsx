"use client";

import { Suspense } from "react";
import { GameScreen } from "@/components/screens/GameScreen";

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GameScreen />
    </Suspense>
  );
}
