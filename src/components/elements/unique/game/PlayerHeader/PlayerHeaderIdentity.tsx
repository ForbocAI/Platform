import Image from "next/image";
import type { PlayerActor } from "@/features/game/types";
import { CLASS_PRESENTATION } from "@/features/game/mechanics/classes";
import { getClassFullPortraitUrl } from "@/features/game/sdk/portraits";

export function PlayerHeaderIdentity({ player }: { player: PlayerActor }) {
  const classKey = player.agentClass as keyof typeof CLASS_PRESENTATION | undefined;
  const presentation = classKey ? CLASS_PRESENTATION[classKey] : undefined;
  const folkLabel = presentation?.name ?? player.agentClass ?? 'Unknown';
  const portraitUrl = classKey ? getClassFullPortraitUrl(classKey) : undefined;

  return (
    <div className="portrait-frame relative h-20 sm:h-28 lg:h-36 aspect-[3/4] overflow-hidden shrink-0 bg-palette-bg-dark">
      {portraitUrl && (
        <>
          <Image
            src={portraitUrl}
            alt={folkLabel}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 108px, (min-width: 640px) 84px, 60px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" aria-hidden />
        </>
      )}
    </div>
  );
}
