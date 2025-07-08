let gapiInited = false;
let loadedFiles = false;

export function maybeEnableButtons(state) {
  gapiInited ||= state?.gapiInited;
  loadedFiles ||= state?.loadedFiles;

  if (gapiInited && loadedFiles) {
    document.querySelector('#btn_authorize').disabled = false;
    document.querySelector('#btn_load').disabled = false;
    document.querySelector('#btn_stop').disabled = false;
  }
}
