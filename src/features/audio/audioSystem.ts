/**
 * Simple 8-bit style sound effects and music using Web Audio API.
 * Volume and music playing state are managed in audioSlice.
 */

let audioCtx: AudioContext | null = null;
let musicTimeoutId: number | null = null;
let step = 0;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// ==========================================
// SOUND EFFECTS
// ==========================================

function beep(
  frequency: number,
  duration: number,
  masterVolume: number,
  type: OscillatorType = "square"
) {
  if (masterVolume <= 0) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(masterVolume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playShoot(masterVolume: number) {
  beep(880, 0.08, masterVolume, "square");
}

export function playHit(masterVolume: number) {
  if (masterVolume <= 0) return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(masterVolume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

// ==========================================
// DUNGEON SYNTH / DARK FOLK ENGINE
// ==========================================

const N = {
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

const MELODY_PATTERN = [
  N.E4, 0, 0, 0, N.A4, 0, N.G4, 0,
  N.F4, 0, N.E4, 0, N.D4, 0, 0, 0,
  N.E4, 0, 0, 0, N.C4, 0, N.D4, 0,
  N.E4, 0, 0, 0, 0, 0, 0, 0,
  N.A3, 0, 0, 0, N.C4, 0, N.D4, 0,
  N.E4, 0, N.G4, 0, N.F4, 0, N.E4, 0,
  N.D4, 0, 0, 0, N.C4, 0, N.B3, 0,
  N.A3, 0, 0, 0, 0, 0, 0, 0,
];

const DRONE_PATTERN = [
  N.A2, 0, 0, 0, N.A2, 0, 0, 0,
  N.A2, 0, 0, 0, N.F3, 0, 0, 0,
  N.C3, 0, 0, 0, N.G3, 0, 0, 0,
  N.A2, 0, 0, 0, N.E3, 0, 0, 0,
];

const DRUMS_PATTERN = [
  1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 1, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 2, 0,
  0, 0, 1, 0, 0, 0, 0, 0,
];

const ARP_PATTERN = [
  0, 0, N.A3, 0, 0, 0, N.C4, 0,
  0, 0, N.E3, 0, 0, 0, N.A3, 0,
  0, 0, N.C3, 0, 0, 0, N.E3, 0,
  0, 0, N.A2, 0, 0, 0, 0, 0,
];

const BPM = 70;
const NOTE_DURATION = 60 / BPM / 2;

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
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  osc.start(t);
  osc.stop(t + 1.5);
}

function playDrone(freq: number, musicVolume: number) {
  if (musicVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(musicVolume * 0.4, t + 0.5);
  gain.gain.linearRampToValueAtTime(0, t + NOTE_DURATION * 4);
  osc.start(t);
  osc.stop(t + NOTE_DURATION * 4);
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
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    gain.gain.setValueAtTime(musicVolume * 1.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.5);
  } else if (type === 2) {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    noise.connect(filter);
    filter.connect(gain);
    gain.gain.setValueAtTime(musicVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    noise.start(t);
    noise.stop(t + 0.1);
  }
}

function tick() {
  if (!getMusicState) return;
  const { musicVolume, musicPlaying } = getMusicState();
  if (!musicPlaying) return;
  const note = MELODY_PATTERN[step % MELODY_PATTERN.length];
  if (note) playLute(note, musicVolume);
  if (step % 8 === 0) {
    const drone = DRONE_PATTERN[(step / 8) % DRONE_PATTERN.length];
    if (drone) playDrone(drone, musicVolume);
  }
  const arp = ARP_PATTERN[step % ARP_PATTERN.length];
  if (arp) playLute(arp, musicVolume);
  const drum = DRUMS_PATTERN[step % DRUMS_PATTERN.length];
  if (drum) playDrum(drum, musicVolume);
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
