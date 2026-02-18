"use client";

import React, { useState, useEffect } from "react";

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
    speed = 30,
    onComplete,
    className,
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    // If text changes externally, reset the typewriter
    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
    }, [text]);

    return <span className={className}>{displayedText}</span>;
}
