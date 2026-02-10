import { getAudioContext } from "./core";

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

export function playButtonClick(masterVolume: number) {
  if (masterVolume <= 0) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 240;
  const crunch = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128 - 1) * 1.4;
    curve[i] = (Math.tanh(x) * 0.5 + 0.5) * 2 - 1;
  }
  crunch.curve = curve;
  const osc = ctx.createOscillator();
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 110;
  sub.type = "sine";
  sub.frequency.value = 55;
  subGain.gain.setValueAtTime(0.5, t);
  osc.connect(filter);
  sub.connect(subGain);
  subGain.connect(filter);
  filter.connect(crunch);
  crunch.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(masterVolume * 0.5, t + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  osc.start(t);
  sub.start(t);
  osc.stop(t + 0.14);
  sub.stop(t + 0.14);

  const glitchSize = Math.ceil(ctx.sampleRate * 0.018);
  const glitchBuf = ctx.createBuffer(1, glitchSize, ctx.sampleRate);
  const glitchData = glitchBuf.getChannelData(0);
  for (let i = 0; i < glitchSize; i++) {
    glitchData[i] = (Math.random() * 2 - 1) * (1 - i / glitchSize);
  }
  const glitchSrc = ctx.createBufferSource();
  glitchSrc.buffer = glitchBuf;
  const glitchBp = ctx.createBiquadFilter();
  glitchBp.type = "bandpass";
  glitchBp.frequency.value = 400 + Math.random() * 600;
  glitchBp.Q.value = 0.6;
  const glitchGain = ctx.createGain();
  glitchSrc.connect(glitchBp);
  glitchBp.connect(glitchGain);
  glitchGain.connect(ctx.destination);
  glitchGain.gain.setValueAtTime(0, t);
  glitchGain.gain.linearRampToValueAtTime(masterVolume * 0.12, t + 0.002);
  glitchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
  glitchSrc.start(t);
  glitchSrc.stop(t + 0.018);

  const crunchSize = Math.ceil(ctx.sampleRate * 0.04);
  const crunchBuf = ctx.createBuffer(1, crunchSize, ctx.sampleRate);
  const crunchData = crunchBuf.getChannelData(0);
  for (let i = 0; i < crunchSize; i++) {
    crunchData[i] = (Math.random() * 2 - 1) * (1 - i / crunchSize);
  }
  const crunchSrc = ctx.createBufferSource();
  crunchSrc.buffer = crunchBuf;
  const crunchLp = ctx.createBiquadFilter();
  crunchLp.type = "lowpass";
  crunchLp.frequency.value = 320;
  const crunchGain = ctx.createGain();
  crunchSrc.connect(crunchLp);
  crunchLp.connect(crunchGain);
  crunchGain.connect(ctx.destination);
  crunchGain.gain.setValueAtTime(0, t);
  crunchGain.gain.linearRampToValueAtTime(masterVolume * 0.14, t + 0.008);
  crunchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  crunchSrc.start(t);
  crunchSrc.stop(t + 0.04);
}
