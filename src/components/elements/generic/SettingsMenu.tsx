"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, Sun, Moon, Speech, Music, Volume2, VolumeX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectTextToSpeech, toggleTextToSpeech } from "@/features/core/ui/slice/uiSlice";
import {
  playButtonSound,
  startMusic,
  stopMusic,
  selectMusicPlaying,
  setMasterVolume,
  selectMasterVolume,
} from "@/features/audio";

type Theme = "dark" | "light";

const STORAGE_KEY = "forboc-theme";

function applyTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function SettingsIcon({
  icon,
  label,
  active,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        data-testid={testId}
        aria-label={label}
        className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-palette-accent-bright/50 ${
          active
            ? "border-palette-accent-bright/55 bg-palette-accent-bright/12 text-palette-accent-bright"
            : "border-palette-border/60 text-palette-muted hover:border-palette-border-light hover:text-palette-white"
        }`}
      >
        {icon}
      </button>
      <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap rounded-md bg-palette-bg-dark border border-palette-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-palette-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
        {label}
      </span>
    </div>
  );
}

export function SettingsMenu() {
  const dispatch = useAppDispatch();
  const textToSpeech = useAppSelector(selectTextToSpeech);
  const musicPlaying = useAppSelector(selectMusicPlaying);
  const masterVolume = useAppSelector(selectMasterVolume);
  const isMuted = masterVolume <= 0;
  const preMuteVolume = useRef(1);

  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleSpeech = () => {
    dispatch(playButtonSound());
    dispatch(toggleTextToSpeech());
  };

  const toggleMusic = () => {
    dispatch(playButtonSound());
    dispatch(musicPlaying ? stopMusic() : startMusic());
  };

  const toggleMute = () => {
    dispatch(playButtonSound());
    if (isMuted) {
      dispatch(setMasterVolume(preMuteVolume.current));
    } else {
      preMuteVolume.current = masterVolume;
      dispatch(setMasterVolume(0));
    }
  };

  if (!mounted) return null;

  return (
    <div ref={menuRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        aria-expanded={open}
        title="Settings"
        className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-palette-accent-bright/50 ${
          open
            ? "border-palette-border-light bg-palette-bg-panel text-palette-accent"
            : "border-palette-border/70 bg-palette-bg-panel/70 text-palette-accent-bright hover:border-palette-border-light hover:text-palette-accent hover:bg-palette-bg-panel"
        }`}
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          className="absolute right-full top-1/2 -translate-y-1/2 mr-1 p-0.5 sm:p-1 flex flex-row items-center gap-0.5 sm:gap-1 rounded-full border border-palette-border-light/50 shadow-[0_8px_20px_rgba(0,0,0,0.28)] backdrop-blur-sm"
          style={{ background: "linear-gradient(180deg, var(--panel-fill-1), var(--panel-fill-2))" }}
        >
          <SettingsIcon
            icon={theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            label={theme === "dark" ? "Light theme" : "Dark theme"}
            active={theme === "light"}
            onClick={toggleTheme}
            testId="settings-theme-toggle"
          />
          <SettingsIcon
            icon={<Speech className="w-3.5 h-3.5" />}
            label="Narration"
            active={textToSpeech}
            onClick={toggleSpeech}
            testId="settings-tts-toggle"
          />
          <SettingsIcon
            icon={<Music className="w-3.5 h-3.5" />}
            label="Music"
            active={musicPlaying}
            onClick={toggleMusic}
            testId="settings-music-toggle"
          />
          <SettingsIcon
            icon={isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            label={isMuted ? "Unmute" : "Mute"}
            active={!isMuted}
            onClick={toggleMute}
            testId="settings-volume-toggle"
          />
        </div>
      )}
    </div>
  );
}
