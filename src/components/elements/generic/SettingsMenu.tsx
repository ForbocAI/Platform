"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Settings, Sun, Moon, Speech, Music, Volume2, VolumeX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/features/core/store";
import { selectTextToSpeech, toggleTextToSpeech, selectTheme, themeToggled } from "@/features/core/ui/slice/uiSlice";
import settings from '../../../../data/presentation/settings.json';
import { choose } from '@/features/core/fp/choice';
import {
  playButtonSound,
  startMusic,
  stopMusic,
  selectMusicPlaying,
  setMasterVolume,
  selectMasterVolume,
} from "@/features/audio";

const subscribeToClient = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

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
        aria-pressed={active}
        className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-palette-accent-bright/50 ${
          active
            ? "border-palette-accent-bright/55 bg-palette-accent-bright/12 text-palette-accent-bright"
            : "border-palette-border/60 text-palette-muted hover:border-palette-border-light hover:text-palette-white"
        }`}
      >
        {icon}
      </button>
      <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap rounded-md bg-palette-bg-dark border border-palette-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-palette-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
        {label}
      </span>
    </div>
  );
}

export function SettingsMenu() {
  const clientReady = useSyncExternalStore(subscribeToClient, clientSnapshot, serverSnapshot);
  const dispatch = useAppDispatch();
  const textToSpeech = useAppSelector(selectTextToSpeech);
  const musicPlaying = useAppSelector(selectMusicPlaying);
  const masterVolume = useAppSelector(selectMasterVolume);
  const isMuted = masterVolume <= 0;
  const preMuteVolume = useRef(1);

  const theme = useAppSelector(selectTheme);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => choose(open, () => {
    const handlePointerDown = (e: PointerEvent) => {
      choose(Boolean(menuRef.current && !menuRef.current.contains(e.target as Node)),
        () => setOpen(false), () => undefined);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      choose(e.key === settings.dismissKey, () => {
        setOpen(false);
        triggerRef.current?.focus();
      }, () => undefined);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, () => undefined), [open]);

  const toggleTheme = () => {
    dispatch(themeToggled());
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
    choose(isMuted, () => dispatch(setMasterVolume(preMuteVolume.current)), () => {
      preMuteVolume.current = masterVolume;
      return dispatch(setMasterVolume(0));
    });
  };

  return clientReady ? (
    <div ref={menuRef} className="relative z-50"
      onBlur={(event) => choose(
        !event.currentTarget.contains(event.relatedTarget),
        () => setOpen(false),
        () => undefined,
      )}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={settings.labels.settings}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title={settings.labels.settings}
        className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-palette-accent-bright/50 ${
          open
            ? "border-palette-border-light bg-palette-bg-panel text-palette-accent"
            : "border-palette-border/70 bg-palette-bg-panel/70 text-palette-accent-bright hover:border-palette-border-light hover:text-palette-accent hover:bg-palette-bg-panel"
        }`}
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={settings.labels.settings}
          className="absolute right-0 top-full mt-2 p-1 flex flex-row items-center gap-1 rounded-full border border-palette-border-light/50 shadow-[0_8px_20px_rgba(0,0,0,0.28)] backdrop-blur-sm"
          style={{ background: "linear-gradient(180deg, var(--panel-fill-1), var(--panel-fill-2))" }}
        >
          <SettingsIcon
            icon={theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            label={settings.theme.labels[theme]}
            active={theme === "light"}
            onClick={toggleTheme}
            testId={settings.testIds.theme}
          />
          <SettingsIcon
            icon={<Speech className="w-3.5 h-3.5" />}
            label={settings.labels.narration}
            active={textToSpeech}
            onClick={toggleSpeech}
            testId={settings.testIds.narration}
          />
          <SettingsIcon
            icon={<Music className="w-3.5 h-3.5" />}
            label={settings.labels.music}
            active={musicPlaying}
            onClick={toggleMusic}
            testId={settings.testIds.music}
          />
          <SettingsIcon
            icon={isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            label={isMuted ? settings.labels.unmute : settings.labels.mute}
            active={!isMuted}
            onClick={toggleMute}
            testId={settings.testIds.volume}
          />
        </div>
      )}
    </div>
  ) : null;
}
