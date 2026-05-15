/**
 * Note constants and arrangement tables for Lanternbough's Rootsong.
 * The song cycles through verse, chorus, bridge, and chorus for a brighter daytime meadow feel.
 */

const bar = (...steps: number[]) => steps;
const rootBar = (note: number) => [note, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const joinBars = (...bars: number[][]) => bars.flat();

export const N = {
  F1: 43.65,
  G1: 49.0,
  A1: 55.0,
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
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

const VERSE_MELODY_PATTERN = joinBars(
  bar(N.C5, 0, 0, 0, N.G4, 0, 0, 0, N.A4, 0, 0, 0, N.G4, 0, 0, 0),
  bar(N.E4, 0, 0, 0, N.G4, 0, 0, 0, N.A4, 0, 0, 0, N.B4, 0, 0, 0),
  bar(N.A4, 0, 0, 0, N.C5, 0, 0, 0, N.D5, 0, 0, 0, N.C5, 0, 0, 0),
  bar(N.G4, 0, 0, 0, N.E4, 0, 0, 0, N.F4, 0, 0, 0, N.G4, 0, 0, 0)
);

const CHORUS_MELODY_PATTERN = joinBars(
  bar(N.E5, 0, 0, 0, N.D5, 0, 0, 0, N.C5, 0, 0, 0, N.E5, 0, 0, 0),
  bar(N.D5, 0, 0, 0, N.B4, 0, 0, 0, N.A4, 0, 0, 0, N.G4, 0, 0, 0),
  bar(N.A4, 0, 0, 0, N.G4, 0, 0, 0, N.E4, 0, 0, 0, N.F4, 0, 0, 0),
  bar(N.G4, 0, 0, 0, N.C5, 0, 0, 0, N.E5, 0, 0, 0, N.D5, 0, 0, 0)
);

const BRIDGE_MELODY_PATTERN = joinBars(
  bar(N.A4, 0, 0, 0, N.C5, 0, 0, 0, N.E5, 0, 0, 0, N.D5, 0, 0, 0),
  bar(N.C5, 0, 0, 0, N.A4, 0, 0, 0, N.G4, 0, 0, 0, N.F4, 0, 0, 0),
  bar(N.E4, 0, 0, 0, N.G4, 0, 0, 0, N.A4, 0, 0, 0, N.G4, 0, 0, 0),
  bar(N.D4, 0, 0, 0, N.G4, 0, 0, 0, N.B4, 0, 0, 0, N.A4, 0, 0, 0)
);

const VERSE_ARP_PATTERN = joinBars(
  bar(0, 0, N.C4, 0, 0, 0, N.E4, 0, 0, 0, N.G4, 0, 0, 0, N.E4, 0),
  bar(0, 0, N.B3, 0, 0, 0, N.D4, 0, 0, 0, N.G4, 0, 0, 0, N.D4, 0),
  bar(0, 0, N.A3, 0, 0, 0, N.C4, 0, 0, 0, N.E4, 0, 0, 0, N.C4, 0),
  bar(0, 0, N.A3, 0, 0, 0, N.C4, 0, 0, 0, N.F4, 0, 0, 0, N.C4, 0)
);

const CHORUS_ARP_PATTERN = joinBars(
  bar(0, N.C4, 0, N.E4, 0, N.G4, 0, N.E4, 0, N.C5, 0, N.G4, 0, N.E4, 0, N.D4),
  bar(0, N.B3, 0, N.D4, 0, N.G4, 0, N.D4, 0, N.B4, 0, N.G4, 0, N.D4, 0, N.B3),
  bar(0, N.A3, 0, N.C4, 0, N.F4, 0, N.C4, 0, N.A4, 0, N.F4, 0, N.C4, 0, N.A3),
  bar(0, N.C4, 0, N.E4, 0, N.G4, 0, N.E4, 0, N.C5, 0, N.G4, 0, N.E4, 0, N.G4)
);

const BRIDGE_ARP_PATTERN = joinBars(
  bar(0, N.E4, 0, N.C4, 0, N.A3, 0, N.C4, 0, N.E4, 0, N.A4, 0, N.E4, 0, N.C4),
  bar(0, N.C4, 0, N.A3, 0, N.F3, 0, N.A3, 0, N.C4, 0, N.F4, 0, N.C4, 0, N.A3),
  bar(0, N.G3, 0, N.C4, 0, N.E4, 0, N.G4, 0, N.E4, 0, N.C4, 0, N.G3, 0, N.C4),
  bar(0, N.D4, 0, N.B3, 0, N.G3, 0, N.B3, 0, N.D4, 0, N.G4, 0, N.D4, 0, N.B3)
);

const VERSE_DRONE_PATTERN = joinBars(
  rootBar(N.C2),
  rootBar(N.G2),
  rootBar(N.A2),
  rootBar(N.F2)
);

const CHORUS_DRONE_PATTERN = joinBars(
  rootBar(N.C2),
  rootBar(N.G2),
  rootBar(N.F2),
  rootBar(N.C2)
);

const BRIDGE_DRONE_PATTERN = joinBars(
  rootBar(N.A2),
  rootBar(N.F2),
  rootBar(N.C2),
  rootBar(N.G2)
);

const VERSE_BASS_PATTERN = joinBars(
  rootBar(N.C2),
  rootBar(N.G1),
  rootBar(N.A1),
  rootBar(N.F1)
);

const CHORUS_BASS_PATTERN = joinBars(
  rootBar(N.C2),
  rootBar(N.G1),
  rootBar(N.F1),
  rootBar(N.C2)
);

const BRIDGE_BASS_PATTERN = joinBars(
  rootBar(N.A1),
  rootBar(N.F1),
  rootBar(N.C2),
  rootBar(N.G1)
);

const VERSE_DRUMS_PATTERN = joinBars(
  bar(1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 3, 0, 2, 0, 0, 0),
  bar(1, 0, 0, 0, 0, 0, 3, 0, 1, 0, 2, 0, 0, 0, 0, 0),
  bar(1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 3, 0, 2, 0, 0, 0),
  bar(1, 0, 0, 0, 0, 0, 3, 0, 1, 0, 2, 0, 4, 0, 0, 0)
);

const CHORUS_DRUMS_PATTERN = joinBars(
  bar(1, 0, 2, 0, 0, 3, 2, 0, 1, 0, 2, 0, 0, 3, 2, 0),
  bar(1, 0, 2, 0, 0, 3, 0, 0, 1, 0, 2, 0, 0, 3, 0, 0),
  bar(1, 0, 2, 0, 0, 3, 2, 0, 1, 0, 2, 0, 0, 3, 2, 0),
  bar(1, 0, 2, 0, 4, 0, 2, 0, 1, 0, 2, 0, 0, 3, 0, 0)
);

const BRIDGE_DRUMS_PATTERN = joinBars(
  bar(1, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0, 0, 2, 0, 0, 0),
  bar(1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 0),
  bar(1, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0, 0, 2, 0, 0, 0),
  bar(0, 0, 0, 0, 4, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0)
);

const VERSE_ACCENT_PATTERN = joinBars(
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.D5, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.B4, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.C5, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.A4, 0)
);

const CHORUS_ACCENT_PATTERN = joinBars(
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.E5, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.D5, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.C5, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, N.E5, 0, 0, 0)
);

const BRIDGE_ACCENT_PATTERN = joinBars(
  bar(0, 0, 0, 0, 0, 0, 0, 0, N.C5, 0, 0, 0, 0, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, N.A4, 0, 0, 0, 0, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, N.G4, 0, 0, 0, 0, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, N.D5, 0, 0, 0, 0, 0, 0, 0)
);

const VERSE_BROOK_PATTERN = joinBars(
  bar(0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0)
);

const CHORUS_BROOK_PATTERN = joinBars(
  rootBar(0),
  rootBar(0),
  rootBar(0),
  rootBar(0)
);

const BRIDGE_BROOK_PATTERN = joinBars(
  bar(0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0),
  bar(0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  bar(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0)
);

export const SONG_SECTION_LENGTH = 64;

export const MELODY_PATTERN = [
  ...VERSE_MELODY_PATTERN,
  ...CHORUS_MELODY_PATTERN,
  ...BRIDGE_MELODY_PATTERN,
  ...CHORUS_MELODY_PATTERN,
];

export const ARP_PATTERN = [
  ...VERSE_ARP_PATTERN,
  ...CHORUS_ARP_PATTERN,
  ...BRIDGE_ARP_PATTERN,
  ...CHORUS_ARP_PATTERN,
];

export const DRONE_PATTERN = [
  ...VERSE_DRONE_PATTERN,
  ...CHORUS_DRONE_PATTERN,
  ...BRIDGE_DRONE_PATTERN,
  ...CHORUS_DRONE_PATTERN,
];

export const BASS_PATTERN = [
  ...VERSE_BASS_PATTERN,
  ...CHORUS_BASS_PATTERN,
  ...BRIDGE_BASS_PATTERN,
  ...CHORUS_BASS_PATTERN,
];

export const DRUMS_PATTERN = [
  ...VERSE_DRUMS_PATTERN,
  ...CHORUS_DRUMS_PATTERN,
  ...BRIDGE_DRUMS_PATTERN,
  ...CHORUS_DRUMS_PATTERN,
];

export const ACCENT_PATTERN = [
  ...VERSE_ACCENT_PATTERN,
  ...CHORUS_ACCENT_PATTERN,
  ...BRIDGE_ACCENT_PATTERN,
  ...CHORUS_ACCENT_PATTERN,
];

export const BROOK_PATTERN = [
  ...VERSE_BROOK_PATTERN,
  ...CHORUS_BROOK_PATTERN,
  ...BRIDGE_BROOK_PATTERN,
  ...CHORUS_BROOK_PATTERN,
];

export const BPM = 48;
export const NOTE_DURATION = 60 / BPM / 2;
