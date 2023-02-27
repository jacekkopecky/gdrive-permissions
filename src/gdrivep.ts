import { readColFile } from './read-col-file.js';

const file = process.argv[2];
if (!file) {
  console.log('gimme file');
  process.exit(-1);
}

const data = await readColFile(file);
console.log(data);
