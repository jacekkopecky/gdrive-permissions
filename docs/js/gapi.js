/* global gapi,google */

import { maybeEnableButtons } from './buttons.js';
import { API_KEY, DISCOVERY_DOC, CLIENT_ID, SCOPES } from './config.js';

const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: CLIENT_ID,
  scope: SCOPES,
  prompt: '',
  callback(resp) {
    if (resp.error !== undefined) {
      throw resp;
    }
    maybeEnableButtons('authorized');
  },
});

gapi.load('client', initializeGapiClient);

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  maybeEnableButtons('gapiInited');
}

document.querySelector('#btn_authorize').addEventListener('click', handleAuthClick);
function handleAuthClick() {
  const token = gapi.client.getToken();
  if (token == null) {
    tokenClient.requestAccessToken({ prompt: '' });
    // tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}
