"use client";

import { Modal } from "@/components/elements/generic";

interface ConcessionModalProps {
  open: boolean;
  onAccept: (type: 'flee' | 'capture') => void;
  onReject: () => void;
}

export function ConcessionModal({ open, onAccept, onReject }: ConcessionModalProps) {
  if (!open) return null;

  return (
    <Modal title="Concession Required" onClose={() => { }}>
      <div className="space-y-4" data-testid="concession-modal">
        <p>You have been bested in combat. The shadows claim you.</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAccept('flee')}
            className="w-full p-2 border border-palette-border hover:bg-palette-bg-light text-left"
            data-testid="concession-accept-flee"
          >
            Flee (Lose progress, keep life)
          </button>
          <button
            onClick={() => onAccept('capture')}
            className="w-full p-2 border border-palette-border hover:bg-palette-bg-light text-left"
            data-testid="concession-accept-capture"
          >
            Surrender ( captured, lose items)
          </button>
          <div className="border-t border-palette-border my-2" />
          <button
            onClick={onReject}
            className="w-full p-2 bg-red-900/50 border border-red-800 hover:bg-red-800/50 text-white font-bold"
            data-testid="concession-reject"
          >
            Reject (Die and Respawn)
          </button>
        </div>
      </div>
    </Modal>
  );
}
