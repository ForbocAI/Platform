/**
 * Lanternbough Rootsong playback: warm plucks, petal-bright accents, brook hush, and soft wooden percussion.
 * Volume and playing state are managed in audioSlice via setMusicStateGetter.
 */

import { getAudioContext } from "./core";
import {
  ACCENT_PATTERN,
  ARP_PATTERN,
  BASS_PATTERN,
  BROOK_PATTERN,
  DRONE_PATTERN,
  DRUMS_PATTERN,
  MELODY_PATTERN,
  NOTE_DURATION,
  BPM,
  SONG_SECTION_LENGTH,
} from "./patterns";

const STEP_MS = (60 / BPM / 4) * 1000;
const BAR_DURATION = NOTE_DURATION * 8;

let musicTimeoutId: number | null = null;
let step = 0;

type MusicState = {
  musicVolume: number;
  musicPlaying: boolean;
};

let getMusicState: (() => MusicState) | null = null;

export function setMusicStateGetter(getter: () => MusicState) {
  getMusicState = getter;
}

function createNoiseBuffer(
  ctx: AudioContext,
  duration: number,
  shape: (phase: number) => number = (phase) => 1 - phase
): AudioBuffer {
  const size = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < size; i++) {
    const phase = i / size;
    data[i] = (Math.random() * 2 - 1) * shape(phase);
  }

  return buffer;
}

function playPluck(freq: number, musicVolume: number, brightness = 1) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800 + brightness * 1200, t);
  filter.Q.value = 0.7;
  gain.connect(filter);
  filter.connect(ctx.destination);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.16, t + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 2.1);

  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(freq, t);
  body.frequency.exponentialRampToValueAtTime(freq * 0.993, t + 1.4);

  const overtone = ctx.createOscillator();
  overtone.type = "sine";
  overtone.frequency.setValueAtTime(freq * 2.01, t);

  const bodyGain = ctx.createGain();
  bodyGain.gain.value = 0.85;
  const overtoneGain = ctx.createGain();
  overtoneGain.gain.value = 0.28;

  body.connect(bodyGain);
  bodyGain.connect(gain);
  overtone.connect(overtoneGain);
  overtoneGain.connect(gain);

  const attack = ctx.createBufferSource();
  attack.buffer = createNoiseBuffer(ctx, 0.045, (phase) => (1 - phase) * 0.45);
  const attackFilter = ctx.createBiquadFilter();
  attackFilter.type = "highpass";
  attackFilter.frequency.value = 900;
  const attackGain = ctx.createGain();
  attackGain.gain.setValueAtTime(musicVolume * 0.015 * brightness, t);
  attackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  attack.connect(attackFilter);
  attackFilter.connect(attackGain);
  attackGain.connect(gain);

  body.start(t);
  overtone.start(t);
  attack.start(t);
  body.stop(t + 2.1);
  overtone.stop(t + 1.85);
  attack.stop(t + 0.045);
}

function playDrone(freq: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const duration = BAR_DURATION * 1.05;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(440, t);
  filter.Q.value = 0.3;
  gain.connect(filter);
  filter.connect(ctx.destination);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.08, t + 0.8);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.06, t + duration * 0.65);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  const root = ctx.createOscillator();
  root.type = "triangle";
  root.frequency.setValueAtTime(freq, t);

  const fifth = ctx.createOscillator();
  fifth.type = "sine";
  fifth.frequency.setValueAtTime(freq * 1.5, t);

  const shimmer = ctx.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(freq * 2, t);

  const rootGain = ctx.createGain();
  rootGain.gain.value = 0.75;
  const fifthGain = ctx.createGain();
  fifthGain.gain.value = 0.28;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.08;

  root.connect(rootGain);
  rootGain.connect(gain);
  fifth.connect(fifthGain);
  fifthGain.connect(gain);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(gain);

  root.start(t);
  fifth.start(t);
  shimmer.start(t);
  root.stop(t + duration);
  fifth.stop(t + duration);
  shimmer.stop(t + duration);
}

function playBass(freq: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const duration = BAR_DURATION * 0.9;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 180;
  gain.connect(filter);
  filter.connect(ctx.destination);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.16, t + 0.04);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.08, t + duration * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  const fundamental = ctx.createOscillator();
  fundamental.type = "sine";
  fundamental.frequency.setValueAtTime(freq, t);

  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(freq * 2, t);

  const bodyGain = ctx.createGain();
  bodyGain.gain.value = 0.14;

  fundamental.connect(gain);
  body.connect(bodyGain);
  bodyGain.connect(gain);

  fundamental.start(t);
  body.start(t);
  fundamental.stop(t + duration);
  body.stop(t + duration * 0.7);
}

function playAccent(freq: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2200;
  const delay = ctx.createDelay(0.4);
  delay.delayTime.value = 0.18;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.14;

  gain.connect(filter);
  filter.connect(ctx.destination);
  filter.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.04, t + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

  const lead = ctx.createOscillator();
  lead.type = "triangle";
  lead.frequency.setValueAtTime(freq, t);
  lead.frequency.linearRampToValueAtTime(freq * 0.992, t + 1.2);

  const harmony = ctx.createOscillator();
  harmony.type = "sine";
  harmony.frequency.setValueAtTime(freq * 1.5, t);

  const harmonyGain = ctx.createGain();
  harmonyGain.gain.value = 0.18;

  const vibrato = ctx.createOscillator();
  vibrato.type = "sine";
  vibrato.frequency.value = 5.2;
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.value = 4;
  vibrato.connect(vibratoGain);
  vibratoGain.connect(lead.frequency);

  lead.connect(gain);
  harmony.connect(harmonyGain);
  harmonyGain.connect(gain);

  lead.start(t);
  harmony.start(t);
  vibrato.start(t);
  lead.stop(t + 1.8);
  harmony.stop(t + 1.6);
  vibrato.stop(t + 1.8);
}

function playBrook(musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const duration = 1.6 + Math.random() * 0.8;
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, duration, (phase) => {
    const swell = phase < 0.35 ? phase / 0.35 : Math.max(0, 1 - (phase - 0.35) / 0.65);
    return swell * (0.7 + 0.3 * Math.sin(phase * Math.PI * 4));
  });

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 450;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2400;
  const gain = ctx.createGain();

  source.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.018, t + 0.2);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.01, t + duration * 0.65);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  source.start(t);
  source.stop(t + duration);
}

function playDrum(type: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (type === 1) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(58, t + 0.3);
    gain.gain.setValueAtTime(musicVolume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.35);
    return;
  }

  if (type === 2) {
    const knock = ctx.createBufferSource();
    knock.buffer = createNoiseBuffer(ctx, 0.06, (phase) => Math.max(0, 1 - phase * 1.5));
    const knockBandpass = ctx.createBiquadFilter();
    knockBandpass.type = "bandpass";
    knockBandpass.frequency.value = 960;
    knockBandpass.Q.value = 1.8;
    const knockLowpass = ctx.createBiquadFilter();
    knockLowpass.type = "lowpass";
    knockLowpass.frequency.value = 1700;
    const knockGain = ctx.createGain();
    knockGain.gain.setValueAtTime(musicVolume * 0.028, t);
    knockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    knock.connect(knockBandpass);
    knockBandpass.connect(knockLowpass);
    knockLowpass.connect(knockGain);
    knockGain.connect(gain);

    const body = ctx.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(320, t);
    body.frequency.exponentialRampToValueAtTime(215, t + 0.09);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(musicVolume * 0.04, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    body.connect(bodyGain);
    bodyGain.connect(gain);

    knock.start(t);
    knock.stop(t + 0.06);
    body.start(t);
    body.stop(t + 0.11);
    return;
  }

  if (type === 3) {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, 0.14, (phase) => Math.max(0, 1 - phase));
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 260;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1450;
    const scrapeGain = ctx.createGain();
    scrapeGain.gain.setValueAtTime(musicVolume * 0.02, t);
    scrapeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(scrapeGain);
    scrapeGain.connect(gain);

    const body = ctx.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(240, t);
    body.frequency.exponentialRampToValueAtTime(170, t + 0.12);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(musicVolume * 0.014, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    body.connect(bodyGain);
    bodyGain.connect(gain);

    source.start(t);
    source.stop(t + 0.14);
    body.start(t);
    body.stop(t + 0.12);
    return;
  }

  if (type === 4) {
    const bloom = ctx.createOscillator();
    bloom.type = "sine";
    bloom.frequency.setValueAtTime(293.66, t);
    const glow = ctx.createOscillator();
    glow.type = "sine";
    glow.frequency.setValueAtTime(440, t);
    const glowGain = ctx.createGain();
    glowGain.gain.value = 0.22;
    bloom.connect(gain);
    glow.connect(glowGain);
    glowGain.connect(gain);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(musicVolume * 0.03, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    bloom.start(t);
    glow.start(t);
    bloom.stop(t + 1.4);
    glow.stop(t + 1.2);
  }
}

function tick() {
  if (!getMusicState) return;
  const { musicVolume, musicPlaying } = getMusicState();
  if (!musicPlaying) return;

  const cycleStep = step % MELODY_PATTERN.length;
  const sectionIndex = Math.floor(cycleStep / SONG_SECTION_LENGTH);
  const isChorus = sectionIndex === 1 || sectionIndex === 3;
  const isBridge = sectionIndex === 2;

  const note = MELODY_PATTERN[cycleStep];
  if (note) {
    playPluck(note, musicVolume * (isChorus ? 1.05 : 0.95), isChorus ? 1.36 : isBridge ? 1.08 : 1.18);
  }

  const arp = ARP_PATTERN[cycleStep];
  if (arp) {
    playPluck(arp, musicVolume * (isChorus ? 0.72 : isBridge ? 0.52 : 0.58), isChorus ? 0.92 : 0.76);
  }

  const drone = DRONE_PATTERN[cycleStep];
  if (drone) playDrone(drone, musicVolume * (isChorus ? 1.02 : 0.96));

  const bass = BASS_PATTERN[cycleStep];
  if (bass) playBass(bass, musicVolume * (isBridge ? 0.9 : 1));

  const drum = DRUMS_PATTERN[cycleStep];
  if (drum) playDrum(drum, musicVolume * (isChorus ? 0.88 : 0.8));

  const accent = ACCENT_PATTERN[cycleStep];
  if (accent) playAccent(accent, musicVolume * (isChorus ? 0.95 : 0.75));

  if (BROOK_PATTERN[cycleStep] === 1 && Math.random() < (isChorus ? 0.2 : 0.68)) {
    playBrook(musicVolume);
  }

  step++;
  musicTimeoutId = window.setTimeout(tick, STEP_MS);
}

export function startMusic() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  step = 0;
  if (musicTimeoutId) clearTimeout(musicTimeoutId);
  tick();
}

export function stopMusic() {
  if (musicTimeoutId) {
    clearTimeout(musicTimeoutId);
    musicTimeoutId = null;
  }
}
