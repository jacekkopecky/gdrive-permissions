/**
 * This module reads files output by the `gdrive` tool formatted in columns.
 */

import fs from 'fs';
import readline from 'readline';
import eastAsianWidth from 'eastasianwidth';
import emojiRegex from 'emoji-regex';
import { ReadFileOptions } from './types.js';

const emoji = emojiRegex();

export async function readColFiles(
  filenames: string[],
  opts?: ReadFileOptions
): Promise<Record<string, string>[]> {
  const results = await Promise.all(filenames.map((filename) => readColFile(filename, opts)));
  return results.flat();
}

export async function readColFile(
  filename: string,
  opts?: ReadFileOptions
): Promise<Record<string, string>[]> {
  const options: ReadFileOptions = {
    lowercasePropertyNames: true,
    ...opts,
  };

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
      computeColumns(line, columns, options.lowercasePropertyNames);
    } else {
      const lineData = splitLine(line, columns);
      if (lineData) retval.push(lineData);
    }
  }

  return retval;
}

function computeColumns(line: string, columnsArray: ColumnDefinition[], lowercase?: boolean) {
  for (const header of line.matchAll(/\S+\s*/g)) {
    if (header.index != null) {
      const rawName = header[0].trim();
      const name = lowercase ? rawName.toLowerCase() : rawName;
      columnsArray.push({
        start: header.index,
        name,
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
