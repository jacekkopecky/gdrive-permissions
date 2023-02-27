import fs from 'fs';
import readline from 'readline';
import eastAsianWidth from 'eastasianwidth';
import emojiRegex from 'emoji-regex';

const emoji = emojiRegex();

export async function readColFile(filename: string): Promise<Record<string, string>[]> {
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const columns: ColumnDefinition[] = [];
  const retval = [];

  for await (const line of rl) {
    if (columns.length === 0) {
      // reading first line
      computeColumns(line, columns);
      console.log(columns);
    } else {
      const lineData = splitLine(line, columns);
      if (lineData) retval.push(lineData);
    }
  }

  return retval;
}

function computeColumns(line: string, columnsArray: ColumnDefinition[]) {
  for (const header of line.matchAll(/\S+\s*/g)) {
    if (header.index != null) {
      columnsArray.push({
        start: header.index,
        name: header[0].trim(),
      });
    }
  }
}

interface ColumnDefinition {
  start: number;
  name: string;
}

function splitLine(line: string, columns: ColumnDefinition[]) {
  if (line.trim() === '') return null;

  const retval: Record<string, string> = {};
  if (columns.length === 0) {
    return retval;
  }

  const ambiguousCharacterWidth = 1;
  const emojiWidth = 2;

  let widthIndex = 0;
  let colIndex = 0;
  let nextColStart = columns[1]?.start ?? Infinity;
  let currString = '';

  for (const character of line) {
    const codePoint = character.codePointAt(0);

    if (character.match(emoji)) {
      widthIndex += emojiWidth;
    } else if (codePoint == null || codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      // Ignore control characters
    } else if (codePoint >= 0x300 && codePoint <= 0x36f) {
      // Ignore combining characters
    } else {
      const code = eastAsianWidth.eastAsianWidth(character);
      switch (code) {
        case 'F':
        case 'W':
          widthIndex += 2;
          break;
        case 'A':
          widthIndex += ambiguousCharacterWidth;
          break;
        default:
          widthIndex += 1;
      }
    }

    if (widthIndex <= nextColStart) {
      currString += character;
    } else {
      retval[columns[colIndex].name] = currString.trim();
      currString = character;
      colIndex += 1;
      nextColStart = columns[colIndex + 1]?.start ?? Infinity;
    }
  }

  if (currString.trim()) {
    retval[columns[colIndex].name] = currString.trim();
  }

  return retval;
}
