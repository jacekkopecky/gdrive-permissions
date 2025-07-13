/**
 * @import {FileInTree, LoadedFile, Permission} from "./types"
 */

import { toggleRunningButtons } from './buttons.js';
import { saveFilesLocally } from './local-storage.js';

const statsEl = document.querySelector('#stats');
const errorsEl = document.querySelector('#errors');
const saveCheckbox = document.querySelector(/** @type {'input'} */ ('#save_checkbox'));

let running = false;

export function stop() {
  running = false;
}

/**
 * @param {LoadedFile[]} files
 */
export async function loadGdriveFiles(files) {
  if (running) return;

  statsEl.textContent += `started loading at ${new Date().toLocaleString()}\n`;

  console.time('loadFiles');
  try {
    running = true;
    toggleRunningButtons(true);

    const attempted = new Set();

    do {
      printStats(files);
      const nextFolder = files.find((f) => f.isFolder && !f.isLoaded && !attempted.has(f));
      if (!nextFolder) {
        break;
      }

      attempted.add(nextFolder);

      const filesInNext = await loadFilesIn(nextFolder.id);
      if (filesInNext) {
        nextFolder.isLoaded = true;
        files.push(
          ...filesInNext.map((f) => {
            const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
            return {
              isLoaded: !isFolder,
              id: f.id,
              name: f.name,
              permissions: f.permissions,
              isFolder,
              parent: nextFolder.id,
            };
          }),
        );
      }
    } while (running);
  } catch (err) {
    errorsEl.textContent = err.message;
    errorsEl.scrollIntoView();
  }

  statsEl.textContent += `stopped loading at ${new Date().toLocaleString()}\n`;

  if (saveCheckbox.checked) {
    saveFilesLocally(files);
  }

  toggleRunningButtons(false);
  console.timeEnd('loadFiles');
}

/**
 * @param {string} dir
 */
async function loadFilesIn(dir) {
  try {
    let pageToken = undefined;
    let files = [];

    do {
      console.log(`loading files in ${dir}`, pageToken ? '(continued)' : '');

      const response = await gapi.client.drive.files.list({
        // @ts-ignore
        pageSize: 1000,
        pageToken,
        fields: 'nextPageToken, files(id, name, permissions, mimeType, parents)',
        q: `'${dir}' in parents`,
      });

      // @ts-ignore
      files.push(...response.result.files);

      pageToken = response.result.nextPageToken;
    } while (pageToken);

    return files;
  } catch (err) {
    errorsEl.textContent = err.message;
    return;
  }
}

/**
 * @param {LoadedFile[]} files
 */
export function printStats(files) {
  const knownFilesCount = files.length;
  const allFolders = files.filter((f) => f.isFolder);
  const pendingFoldersCount = allFolders.filter((f) => !f.isLoaded).length;

  const remaining = `${pendingFoldersCount} of ${allFolders.length}`;
  statsEl.textContent += `loaded ${String(knownFilesCount - allFolders.length).padStart(4)} files, remaining ${remaining.padStart(10)} folders\n`;
}

/**
 * @param {{fileId: string, permissionId: string}} perm
 */
export function deletePermission(perm) {
  return gapi.client.drive.permissions.delete(perm);
}
