"use client";

import { createPortal } from "react-dom";

export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    // Portal to document body? Or just overlay if top-level exists.
    // Next.js with app dir: simple fixed overlay works fine.
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-palette-bg border border-palette-border shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-palette-border bg-palette-bg-light">
                    <h2 className="text-palette-accent font-heading font-bold uppercase tracking-widest text-lg">{title}</h2>
                    <button onClick={onClose} className="text-palette-text-muted hover:text-palette-white" aria-label="Close modal">✕</button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
