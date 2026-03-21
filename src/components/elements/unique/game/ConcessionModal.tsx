"use client";

import { Modal, GameButton } from "@/components/elements/generic";

interface ConcessionModalProps {
  open: boolean;
  onAccept: (type: "flee" | "capture") => void;
  onReject: () => void;
}

export function ConcessionModal({
  open,
  onAccept,
  onReject,
}: ConcessionModalProps) {
  if (!open) return null;

  return (
    <Modal title="A Difficult Moment" onClose={() => {}}>
      <div className="space-y-4" data-testid="concession-modal">
        <p>You have been bested. The lantern paths await your return.</p>
        <div className="flex flex-col gap-2">
          <GameButton
            onClick={() => onAccept("flee")}
            data-testid="concession-accept-flee"
            className="w-full text-left justify-start"
          >
            Slip Away (Lose progress, keep going)
          </GameButton>
          <GameButton
            onClick={() => onAccept("capture")}
            data-testid="concession-accept-capture"
            className="w-full text-left justify-start"
          >
            Yield (Captured, lose belongings)
          </GameButton>
          <div className="border-t border-palette-border my-2" />
          <GameButton
            onClick={onReject}
            variant="danger"
            data-testid="concession-reject"
            className="w-full"
          >
            Fall and Respawn
          </GameButton>
        </div>
      </div>
    </Modal>
  );
}
