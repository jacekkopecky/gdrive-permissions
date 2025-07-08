import { maybeEnableButtons } from './buttons.js';

/**
 * @import {LoadedFile, FileInTree} from "./types"
 */

export async function importLoadedFiles() {
  /** @type {LoadedFile[]} */
  let files;

  try {
    const imported = await import('../loaded-files.json', { with: { type: 'json' } });
    files = /** @type {LoadedFile[]} */ (imported.default);
  } catch {
    files = [];
  }

  /** @type {any} */ (window).loadedFiles = files;
  maybeEnableButtons({ loadedFiles: true });

  return files;
}

export function addRoot(root, files) {
  files.push({
    isLoaded: false,
    id: root,
    name: 'ROOT',
    permissions: [],
    isFolder: true,
  });
}
