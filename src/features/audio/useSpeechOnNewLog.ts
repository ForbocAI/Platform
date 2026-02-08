"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/features/core/store";
import { selectLogs } from "@/features/game/slice/gameSlice";
import { selectTextToSpeech } from "@/features/core/ui/slice/uiSlice";

const isSpeechSupported = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

/** Prefer a voice whose name contains "whisper" (e.g. en-US Whisper). */
function getWhisperVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const whisper = voices.find((v) => /whisper/i.test(v.name));
  return whisper ?? null;
}

/**
 * When text-to-speech is enabled, speaks the message of each new log entry
 * using the Web Speech API (SpeechSynthesis).
 */
export function useSpeechOnNewLog() {
  const logs = useAppSelector(selectLogs);
  const enabled = useAppSelector(selectTextToSpeech);
  const lastSpokenIdRef = useRef<string | null>(null);

  // When TTS is turned off, cancel any ongoing speech
  useEffect(() => {
    if (!enabled && isSpeechSupported()) {
      window.speechSynthesis.cancel();
    }
  }, [enabled]);

  // When TTS is turned on, mark current last log as already seen so we don't speak backlog
  const prevEnabledRef = useRef(enabled);
  useEffect(() => {
    if (enabled && !prevEnabledRef.current && logs.length > 0) {
      const last = logs[logs.length - 1];
      if (last) lastSpokenIdRef.current = last.id;
    }
    prevEnabledRef.current = enabled;
  }, [enabled, logs]);

  // Speak only when a new log is added and TTS is enabled
  useEffect(() => {
    if (!isSpeechSupported() || !enabled || logs.length === 0) return;

    const lastLog = logs[logs.length - 1];
    if (!lastLog?.message || lastLog.id === lastSpokenIdRef.current) return;

    lastSpokenIdRef.current = lastLog.id;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(lastLog.message);
    utterance.rate = 1;
    utterance.pitch = 1;
    const whisperVoice = getWhisperVoice();
    if (whisperVoice) utterance.voice = whisperVoice;
    synth.speak(utterance);
  }, [logs, enabled]);
}
