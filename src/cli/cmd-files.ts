import { makeHierarchy, readInfoAndPermFiles } from '../lib/gdrive-files.js';
import { printHierarchy } from '../lib/print-hierarchy.js';
import { InfoFile } from '../lib/types.js';

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

function annotateNoPermissions(files: InfoFile[]): void {
  for (const file of files) {
    if (file.permissions == null || file.permissions.length === 0) {
      file.name += '  (🔴⚠️  NO PERMISSIONS)';
    }
  }
}
