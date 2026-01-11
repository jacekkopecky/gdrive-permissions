const statsEl = document.querySelector('#stats');
const errorsEl = document.querySelector('#errors');

// @ts-ignore
import styles from './stats.css' with { type: 'css' };
document.adoptedStyleSheets.push(styles);

/**
 * @param {string} str
 */
export function logStat(str) {
  statsEl.textContent += str + '\n';

  // scroll to the bottom of stats
  statsEl.scrollTop += 1000;
}

/**
 * @param {string} str
 */
export function logError(str) {
  errorsEl.textContent += str + '\n';
  // scroll the page so the errors block is visible
  errorsEl.scrollIntoView();
}
