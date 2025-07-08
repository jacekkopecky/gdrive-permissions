import { maybeEnableButtons } from './buttons.js';

export async function importLoadedFiles() {
  /** @type {{
   *    isLoaded: boolean,
   *    id: string,
   *    name: string,
   *    permissions: unknown[],
   *    isFolder: boolean,
   *    parent?: string
   * }[]} */
  let files;

  try {
    files = (await import('../loaded-files.json', { with: { type: 'json' } })).default;
  } catch {
    files = [];
  }

  window.loadedFiles = files;
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
