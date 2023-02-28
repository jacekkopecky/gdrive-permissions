/**
 * This CLI tool helps you manage permissions in shared Google Drives.
 *
 * Use `gdrivep --help` for usage instructions.
 */

import archy from './lib/archy.js';
import { CoreFile, makeHierarchy, readInfoFiles } from './lib/gdrive-files.js';
// import fs from 'fs/promises';

const data2 = await readInfoFiles();
console.log(data2.length, data2.slice(-2));
const h2 = makeHierarchy(data2);
console.log(h2.length);

printHierarchy(h2);

function printHierarchy<T extends CoreFile<T>>(roots: T[]): void {
  for (const root of roots) {
    console.log(archy(root));
  }
}

// async function saveHierarchy<T extends CoreFile<T>>(roots: T[], filename: string): void {
//   const all = roots.map((root) => archy(root)).join('\n');
//   await fs.writeFile(filename, all, 'utf8');
// }
