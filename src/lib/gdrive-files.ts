/**
 * This module keeps track of the files in .gdrive-permissions.
 */

import fs from 'fs/promises';
import path from 'path';
import { readColFile } from './read-col-file.js';
import { readLineFile } from './read-line-file.js';

const FILES_DIR = '.gdrive-permissions';
const LS_FILE_RE = /(?:^|\/)ls-(.*)\.dir$/;
const INFO_FILE_RE = /(?:^|\/)info-(.*)\.txt$/;

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
        console.warn('skipping file record due to bad structure', record);
      }
    }
  }
  return retval;
}

/**
 * Read all the info-*.txt files and return an array of the file/folder information contained there.
 */
export async function readInfoFiles(): Promise<InfoFile[]> {
  const retval: InfoFile[] = [];
  const fileNames = await listFiles(INFO_FILE_RE);
  for (const fileName of fileNames) {
    const record = await readLineFile(fileName);
    const id = fileName.match(INFO_FILE_RE)?.[1];
    if (isInfoFile(record)) {
      retval.push(record);
      record.parent = record.parents;
      if (id !== record.id) {
        console.warn(`file ID inside doesn't match filename: ${fileName} `);
      }
    } else {
      console.warn('skipping file record due to bad structure', record);
    }
  }
  return retval;
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
        console.warn(`missing parent ${file.parent} of file ${file.id}`);
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
  const files = await fs.readdir(FILES_DIR);
  return files.filter((name) => pattern.test(name)).map((name) => path.join(FILES_DIR, name));
}

export interface CoreFile<T extends CoreFile<T>> {
  id: string;
  name: string;
  created: string;
  parent?: string;
  children?: T[];
}

function isCoreFile<T extends CoreFile<T>>(
  record: Record<string, unknown>
): record is CoreFile<T> & Record<string, unknown> {
  return 'id' in record && 'name' in record && 'created' in record;
}

export interface File extends CoreFile<File> {
  type: 'folder' | 'regular' | 'document';
  size: string;
}

function isFile(record: Record<string, string>): record is File & Record<string, string> {
  return (
    isCoreFile(record) &&
    'type' in record &&
    'size' in record &&
    ['folder', 'regular', 'document'].includes(record.type)
  );
}

export interface InfoFile extends CoreFile<InfoFile> {
  mime: string;
  size?: string;
  modified: string;
  md5?: string;
  shared: string;
  parents?: string;
  viewurl: string;
}

function isInfoFile(record: Record<string, string>): record is InfoFile & Record<string, string> {
  return (
    isCoreFile(record) &&
    'mime' in record &&
    'modified' in record &&
    'shared' in record &&
    'viewurl' in record
  );
}

function compareFiles<T extends CoreFile<T>>(a: T, b: T): number {
  return a.name.localeCompare(b.name);
}
