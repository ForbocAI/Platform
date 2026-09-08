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
    <div className="relative h-24 sm:h-32 aspect-[3/4] shrink-0 lg:h-auto lg:aspect-auto lg:w-full lg:max-w-[13rem] lg:mx-auto lg:flex-1 lg:min-h-[7rem] lg:shrink">
      <div aria-hidden className="portrait-halo absolute -inset-[16%] pointer-events-none" />
      <div className="portrait-arch relative h-full w-full overflow-hidden bg-palette-bg-dark">
        {portraitUrl && (
          <>
            <Image
              src={portraitUrl}
              alt={folkLabel}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 216px, (min-width: 640px) 120px, 96px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" aria-hidden />
          </>
        )}
      </div>
    </div>
  );
}
