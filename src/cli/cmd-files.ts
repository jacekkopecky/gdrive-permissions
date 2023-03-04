import archy from '../lib/archy.js';
import { makeHierarchy, readInfoAndPermFiles } from '../lib/gdrive-files.js';
import { CoreFile, InfoFile } from '../lib/types.js';

export default async function listFiles(): Promise<void> {
  const files = await readInfoAndPermFiles();
  if (files.length === 0) {
    console.log('no files found, you may need to run list-files.sh first');
    return;
  }

  console.warn(files.length, 'files');

  annotateNoPermissions(files);

  const hierarchy = makeHierarchy(files);
  printHierarchy(hierarchy);
}

function printHierarchy<T extends CoreFile<T>>(roots: T[]): void {
  for (const root of roots) {
    console.log(archy(root));
  }
}

function annotateNoPermissions(files: InfoFile[]): void {
  for (const file of files) {
    if (file.permissions == null || file.permissions.length === 0) {
      file.name += '  (🔴⚠️  NO PERMISSIONS)';
    }
  }
}
