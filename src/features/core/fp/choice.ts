/** Select one lazy computation while evaluating only the chosen branch. */
export const choose = <Value>(
  condition: boolean,
  onTrue: () => Value,
  onFalse: () => Value,
): Value => condition ? onTrue() : onFalse();
