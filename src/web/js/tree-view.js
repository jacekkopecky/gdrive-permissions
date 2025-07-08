/**
 * @import {FileInTree} from "./types"
 */

// @ts-ignore
import styles from './tree-view.css' with { type: 'css' };
document.adoptedStyleSheets.push(styles);

/**
 * @param {FileInTree[]} tree
 * @param {HTMLElement} el
 */
export function showTree(tree, el, expand = false) {
  const ul = document.createElement('ul');
  ul.classList.add('tree-view');
  el.append(ul);

  for (const file of tree) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = file.name;
    li.append(span);
    li.classList.toggle('collapsed', !expand);
    li.classList.toggle('folder', file.isFolder);
    li.addEventListener('click', toggleCollapse);

    ul.append(li);

    if (file.children?.length) {
      showTree(file.children, li);
    }
  }

  return ul;
}

/**
 * @param {MouseEvent} e
 */
function toggleCollapse(e) {
  /** @type {HTMLElement} */ (e.currentTarget).classList.toggle('collapsed');
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

/**
 * @param {FileInTree[]} loadedFiles
 * @returns {FileInTree[]}
 */
export function makeTree(loadedFiles) {
  /** @type {FileInTree[]} */
  const tree = [];
  const idToFileMap = new Map();

  for (const file of loadedFiles) {
    if (idToFileMap.has(file.id)) {
      console.warn('ignoring file with duplicate id', file);
      continue;
    }

    idToFileMap.set(file.id, file);
    if (file.isFolder) file.children = [];

    if (file.parent) {
      const parent = idToFileMap.get(file.parent);
      if (!parent) {
        console.warn('ignoring file with unknown parent', file);
        continue;
      }

      parent.children.push(file);
    } else {
      tree.push(file);
    }
  }

  sortFiles(tree);

  return tree;
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
