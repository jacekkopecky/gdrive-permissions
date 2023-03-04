import fs from 'fs';
import readline from 'readline';
import { ReadFileOptions } from './types.js';

export async function readLineFiles(
  filenames: string[],
  opts?: ReadFileOptions
): Promise<Record<string, string>[]> {
  const results = await Promise.all(filenames.map((filename) => readLineFile(filename, opts)));
  return results.flat();
}

const LINE_RE = /^(\S+):\s+(.*)$/;

export async function readLineFile(
  filename: string,
  opts?: ReadFileOptions
): Promise<Record<string, string>> {
  const options: ReadFileOptions = {
    lowercasePropertyNames: true,
    ...opts,
  };

  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const retval: Record<string, string> = {};

  for await (const line of rl) {
    const match = line.match(LINE_RE);
    if (!match) {
      if (line.trim()) {
        console.warn('Warning: skipping misformatted line:', line);
      }
    } else {
      const key = options.lowercasePropertyNames ? match[1].toLowerCase() : match[1];
      const value = match[2];
      retval[key] = value;
    }
  }

  return retval;
}
