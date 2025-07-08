/* global gapi,google */

import loadedFilesImport from './loaded-files.json' with { type: 'json' };

/** @type {{
 isLoaded: boolean,
 id: string,
 name: string,
 permissions: unknown[],
 isFolder: boolean,
 parent?: string
}[]} */
const loadedFiles = loadedFilesImport;

window.loadedFiles = loadedFiles;

const CLIENT_ID = '464788617740-vids6f3rf9vubg41bft9kj39s1q744hd.apps.googleusercontent.com';
const API_KEY = 'AIzaSyACPcvEvNIvclG8fy8cXfHzVq6byEIN3nA';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

/** @type {google.accounts.oauth2.TokenClient} */
let tokenClient;
let gapiInited = false;
let gisInited = false;

document.querySelector('#btn_authorize').addEventListener('click', handleAuthClick);
document.querySelector('#btn_load').addEventListener('click', loadFiles);
document.querySelector('#btn_stop').addEventListener('click', stop);
const statsEl = document.getElementById('stats');
const errorsEl = document.getElementById('errors');

/**
 * Callback after api.js is loaded.
 */
window.gapiLoaded = function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
};

let stopping = false;
function stop() {
  stopping = true;
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
window.gisLoaded = function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    prompt: '',
  });
  gisInited = true;
  maybeEnableButtons();
};

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.querySelector('#btn_authorize').disabled = false;
    printStats();
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
  };

  const token = gapi.client.getToken();
  if (token == null) {
    tokenClient.requestAccessToken({ prompt: '' });
    // tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

const ROOT = 'root-folder-gdrive-id';
if (loadedFiles.length === 0) {
  loadedFiles.push({
    isLoaded: false,
    id: ROOT,
    name: 'ROOT',
    permissions: [],
    isFolder: true,
  });
}

async function loadFiles() {
  console.time('loadFiles');
  try {
    stopping = false;

    do {
      printStats();
      const nextFolder = loadedFiles.find((f) => f.isFolder && !f.isLoaded);
      if (!nextFolder) {
        break;
      }

      const files = await loadFilesIn(nextFolder.id);
      if (files) {
        nextFolder.isLoaded = true;
        loadedFiles.push(
          ...files.map((f) => {
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
    } while (!stopping);
  } catch (err) {
    errorsEl.textContent = err.message;
  }
  console.timeEnd('loadFiles');
}

function printStats() {
  const knownFilesCount = loadedFiles.length;
  const allFolders = loadedFiles.filter((f) => f.isFolder);
  const pendingFoldersCount = allFolders.filter((f) => !f.isLoaded).length;

  const remaining = `${pendingFoldersCount} of ${allFolders.length}`;
  statsEl.textContent += `loaded ${String(knownFilesCount - allFolders.length).padStart(4)} files, remaining ${remaining.padStart(10)} folders\n`;

  errorsEl.scrollIntoView({ behavior: 'instant' });
}

async function loadFilesIn(dir) {
  try {
    let pageToken = undefined;
    let files = [];

    do {
      console.log(`loading files in ${dir}`, pageToken ? '(continued)' : '');

      const response = await gapi.client.drive.files.list({
        pageSize: 1000,
        pageToken,
        fields: 'nextPageToken, files(id, name, permissions, mimeType, parents)',
        q: `'${dir}' in parents`,
      });

      files.push(...response.result.files);

      pageToken = response.result.nextPageToken;
    } while (pageToken);

    return files;
  } catch (err) {
    errorsEl.textContent = err.message;
    return;
  }
}
