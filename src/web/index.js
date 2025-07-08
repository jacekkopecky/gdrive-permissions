/* global gapi */

import './js/gapi.js';
import { importLoadedFiles, addRoot } from './js/loaded-files.js';
import { printStats, loadFiles, stop } from './js/loading-gdrive-files.js';

const ROOT = 'root-folder-gdrive-id';

const loadedFiles = await importLoadedFiles();

if (loadedFiles.length === 0) {
  addRoot(ROOT, loadedFiles);
}

printStats(loadedFiles);

document.querySelector('#btn_load').addEventListener('click', () => loadFiles(loadedFiles));
document.querySelector('#btn_stop').addEventListener('click', stop);
