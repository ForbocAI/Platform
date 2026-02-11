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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      data-testid={dataTestId}
    >
      <div
        className={`bg-palette-bg border border-palette-border shadow-2xl w-full ${maxWidthClasses[maxWidth]} relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] min-h-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-palette-border bg-palette-bg-light shrink-0">
          <h2 className="text-palette-accent font-heading font-bold uppercase tracking-widest text-lg flex items-center gap-2">
            {titleIcon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-palette-text-muted hover:text-palette-white p-1 -m-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
}
