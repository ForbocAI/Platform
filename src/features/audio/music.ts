/**
 * Ritual ambient music: deep drones, incantation-like chant, sparse percussion.
 * Volume and playing state are managed in audioSlice via setMusicStateGetter.
 */

import { getAudioContext } from "./core";

// A minor + horror intervals: Eb (tritone), Bb (b2), G# (tension)
const N = {
  A1: 55.0,
  A2: 110.0,
  Bb2: 116.54,
  Eb2: 77.78,
  E2: 82.41,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  Gs3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
};

const MELODY_PATTERN = [
  0, 0, 0, 0, N.A2, N.A2, N.A2, 0,
  0, 0, 0, 0, 0, 0, N.E3, N.E3,
  0, 0, N.A2, N.A2, 0, 0, 0, 0,
  0, 0, 0, N.C3, N.C3, 0, 0, 0,
  0, 0, 0, 0, 0, N.A2, N.A2, 0,
  0, N.E3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, N.A2, 0, 0, N.C3, 0,
  0, 0, 0, 0, 0, 0, 0, N.A2,
];

const DRONE_PATTERN = [
  N.A1, 0, 0, 0, 0, 0, 0, 0,
  N.A1, 0, 0, 0, 0, 0, 0, 0,
  N.E2, 0, 0, 0, 0, 0, 0, 0,
  N.A1, 0, 0, 0, 0, 0, 0, 0,
];

const BASS_PATTERN = [
  N.A1, 0, 0, 0, 0, 0, 0, 0,
  N.A1, 0, 0, 0, 0, 0, 0, 0,
  N.E2, 0, 0, 0, 0, 0, 0, 0,
  N.A1, 0, 0, 0, 0, 0, 0, 0,
];

const DRUMS_PATTERN = [
  1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 5, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 0,
  0, 0, 5, 0, 0, 0, 0, 4,
];

const ARP_PATTERN = [
  0, 0, 0, 0, N.A2, 0, 0, 0,
  0, 0, 0, 0, 0, 0, N.E3, 0,
  0, 0, N.A2, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, N.A2, 0, 0,
];

const GROWL_PATTERN = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const WAIL_PATTERN = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 0, 0, 0, 0,
];

const HOWL_PATTERN = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const GLITCH_PATTERN_LEN = 96;
const GLITCH_PATTERN = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
];

const CRUNCH_PATTERN = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

const BPM = 38;
const NOTE_DURATION = 60 / BPM / 2;

let musicTimeoutId: number | null = null;
let step = 0;

let getMusicState: (() => {
  musicVolume: number;
  musicPlaying: boolean;
}) | null = null;

export function setMusicStateGetter(
  getter: () => { musicVolume: number; musicPlaying: boolean }
) {
  getMusicState = getter;
}

function playLute(freq: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 280;
  gain.connect(filter);
  filter.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.24, t + 0.4);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.18, t + 2);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 3.6);
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 1.004;
  sub.type = "sine";
  sub.frequency.value = freq * 0.5;
  subGain.gain.setValueAtTime(0, t);
  subGain.gain.linearRampToValueAtTime(musicVolume * 0.2, t + 0.5);
  subGain.gain.exponentialRampToValueAtTime(0.001, t + 3.6);
  sub.connect(subGain);
  subGain.connect(gain);
  osc1.connect(gain);
  osc2.connect(gain);
  osc1.start(t);
  osc2.start(t);
  sub.start(t);
  osc1.stop(t + 3.6);
  osc2.stop(t + 3.6);
  sub.stop(t + 3.6);
}

function playDrone(freq: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 130;
  gain.connect(filter);
  filter.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.68, t + 2);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.45, t + NOTE_DURATION * 6);
  gain.gain.linearRampToValueAtTime(0, t + NOTE_DURATION * 14);
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sawtooth";
  osc2.type = "sawtooth";
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 1.003;
  osc1.connect(gain);
  osc2.connect(gain);
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + NOTE_DURATION * 14);
  osc2.stop(t + NOTE_DURATION * 14);
}

function playBass(freq: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 65;
  const osc = ctx.createOscillator();
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  sub.type = "sine";
  sub.frequency.value = freq * 0.5;
  subGain.gain.setValueAtTime(musicVolume * 0.5, t);
  sub.connect(subGain);
  subGain.connect(gain);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.75, t + 1);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.52, t + NOTE_DURATION * 6);
  gain.gain.exponentialRampToValueAtTime(0.001, t + NOTE_DURATION * 12);
  osc.start(t);
  sub.start(t);
  osc.stop(t + NOTE_DURATION * 12);
  sub.stop(t + NOTE_DURATION * 12);
}

function playGrowl(musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 85;
  gain.connect(filter);
  filter.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.38, t + 0.3);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.22, t + 0.7);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.32, t + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sawtooth";
  osc2.type = "sawtooth";
  osc1.frequency.setValueAtTime(38, t);
  osc1.frequency.linearRampToValueAtTime(32, t + 0.35);
  osc1.frequency.linearRampToValueAtTime(44, t + 0.7);
  osc1.frequency.linearRampToValueAtTime(34, t + 1.1);
  osc1.frequency.linearRampToValueAtTime(30, t + 2);
  osc2.frequency.setValueAtTime(35, t);
  osc2.frequency.linearRampToValueAtTime(30, t + 0.35);
  osc2.frequency.linearRampToValueAtTime(42, t + 0.7);
  osc2.frequency.linearRampToValueAtTime(32, t + 1.1);
  osc2.frequency.linearRampToValueAtTime(28, t + 2);
  osc1.connect(gain);
  osc2.connect(gain);
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + 2.6);
  osc2.stop(t + 2.6);
}

function playDrum(type: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  if (type === 1) {
    const osc = ctx.createOscillator();
    osc.connect(gain);
    osc.frequency.setValueAtTime(52, t);
    osc.frequency.exponentialRampToValueAtTime(22, t + 0.7);
    gain.gain.setValueAtTime(musicVolume * 1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.start(t);
    osc.stop(t + 1.2);
  } else if (type === 2) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 82.41;
    osc.connect(gain);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(musicVolume * 0.5, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 4);
    osc.start(t);
    osc.stop(t + 4);
  } else if (type === 3) {
    const bufferSize = ctx.sampleRate * 3.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const ramp = i < bufferSize * 0.45 ? i / (bufferSize * 0.45) : 1 - (i - bufferSize * 0.45) / (bufferSize * 0.55);
      data[i] = (Math.random() * 2 - 1) * ramp * 0.65;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 150;
    noise.connect(filter);
    filter.connect(gain);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(musicVolume * 0.48, t + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
    noise.start(t);
    noise.stop(t + 3.2);
  } else if (type === 5) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const ramp = i < bufferSize * 0.5 ? i / (bufferSize * 0.5) : 1 - (i - bufferSize * 0.5) / (bufferSize * 0.5);
      data[i] = (Math.random() * 2 - 1) * ramp * 0.6;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 110;
    noise.connect(filter);
    filter.connect(gain);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(musicVolume * 0.52, t + 1.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
    noise.start(t);
    noise.stop(t + 3);
  } else if (type === 4) {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 380;
    bandpass.Q.value = 1.2;
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(musicVolume * 0.04, t);
    osc.type = "sine";
    osc2.type = "sine";
    osc.frequency.value = 220;
    osc2.frequency.value = 164.81;
    osc.connect(bandpass);
    osc2.connect(bandpass);
    bandpass.connect(padGain);
    padGain.connect(gain);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + 1.5);
    gain.gain.linearRampToValueAtTime(0.7, t + 4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 6);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 6);
    osc2.stop(t + 6);
  }
}

function playWail(musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 520;
  bandpass.Q.value = 0.9;
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.055;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.35;
  gain.connect(bandpass);
  bandpass.connect(ctx.destination);
  bandpass.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.032, t + 0.8);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.018, t + 2);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.setValueAtTime(400, t);
  osc1.frequency.linearRampToValueAtTime(360, t + 1.4);
  osc1.frequency.linearRampToValueAtTime(420, t + 3.5);
  osc2.frequency.setValueAtTime(392, t);
  osc2.frequency.linearRampToValueAtTime(352, t + 1.4);
  osc2.frequency.linearRampToValueAtTime(412, t + 3.5);
  osc1.connect(gain);
  osc2.connect(gain);
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + 3.5);
  osc2.stop(t + 3.5);
}

function playHowl(musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 480;
  bandpass.Q.value = 0.85;
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.065;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.3;
  gain.connect(bandpass);
  bandpass.connect(ctx.destination);
  bandpass.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.028, t + 0.6);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.038, t + 1.3);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.setValueAtTime(280, t);
  osc1.frequency.linearRampToValueAtTime(440, t + 1.3);
  osc1.frequency.linearRampToValueAtTime(240, t + 3);
  osc2.frequency.setValueAtTime(275, t);
  osc2.frequency.linearRampToValueAtTime(435, t + 1.3);
  osc2.frequency.linearRampToValueAtTime(235, t + 3);
  osc1.connect(gain);
  osc2.connect(gain);
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + 3);
  osc2.stop(t + 3);
}

function playLowCrunch(musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const dur = 0.06 + Math.random() * 0.04;
  const size = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) {
    const ramp = Math.min(1, i / (size * 0.2)) * Math.max(0, 1 - (i - size * 0.4) / (size * 0.6));
    data[i] = (Math.random() * 2 - 1) * ramp * 0.7;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 75 + Math.random() * 45;
  const gain = ctx.createGain();
  src.connect(lp);
  lp.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.1, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.start(t);
  src.stop(t + dur);
}

function playGlitch(musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  const hissDur = 0.15 + Math.random() * 0.18;
  const hissSize = Math.ceil(ctx.sampleRate * hissDur);
  const hissBuf = ctx.createBuffer(1, hissSize, ctx.sampleRate);
  const hissData = hissBuf.getChannelData(0);
  const fadeIn = hissSize * 0.12;
  const fadeOutStart = hissSize * 0.55;
  for (let i = 0; i < hissSize; i++) {
    let ramp = 1;
    if (i < fadeIn) ramp = i / fadeIn;
    else if (i > fadeOutStart) ramp = Math.max(0, 1 - (i - fadeOutStart) / (hissSize - fadeOutStart));
    const wobble = 0.88 + 0.24 * Math.sin((i / hissSize) * Math.PI * 4);
    hissData[i] = (Math.random() * 2 - 1) * ramp * wobble;
  }
  const hissSrc = ctx.createBufferSource();
  hissSrc.buffer = hissBuf;
  const hissHigh = ctx.createBiquadFilter();
  hissHigh.type = "highpass";
  hissHigh.frequency.value = 1400 + Math.random() * 600;
  const hissLow = ctx.createBiquadFilter();
  hissLow.type = "lowpass";
  hissLow.frequency.value = 6500 + Math.random() * 1500;
  const hissGain = ctx.createGain();
  hissSrc.connect(hissHigh);
  hissHigh.connect(hissLow);
  hissLow.connect(hissGain);
  hissGain.connect(ctx.destination);
  const peak = musicVolume * (0.045 + Math.random() * 0.025);
  hissGain.gain.setValueAtTime(0, t);
  hissGain.gain.linearRampToValueAtTime(peak, t + 0.03);
  hissGain.gain.setValueAtTime(peak * 0.9, t + hissDur * 0.35);
  hissGain.gain.setValueAtTime(peak * 1.05, t + hissDur * 0.55);
  hissGain.gain.exponentialRampToValueAtTime(0.001, t + hissDur);
  hissSrc.start(t);
  hissSrc.stop(t + hissDur);

  if (Math.random() < 0.35) {
    const trackDur = 0.02 + Math.random() * 0.03;
    const trackSize = Math.ceil(ctx.sampleRate * trackDur);
    const trackBuf = ctx.createBuffer(1, trackSize, ctx.sampleRate);
    const trackData = trackBuf.getChannelData(0);
    for (let i = 0; i < trackSize; i++) {
      trackData[i] = (Math.random() * 2 - 1) * (1 - i / trackSize);
    }
    const trackSrc = ctx.createBufferSource();
    trackSrc.buffer = trackBuf;
    const trackBp = ctx.createBiquadFilter();
    trackBp.type = "bandpass";
    trackBp.frequency.value = 500 + Math.random() * 1000;
    trackBp.Q.value = 0.3 + Math.random() * 0.3;
    const trackGain = ctx.createGain();
    trackSrc.connect(trackBp);
    trackBp.connect(trackGain);
    trackGain.connect(ctx.destination);
    const to = 0.02 + Math.random() * 0.06;
    trackGain.gain.setValueAtTime(0, t + to);
    trackGain.gain.linearRampToValueAtTime(musicVolume * (0.04 + Math.random() * 0.03), t + to + 0.015);
    trackGain.gain.exponentialRampToValueAtTime(0.001, t + to + trackDur);
    trackSrc.start(t + to);
    trackSrc.stop(t + to + trackDur);
  }

  if (Math.random() < 0.4) {
    const crackleSize = Math.ceil(ctx.sampleRate * (0.012 + Math.random() * 0.014));
    const crackleBuf = ctx.createBuffer(1, crackleSize, ctx.sampleRate);
    const crackleData = crackleBuf.getChannelData(0);
    for (let i = 0; i < crackleSize; i++) {
      crackleData[i] = (Math.random() * 2 - 1) * (1 - i / crackleSize);
    }
    const ct = t + 0.01 + Math.random() * (hissDur * 0.5);
    const crackleSrc = ctx.createBufferSource();
    crackleSrc.buffer = crackleBuf;
    const crackleBp = ctx.createBiquadFilter();
    crackleBp.type = "bandpass";
    crackleBp.frequency.value = 800 + Math.random() * 1400;
    crackleBp.Q.value = 0.25 + Math.random() * 0.25;
    const cGain = ctx.createGain();
    crackleSrc.connect(crackleBp);
    crackleBp.connect(cGain);
    cGain.connect(ctx.destination);
    cGain.gain.setValueAtTime(0, ct);
    cGain.gain.linearRampToValueAtTime(musicVolume * (0.03 + Math.random() * 0.03), ct + 0.004);
    cGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.02);
    crackleSrc.start(ct);
    crackleSrc.stop(ct + 0.02);
  }
}

function tick() {
  if (!getMusicState) return;
  const { musicVolume, musicPlaying } = getMusicState();
  if (!musicPlaying) return;
  const note = MELODY_PATTERN[step % MELODY_PATTERN.length];
  if (note) playLute(note, musicVolume);
  if (step % 16 === 0) {
    const bar = Math.floor(step / 16) % 4;
    const drone = DRONE_PATTERN[bar * 8];
    if (drone) playDrone(drone, musicVolume);
    const bass = BASS_PATTERN[bar * 8];
    if (bass) playBass(bass, musicVolume);
  }
  const arp = ARP_PATTERN[step % ARP_PATTERN.length];
  if (arp) playLute(arp, musicVolume);
  const drum = DRUMS_PATTERN[step % DRUMS_PATTERN.length];
  if (drum) playDrum(drum, musicVolume);
  if (GROWL_PATTERN[step % GROWL_PATTERN.length] === 1) playGrowl(musicVolume);
  if (WAIL_PATTERN[step % WAIL_PATTERN.length] === 1) playWail(musicVolume);
  if (HOWL_PATTERN[step % HOWL_PATTERN.length] === 1) playHowl(musicVolume);
  if (GLITCH_PATTERN[step % GLITCH_PATTERN_LEN] === 1 && Math.random() < 0.55) playGlitch(musicVolume);
  if (CRUNCH_PATTERN[step % CRUNCH_PATTERN.length] === 1) playLowCrunch(musicVolume);
  step++;
  musicTimeoutId = window.setTimeout(tick, (60 / BPM / 4) * 1000);
}

export function startMusic() {
  const ctx = getAudioContext();
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
