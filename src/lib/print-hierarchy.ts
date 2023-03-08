import archy from '../lib/archy.js';
import { CoreFile } from './types.js';

export function printHierarchy<T extends CoreFile<T>>(roots: T[]): void {
  for (const root of roots) {
    console.log(archy(root));
  }
}
