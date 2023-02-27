/**
 * This CLI tool implements `colrm` functionality with correct emoji widths
 * (unlike `colrm` in macOS 12.6).
 */

import { colrmWidth } from './lib/colrm-width.js';
import readline from 'readline';

const start = Number(process.argv[2]) || undefined;
const end = Number(process.argv[3]) || Infinity;

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});
// Note: we use the crlfDelay option to recognize all instances of CR LF
// ('\r\n') in input.txt as a single line break.

for await (const line of rl) {
  console.log(colrmWidth(line, start, end));
}

// todo if removing columns within full-width characters, could replace with ¦?
// e.g. echo 'ｕｎｉｘ' | node projects/gdrive-permissions/colrm.js 1 1  --> '¦ｎｉｘ'
// e.g. echo 'ｕｎｉｘ' | node projects/gdrive-permissions/colrm.js 1 2  --> 'ｎｉｘ'
// e.g. echo 'ｕｎｉｘ' | node projects/gdrive-permissions/colrm.js 2 2  --> '¦ｎｉｘ'
// e.g. echo 'ｕｎｉｘ' | node projects/gdrive-permissions/colrm.js 3 3  --> 'ｕ¦ｉｘ'
// e.g. echo 'ｕｎｉｘ' | node projects/gdrive-permissions/colrm.js 4 5  --> 'ｕ¦¦ｘ'
// e.g. echo '✅✅✅✅' | node projects/gdrive-permissions/colrm.js 4 6  --> '✅¦✅'
// e.g. echo '✅✅✅✅' | node projects/gdrive-permissions/colrm.js 3 6  --> '✅✅'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 1 3  --> 'd✅0123'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 1 5  --> '¦0123'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 1 6  --> '0123'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 5 6  --> 'abcd0123'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 5 5  --> 'abcd¦0123'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 6 6  --> 'abcd¦0123'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 6 8  --> 'abcd¦23'
// e.g. echo 'abcd✅0123' | node projects/gdrive-permissions/colrm.js 8 9  --> 'abcd✅03'
