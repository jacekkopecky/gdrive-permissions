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

/**
 * @param {FileInTree[]} loadedFiles
 * @returns {FileInTree[]}
 */
export function makeTree(loadedFiles) {
  /** @type {FileInTree[]} */
  const tree = [];
  const idToFileMap = new Map();

  for (const file of loadedFiles) {
    if (idToFileMap.has(file.id)) {
      console.warn('ignoring file with duplicate id', file);
      continue;
    }

    idToFileMap.set(file.id, file);
    if (file.isFolder) file.children = [];

    if (file.parent) {
      const parent = idToFileMap.get(file.parent);
      if (!parent) {
        console.warn('ignoring file with unknown parent', file);
        continue;
      }

      parent.children.push(file);
    } else {
      tree.push(file);
    }
  }

  sortFiles(tree);

  return tree;
}

/**
 * @param {FileInTree[]} files
 */
function sortFiles(files) {
  files.sort((a, b) => {
    const aFolder = a.isFolder ? -1 : 0;
    const bFolder = b.isFolder ? -1 : 0;
    if (aFolder !== bFolder) {
      return aFolder - bFolder;
    }

    return a.name.localeCompare(b.name);
  });

  for (const file of files) {
    if (file.children) sortFiles(file.children);
  }
}
