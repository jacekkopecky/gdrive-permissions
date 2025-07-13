const state = {
  gapiInited: false,
  loadedFiles: false,
  authorized: false,
};

const btnStop = document.querySelector(/** @type {"button"} */ ('#btn_stop'));
const btnSaveNow = document.querySelector(/** @type {"button"} */ ('#btn_save_now'));
const btnAuthorize = document.querySelector(/** @type {"button"} */ ('#btn_authorize'));
const btnLoad = document.querySelector(/** @type {"button"} */ ('#btn_load'));

/** @param {keyof typeof state} stateKeyDone */
export function maybeEnableButtons(stateKeyDone) {
  state[stateKeyDone] = true;

  if (state.gapiInited) {
    btnAuthorize.disabled = false;
  }

  if (state.gapiInited && state.loadedFiles && state.authorized) {
    btnLoad.disabled = false;
    btnSaveNow.disabled = false;
  }

  if (state.authorized) {
    document.body.classList.add('authorized');
  }
}

export function toggleRunningButtons(running = false) {
  btnStop.disabled = !running;
  btnSaveNow.disabled = running;
}
