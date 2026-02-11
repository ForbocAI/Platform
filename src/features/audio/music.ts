/**
 * Ritual ambient music: deep drones, incantation-like chant, sparse percussion.
 * Re-exports from patterns.ts (note/pattern data) and playback.ts (schedule/playback).
 * Volume and playing state are managed in audioSlice via setMusicStateGetter.
 */

export { setMusicStateGetter, startMusic, stopMusic } from "./playback";
export * from "./patterns";
