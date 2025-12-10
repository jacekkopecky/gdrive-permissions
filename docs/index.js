import './js/gapi.js';
import { addRoot, importLocallySavedFiles, saveFilesLocally } from './js/local-storage.js';
import { printStats, loadGdriveFiles, stop } from './js/loading-gdrive-files.js';
import { getPeopleWithPermissions, showPeople } from './js/permissions.js';
import { makeTree, showTree } from './js/tree-view.js';

const loadedFiles = await importLocallySavedFiles();

/** @type {HTMLElement | null} */
let previousTree = null;
let previousPeople = null;

/** @type {HTMLInputElement} */
const rootInput = document.querySelector('#root_input');
const filesSection = document.querySelector(/** @type {'div'} */ ('#files'));
const permissionsSection = document.querySelector(/** @type {'div'} */ ('#permissions'));

document.querySelector('#btn_load').addEventListener('click', async () => {
  toggleSections(false);
  if (rootInput.value && !loadedFiles.find((f) => f.id === rootInput.value))
    addRoot(rootInput.value, loadedFiles);
  await loadGdriveFiles(loadedFiles);
  showEverything();
});
document.querySelector('#btn_save_now').addEventListener('click', () => {
  saveFilesLocally(loadedFiles);
});
document.querySelector('#btn_stop').addEventListener('click', stop);

if (loadedFiles.length > 0) showEverything();

function showEverything() {
  toggleSections(true);

  printStats(loadedFiles);

  const tree = makeTree(loadedFiles);

  previousTree?.remove();
  previousTree = showTree(tree, filesSection);

  const people = getPeopleWithPermissions(tree);

  previousPeople?.remove();
  previousPeople = showPeople(
    people,
    permissionsSection,
    document.querySelector('#files .for-selected'),
  );
}

function toggleSections(show = false) {
  filesSection.classList.toggle('hidden', !show);
  permissionsSection.classList.toggle('hidden', !show);
}
