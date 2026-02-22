import React from "react";

interface TypewriterTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
}

/**
 * TypewriterText — Renders text with a typewriter effect.
 * Perfect for generative AI dialogue.
 */
export function TypewriterText({
    text,
    className,
}: TypewriterTextProps) {
    return <span className={className}>{text}</span>;
}
