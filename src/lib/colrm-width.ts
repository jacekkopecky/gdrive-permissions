import stripAnsi from 'strip-ansi';
import eastAsianWidth from 'eastasianwidth';
import emojiRegex from 'emoji-regex';

const emoji = emojiRegex();

interface ColrmWidthOptions {
  ambiguousIsNarrow?: boolean;
  emojiIsWide?: boolean;
}

export function colrmWidth(
  string: string,
  start?: number,
  end?: number,
  options: ColrmWidthOptions = {}
): string {
  if (typeof string !== 'string' || string.length === 0) {
    return '';
  }

  if (typeof start !== 'number' || Number.isNaN(start)) start = 0;
  if (typeof end !== 'number' || Number.isNaN(end)) end = 0;

  options = {
    ambiguousIsNarrow: true,
    emojiIsWide: true,
    ...options,
  };

  string = stripAnsi(string);

  if (string.length === 0) {
    return '';
  }

  const ambiguousCharacterWidth = options.ambiguousIsNarrow ? 1 : 2;
  const emojiWidth = options.emojiIsWide ? 2 : 1;

  let width = 0;
  let retval = '';

  for (const character of string) {
    const codePoint = character.codePointAt(0);

    if (character.match(emoji)) {
      width += emojiWidth;
    } else if (codePoint == null || codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      // Ignore control characters
    } else if (codePoint >= 0x300 && codePoint <= 0x36f) {
      // Ignore combining characters
    } else {
      const code = eastAsianWidth.eastAsianWidth(character);
      switch (code) {
        case 'F':
        case 'W':
          width += 2;
          break;
        case 'A':
          width += ambiguousCharacterWidth;
          break;
        default:
          width += 1;
      }
    }

    if (width < start || width > end) {
      retval += character;
    }
  }

  return retval;
}
