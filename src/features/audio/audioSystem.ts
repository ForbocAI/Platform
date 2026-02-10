/**
 * Simple 8-bit style sound effects and ritual ambient music using Web Audio API.
 * Volume and music playing state are managed in audioSlice.
 * Implementation is split into core (context), sfx, and music submodules.
 */

export { getAudioContext } from "./core";
export { playShoot, playHit, playButtonClick } from "./sfx";
export { setMusicStateGetter, startMusic, stopMusic } from "./music";
