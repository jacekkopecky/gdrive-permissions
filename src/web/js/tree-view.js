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
