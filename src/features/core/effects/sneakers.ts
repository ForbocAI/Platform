/**
 * Sneakers (1992) Text Decryption Effect — from forbocai.github.io
 * Character cycling and locking effect. Use with elements that have
 * class "encrypted-text" and data-text="Final text to reveal".
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";

const randomChar = (): string =>
  CHARS[Math.floor(Math.random() * CHARS.length)];

const shouldLock = (): boolean =>
  Math.random() > 0.9 + Math.random() * 0.05;

export type DecryptOptions = {
  speed?: number;
};

export function decryptText(
  element: HTMLElement,
  text: string,
  { speed = 30 }: DecryptOptions = {}
): () => void {
  const original = text.split("");
  const current = Array.from<string>({ length: original.length }).fill("");
  const locked = Array.from<boolean>({ length: original.length }).fill(false);

  const interval = setInterval(() => {
    let completed = 0;

    const output = current
      .map((_, index) => {
        if (locked[index]) {
          completed++;
          return original[index];
        }
        if (shouldLock()) locked[index] = true;
        return randomChar();
      })
      .join("");

    element.textContent = output;

    if (completed === original.length) {
      clearInterval(interval);
    }
  }, speed);

  return () => clearInterval(interval);
}
