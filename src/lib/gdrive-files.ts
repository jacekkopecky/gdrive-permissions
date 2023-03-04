/**
 * This module keeps track of the files in .gdrive-permissions.
 */

import fs from 'fs/promises';
import path from 'path';
import { readColFile } from './read-col-file.js';
import { readLineFile } from './read-line-file.js';
import {
  CoreFile,
  File,
  InfoFile,
  isFile,
  isInfoFile,
  isPermissions,
  Permission,
} from './types.js';

const FILES_DIR = '.gdrive-permissions';
const LS_FILE_RE = /(?:^|\/)ls-(.*)\.dir$/;
const INFO_FILE_RE = /(?:^|\/)info-(.*)\.txt$/;
function PERM_FILE(id: string) {
  return path.join(FILES_DIR, `perm-${id}.txt`);
}

/**
 * Read **all** the ls-*.dir files and return an array of the files and folders listed there.
 */
export async function readLsFiles(): Promise<File[]> {
  const retval: File[] = [];
  const fileNames = await listFiles(LS_FILE_RE);
  for (const fileName of fileNames) {
    const records = await readColFile(fileName);
    const rawId = fileName.match(LS_FILE_RE)?.[1];
    const id = rawId !== 'self' ? rawId : undefined;
    for (const record of records) {
      if (isFile(record)) {
        retval.push(record);
        record.parent = id;
      } else {
        console.warn('Warning: skipping file record due to bad structure', record);
      }
    }
  }
  return retval;
}

/**
 * Read all the info-*.txt files and return an array of the file/folder information contained there.
 */
export async function readInfoAndPermFiles(): Promise<InfoFile[]> {
  const retval: InfoFile[] = [];
  const fileNames = await listFiles(INFO_FILE_RE);
  for (const fileName of fileNames) {
    const record = await readLineFile(fileName);
    const id = fileName.match(INFO_FILE_RE)?.[1];
    if (isInfoFile(record)) {
      retval.push(record);
      record.parent = record.parents;
      if (id !== record.id) {
        console.warn(`Warning: file ID inside doesn't match filename: ${fileName} `);
      }
      record.permissions = await readPermissions(record);
    } else {
      console.warn('Warning: skipping file record due to bad structure', record);
    }
  }
  return retval;
}

async function readPermissions(file: InfoFile): Promise<Permission[] | undefined> {
  try {
    const records = await readColFile(PERM_FILE(file.id));
    if (records.length === 0) {
      console.warn(`Warning: no permissions in file ${PERM_FILE(file.id)}`);
    } else if (isPermissions(records)) {
      return records;
    } else {
      console.warn(`Warning: invalid permissions file ${PERM_FILE(file.id)}`);
    }
  } catch (e) {
    console.warn(`Warning: could not read permissions file ${PERM_FILE(file.id)}`);
  }
}

export function makeHierarchy<T extends CoreFile<T>>(files: T[]): T[] {
  const idToFile = new Map<string, T>();
  for (const file of files) {
    idToFile.set(file.id, file);
  }

  const roots = [];
  for (const file of files) {
    if (file.parent) {
      const parent = idToFile.get(file.parent);
      if (parent) {
        parent.children ??= [];
        parent.children.push(file);
      } else {
        console.warn(`Warning: missing parent ${file.parent} of file ${file.id}`);
      }
    } else {
      roots.push(file);
    }
  }

  // sort all alphabetically
  roots.sort(compareFiles);
  for (const file of files) {
    file.children?.sort(compareFiles);
  }

  return roots;
}

async function listFiles(pattern: RegExp): Promise<string[]> {
  try {
    const files = await fs.readdir(FILES_DIR);
    return files.filter((name) => pattern.test(name)).map((name) => path.join(FILES_DIR, name));
  } catch (e) {
    console.error(`error listing files in ${FILES_DIR}`);
    return [];
  }
}

function compareFiles<T extends CoreFile<T>>(a: T, b: T): number {
  return a.name.localeCompare(b.name);
}
