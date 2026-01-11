/**
 * @import {LoadedFile} from "./types"
 */

import { maybeEnableButtons } from './buttons.js';
import { compressToLocalStorage, decompressFromLocalStorage } from './compressed-storage.js';
import { logStat } from './stats.js';

const LOCAL_STORAGE_FILES_KEY = 'gdrive-permissions-loaded-files';
const LOCAL_STORAGE_WHEN_KEY = 'gdrive-permissions-loaded-files-when';

const saveCheckbox = document.querySelector(/** @type {'input'} */ ('#save_checkbox'));
const btnClearStorage = document.querySelector(/** @type {"button"} */ ('#btn_clear_storage'));
btnClearStorage.disabled = !(LOCAL_STORAGE_FILES_KEY in localStorage);
btnClearStorage.addEventListener('click', () => {
  localStorage.removeItem(LOCAL_STORAGE_FILES_KEY);
  localStorage.removeItem(LOCAL_STORAGE_WHEN_KEY);
  const when = new Date().toLocaleString();
  logStat(`cleared local storage on ${when}`);
  btnClearStorage.disabled = true;
});

export async function importLocallySavedFiles() {
  /** @type {LoadedFile[]} */
  let files;

  try {
    if (LOCAL_STORAGE_FILES_KEY in localStorage) {
      files = await decompressFromLocalStorage(LOCAL_STORAGE_FILES_KEY);
      const when = localStorage.getItem(LOCAL_STORAGE_WHEN_KEY);
      logStat(`loaded ${files.length} records previously stored in the browser on ${when}`);
      saveCheckbox.checked = true;
    }
  } catch {
    // swallow any exception
  }

  if (!files) files = [];

  /** @type {any} */ (window).loadedFiles = files;

  maybeEnableButtons('loadedFiles');

  return files;
}

/**
 * @param {string} root
 * @param {LoadedFile[]} files
 */
export function addRoot(root, files) {
  files.push({
    isLoaded: false,
    id: root,
    name: `Loaded folder ${root}`,
    permissions: [],
    isFolder: true,
  });
}

/** @param {LoadedFile[]} files */
export async function saveFilesLocally(files) {
  await compressToLocalStorage(LOCAL_STORAGE_FILES_KEY, files);
  const when = new Date().toLocaleString();
  localStorage.setItem(LOCAL_STORAGE_WHEN_KEY, when);
  logStat(`saved ${files.length} records in the browser on ${when}`);
}
