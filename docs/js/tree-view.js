/**
 * @import {FileInTree, LoadedFile} from "./types"
 */

import { deletePermission } from './loading-gdrive-files.js';

// @ts-ignore
import styles from './tree-view.css' with { type: 'css' };
document.adoptedStyleSheets.push(styles);

/**
 * @param {FileInTree[]} tree
 * @param {HTMLElement} el
 */
export function showTree(tree, el, expand = true) {
  const ul = document.createElement('ul');
  ul.classList.add('tree-view');
  el.append(ul);

  for (const file of tree) {
    const li = document.createElement('li');
    const nameEl = document.createElement('span');
    nameEl.classList.add('name');

    const span = document.createElement('span');
    span.textContent = file.name;
    nameEl.append(span);

    li.append(nameEl);
    li.classList.toggle('collapsed', !expand);
    li.classList.toggle('folder', file.isFolder);
    span.addEventListener('click', (e) => toggleCollapse(e, li));

    const link = document.createElement('a');
    link.target = '_blank';
    link.href = file.isFolder
      ? `https://drive.google.com/drive/folders/${file.id}`
      : `https://drive.google.com/file/d/${file.id}/view`;
    link.textContent = file.isFolder ? 'open folder' : 'open document';
    nameEl.append(link);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete');
    deleteBtn.textContent = 'revoke';
    deleteBtn.addEventListener('click', async () => {
      if (file.currentPermission && !file.currentPermission.deleted) {
        try {
          await deletePermission({ fileId: file.id, permissionId: file.currentPermission.id });
          file.currentPermission.deleted = true;
          doShowFile(file);
        } catch (e) {
          console.warn('error deleting', e);
          const btnDelete = file.element.querySelector(/** @type {"button"} */ ('.delete'));
          btnDelete.disabled = true;
          btnDelete.textContent = 'error, reload and authenticate please';
        }
      }
    });
    nameEl.append(deleteBtn);

    ul.append(li);
    file.element = li;

    if (file.children?.length) {
      showTree(file.children, li);
    }
  }

  return ul;
}

/**
 * @param {MouseEvent} e
 * @param {HTMLElement} itemEl
 */
function toggleCollapse(e, itemEl) {
  itemEl.classList.toggle('collapsed');
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

/**
 * @param {LoadedFile[]} loadedFiles
 * @returns {FileInTree[]}
 */
export function makeTree(loadedFiles) {
  /** @type {FileInTree[]} */
  const tree = [];
  /** @type {Map<string, FileInTree>} */
  const idToFileMap = new Map();

  for (const file of loadedFiles) {
    if (idToFileMap.has(file.id)) {
      console.warn('ignoring file with duplicate id', file);
      continue;
    }

    /** @type {FileInTree} */
    const treeItem = { ...file, resetTreeVisibility, showFile };

    idToFileMap.set(file.id, treeItem);
    if (file.isFolder) treeItem.children = [];

    if (file.parent) {
      const parentFile = idToFileMap.get(file.parent);
      if (!parentFile) {
        console.warn('ignoring file with unknown parent', file);
        continue;
      }

      parentFile.children.push(treeItem);
      treeItem.parentFile = parentFile;
    } else {
      tree.push(treeItem);
    }
  }

  sortFiles(tree);

  return tree;

  function resetTreeVisibility(hide = false) {
    for (const file of treeIterator(tree)) {
      file.currentPermission = undefined;
      doShowFile(file, hide);
    }
  }

  /**
   * @this {FileInTree}
   */
  function showFile() {
    doShowFile(this);
    doShowParent(this.parentFile);
  }
}

/**
 * @param {FileInTree} file
 */
function doShowFile(file, hide = false) {
  const el = file.element;
  if (!el) return;

  el.classList.toggle('hidden', hide);
  el.classList.toggle('visible-for-children', false);
  el.classList.toggle('deletable', Boolean(file.currentPermission) && !hide);
  el.classList.toggle('deleted', Boolean(file.currentPermission?.deleted));
}

/**
 * @param {FileInTree | undefined} file
 */
function doShowParent(file) {
  // if the parent is hidden, change it to visible-for-children
  if (!file) return;

  if (file.element?.classList.contains('hidden')) {
    file.element?.classList.toggle('hidden', false);
    file.element?.classList.toggle('visible-for-children', true);
  }

  doShowParent(file.parentFile);
}

/**
 * @param {FileInTree[]} files
 */
function sortFiles(files) {
  files.sort((a, b) => {
    const aFolder = a.isFolder ? -1 : 0;
    const bFolder = b.isFolder ? -1 : 0;
    if (aFolder !== bFolder) {
      return aFolder - bFolder;
    }

    return a.name.localeCompare(b.name);
  });

  for (const file of files) {
    if (file.children) sortFiles(file.children);
  }
}

/**
 * @param {FileInTree[]} files
 * @return {Generator<FileInTree>}
 */
export function* treeIterator(files) {
  if (!files) return;
  for (const file of files) {
    yield file;
    yield* treeIterator(file.children);
  }
}
