/**
 * @import {FileInTree, PersonWithPermissions} from "./types"
 */

// @ts-ignore
import styles from './permissions.css' with { type: 'css' };
document.adoptedStyleSheets.push(styles);

import { treeIterator } from './tree-view.js';

const ROLES = /** @type {const} */ (['reader', 'commenter', 'writer', 'owner']);

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
    if (person.isAnyoneWithLink) emailEl.classList.add('anyone');

    personEl.addEventListener('click', () => {
      const wasAlreadySelected = personEl.classList.contains('selected');
      resetSelectedPerson();
      if (!wasAlreadySelected) showFilesByPerson(personEl, person);
    });

    personEl.append(emailEl);

    for (const role of ROLES) {
      const roleEl = document.createElement('span');
      roleEl.classList.add('role');
      personEl.append(roleEl);

      if (person.permissions[role]) {
        roleEl.textContent = role;
        const countEl = document.createElement('span');
        countEl.textContent = String(person.permissions[role].size);
        roleEl.append(countEl);
        // todo add click listener to roleEl
      } else {
        roleEl.classList.add('disabled');
      }
    }

    block.append(personEl);
  }

  return block;

  function resetSelectedPerson() {
    for (const el of block.children) {
      el.classList.remove('selected');
    }

    (
      people[0].permissions.commenter ||
      people[0].permissions.owner ||
      people[0].permissions.reader ||
      people[0].permissions.writer
    )
      ?.values()
      .next()
      .value?.resetTreeVisibility();
  }
}

/**
 * @param {HTMLElement} personEl
 * @param {PersonWithPermissions} person
 */
function showFilesByPerson(personEl, person) {
  /** @type {Set<FileInTree>} */
  const allFiles = new Set();

  for (const role of ROLES) {
    if (person.permissions[role]) {
      person.permissions[role].forEach((f) => allFiles.add(f));
    }
  }

  let resetDone = false;

  for (const file of allFiles) {
    if (!resetDone) {
      file.resetTreeVisibility(true);
      resetDone = true;
    }

    file.showFile();
  }

  personEl.classList.add('selected');
}
