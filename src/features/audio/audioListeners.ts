import { isAnyOf } from "@reduxjs/toolkit";
import type { TypedStartListening } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/features/core/store";
import { startMusic as startMusicAction, stopMusic as stopMusicAction, playButtonSound as playButtonSoundAction } from "./slice/audioSlice";
import { selectMusicVolume, selectMusicPlaying, selectMasterVolume } from "./slice/audioSlice";
import { playButtonClick } from "./audioSystem";
import { selectTextToSpeech } from "@/features/core/ui/slice/uiSlice";

import {
  setMusicStateGetter,
  startMusic as startMusicLoop,
  stopMusic as stopMusicLoop,
} from "./audioSystem";

/**
 * Registers audio listeners: wires Redux audio state to the music loop
 * and starts/stops the loop when actions are dispatched.
 */
export function registerAudioListeners(
  startListening: TypedStartListening<RootState, AppDispatch>
) {
  startListening({
    predicate: (action) => action.type === "app/bootstrap",
    effect: (_action, listenerApi) => {
      const state = listenerApi.getState();
      setMusicStateGetter(() => {
        const s = listenerApi.getState();
        return {
          musicVolume: selectMusicVolume(s),
          musicPlaying: selectMusicPlaying(s),
        };
      });
      if (selectMusicPlaying(state)) {
        startMusicLoop();
      }
    },
  });

  startListening({
    matcher: isAnyOf(startMusicAction, stopMusicAction),
    effect: (action, listenerApi) => {
      const state = listenerApi.getState();
      const playing = selectMusicPlaying(state);
      if (playing) {
        startMusicLoop();
      } else {
        stopMusicLoop();
      }
    },
  });

  startListening({
    predicate: (action) => action.type === playButtonSoundAction.type,
    effect: (_action, listenerApi) => {
      const state = listenerApi.getState();
      const masterVolume = selectMasterVolume(state);
      playButtonClick(masterVolume);
    },
  });

  // Speech Synthesis: queue messages when logs are added. speak() only runs when flushTtsQueue()
  // is called from a user gesture (Chrome requires this: https://stackoverflow.com/questions/54265423).
  startListening({
    predicate: (action) => action.type === "game/addLog",
    effect: async (action, listenerApi) => {
      const message =
        typeof action.payload === "object" && action.payload !== null && "message" in action.payload
          ? (action.payload as { message: string }).message
          : "";
      if (!message?.trim()) return;

      const state = listenerApi.getState();
      const enabled = selectTextToSpeech(state);

      if (!enabled || !isSpeechSupported()) return;

      ttsQueue.push(message);
      // Flush is triggered by user click (see useTtsFlushOnClick in BootstrapGate).
    },
  });
}

// TTS queue: speak() only runs after a user gesture (Chrome policy). We queue and flush on click.
const ttsQueue: string[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isTtsSpeaking = false;

const cancelSpeech = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  isTtsSpeaking = false;
};

/**
 * Speak the next message in the TTS queue. Must be called from a user gesture (e.g. click)
 * so that Chrome allows speechSynthesis.speak(). Chain from utterance.onend to speak more.
 */
export function flushTtsQueue(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (isTtsSpeaking || ttsQueue.length === 0) return;

  const message = ttsQueue.shift()!;
  isTtsSpeaking = true;

  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1;
  utterance.pitch = 1;

  const voice = getWhisperVoice();
  if (voice) utterance.voice = voice;

  currentUtterance = utterance;

  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null;
    isTtsSpeaking = false;
    if (ttsQueue.length > 0) flushTtsQueue();
  };

  utterance.onerror = (e) => {
    console.warn("[AudioListener] TTS error:", e.error, message.slice(0, 40) + "…");
    isTtsSpeaking = false;
    if (ttsQueue.length > 0) flushTtsQueue();
  };

  window.speechSynthesis.speak(utterance);
}

const isSpeechSupported = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

function getWhisperVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const whisper = voices.find((v) => /whisper/i.test(v.name));
  return whisper ?? null;
}

// Ensure voices are loaded (Chrome populates getVoices() after onvoiceschanged).
if (typeof window !== "undefined" && window.speechSynthesis?.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
