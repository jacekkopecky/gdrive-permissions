const state = {
  gapiInited: false,
  loadedFiles: false,
  authorized: false,
};

/** @param {keyof typeof state} stateKeyDone */
export function maybeEnableButtons(stateKeyDone) {
  state[stateKeyDone] = true;

  if (state.gapiInited) {
    document.querySelector(/** @type {"button"} */ ('#btn_authorize')).disabled = false;
  }

  if (state.gapiInited && state.loadedFiles && state.authorized) {
    document.querySelector(/** @type {"button"} */ ('#btn_load')).disabled = false;
  }
}

const btnStop = document.querySelector(/** @type {"button"} */ ('#btn_stop'));
const btnSaveNow = document.querySelector(/** @type {"button"} */ ('#btn_save_now'));

export function toggleRunningButtons(running = false) {
  btnStop.disabled = !running;
  btnSaveNow.disabled = running;
}
