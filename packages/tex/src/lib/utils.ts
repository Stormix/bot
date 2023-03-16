export const isDigit = (c: string): boolean => c.length === 1 && c >= '0' && c <= '9';
export const isLetter = (c: string): boolean => c.length === 1 && c.toUpperCase() != c.toLowerCase();

export const spanRunes = (runes: string[], predicate: (rune: string) => boolean): [string[], string[]] => {
  for (let i = 0; i < runes.length; i++) {
    if (!predicate(runes[i])) {
      return [runes.slice(0, i), runes.slice(i)];
    }
  }
  return [runes, []];
};

export const trimRunes = (runes: string[]): string[] => {
  const [, s] = spanRunes(runes, (rune) => rune === ' ' || rune === '\t');
  return s;
};
