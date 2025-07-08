/**
 * @import {FileInTree, PersonWithPermissions} from "./types"
 */

// @ts-ignore
import styles from './permissions.css' with { type: 'css' };
document.adoptedStyleSheets.push(styles);

import { treeIterator } from './tree-view.js';

/**
 * @param {FileInTree[]} files
 * @return {PersonWithPermissions[]}
 */
export function getPeopleWithPermissions(files) {
  const /** @type {Map<string, PersonWithPermissions>} */ peopleById = new Map();

  for (const file of treeIterator(files)) {
    for (const perm of file.permissions || []) {
      const /** @type {PersonWithPermissions} */ person = peopleById.get(perm.id) || {
          id: perm.id,
          isAnyoneWithLink: perm.id === 'anyoneWithLink',
          permissions: {},
          displayName: perm.displayName,
          emailAddress: perm.emailAddress,
        };

      peopleById.set(perm.id, person);

      if (!person.permissions[perm.role]) {
        person.permissions[perm.role] = new Set();
      }

      person.permissions[perm.role].add(file);
    }
  }

  const peopleArray = Array.from(peopleById.values());
  peopleArray.sort((a, b) => {
    const aAnyone = a.isAnyoneWithLink ? -1 : 0;
    const bAnyone = b.isAnyoneWithLink ? -1 : 0;
    if (aAnyone !== bAnyone) {
      return aAnyone - bAnyone;
    }

    return a.emailAddress.localeCompare(b.emailAddress);
  });
  return peopleArray;
}

/**
 * @param {PersonWithPermissions[]} people
 * @param {HTMLElement} el
 */
export function showPeople(people, el) {
  const block = document.createElement('div');
  block.classList.add('people-list');
  el.append(block);

  for (const person of people) {
    const personEl = document.createElement('div');
    personEl.classList.add('person');

    const emailEl = document.createElement('span');
    emailEl.textContent = person.isAnyoneWithLink ? 'Anyone with link' : person.emailAddress;
    // todo add click listener to span

    personEl.append(emailEl);

    for (const role of ['reader', 'writer', 'owner', 'commenter']) {
      const roleEl = document.createElement('span');
      roleEl.classList.add('role');
      personEl.append(roleEl);

      if (person.permissions[role]) {
        roleEl.textContent = role;
        // todo add click listener to roleEl
      }
    }

    block.append(personEl);
  }

  return block;
}
