"use client";

export interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  /** Optional icon shown before the title (e.g. for panels). */
  titleIcon?: React.ReactNode;
  /** Max width of the inner box. Default "md". */
  maxWidth?: "md" | "lg" | "2xl" | "4xl";
  /** Optional data-testid for the overlay (e.g. for panel tests). */
  "data-testid"?: string;
}

const maxWidthClasses = {
  md: "max-w-md",
  lg: "max-w-lg",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
} as const;

export function Modal({
  title,
  children,
  onClose,
  titleIcon,
  maxWidth = "md",
  "data-testid": dataTestId,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,13,10,0.76)] backdrop-blur-md p-4"
      data-testid={dataTestId}
    >
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] min-h-0 rounded-[28px] border border-palette-border-light/45 bg-[linear-gradient(180deg,rgba(67,54,42,0.98),rgba(27,21,17,0.98))] shadow-[0_22px_60px_rgba(0,0,0,0.34)] overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-palette-border-light/25 bg-palette-bg-light/70 shrink-0">
          <h2 className="text-palette-accent-bright font-display font-bold uppercase tracking-[0.2em] text-lg flex items-center gap-2">
            {titleIcon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-palette-text-muted hover:text-palette-white p-1 -m-1 rounded-full border border-transparent hover:border-palette-border-light/40 hover:bg-palette-bg/30 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto min-h-0 text-palette-foreground">{children}</div>
      </div>
    </div>
  );
}
