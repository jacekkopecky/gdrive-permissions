/**
 * @import {FileInTree, PersonWithPermissions, Role} from "./types"
 */

// @ts-ignore
import styles from './permissions.css' with { type: 'css' };
document.adoptedStyleSheets.push(styles);

import { treeIterator } from './tree-view.js';

const ROLES = /** @type {const} */ (['reader', 'commenter', 'writer', 'owner']);
const ROLE_NAMES = /** @type {Record<Role, string>} */ {
  reader: 'reader',
  commenter: 'commenter',
  writer: 'editor',
  owner: 'owner',
};

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
          isAnyoneWithLink: perm.id.startsWith('anyone'),
          permissions: {},
          emailAddress: perm.emailAddress || perm.displayName || perm.id,
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
 * @param {HTMLElement} indicatorEl
 */
export function showPeople(people, el, indicatorEl) {
  const block = document.createElement('div');
  block.classList.add('people-list');
  el.append(block);

  for (const person of people) {
    const personEl = document.createElement('div');
    personEl.classList.add('person');

    const emailEl = document.createElement('span');
    emailEl.textContent = getDisplayName(person);
    if (person.isAnyoneWithLink) emailEl.classList.add('anyone');

    personEl.addEventListener('click', (e) => {
      const wasAlreadySelected =
        personEl.classList.contains('selected') && personEl.querySelector('.selected') == null;
      resetSelectedPerson();
      if (!wasAlreadySelected) showFilesByPerson(personEl, person);
      updatePersonIndicator(!wasAlreadySelected, person);
      e.stopPropagation();
    });

    personEl.append(emailEl);

    for (const role of ROLES) {
      const roleEl = document.createElement('span');
      roleEl.classList.add('role');
      personEl.append(roleEl);

      if (person.permissions[role]) {
        roleEl.textContent = ROLE_NAMES[role];
        const countEl = document.createElement('span');
        countEl.textContent = String(person.permissions[role].size);
        roleEl.append(countEl);

        roleEl.addEventListener('click', (e) => {
          const wasAlreadySelected = roleEl.classList.contains('selected');
          resetSelectedPerson();
          const roleToShow = wasAlreadySelected ? undefined : role;
          showFilesByPerson(personEl, person, roleToShow, roleEl);
          updatePersonIndicator(true, person, roleToShow);
          e.stopPropagation();
        });
      } else {
        roleEl.classList.add('disabled');
      }
    }

    block.append(personEl);
  }

  block.addEventListener('click', resetSelectedPerson);

  return block;

  function resetSelectedPerson() {
    for (const el of block.querySelectorAll('.selected')) {
      el.classList.remove('selected');
    }

    // call resetTreeVisibility() on the any file (the first in the first person's permissions)
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

  /**
   * @param {boolean | undefined} selected
   * @param {PersonWithPermissions} person
   * @param {ROLES[number]} [role]
   */
  function updatePersonIndicator(selected, person, role) {
    indicatorEl.classList.toggle('selected', selected);

    indicatorEl.textContent = ` for ${getDisplayName(person)}`;
    if (role) indicatorEl.textContent += ` (${ROLE_NAMES[role]})`;
  }
}

/**
 * @param {HTMLElement} personEl
 * @param {PersonWithPermissions} person
 * @param {Role | undefined} [selectedRole]
 * @param {HTMLElement} [roleEl]
 */
function showFilesByPerson(personEl, person, selectedRole, roleEl) {
  /** @type {Set<FileInTree>} */
  const allFiles = new Set();

  for (const role of selectedRole ? [selectedRole] : ROLES) {
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

    if (selectedRole && selectedRole !== 'owner') {
      file.currentPermission = file.permissions.find((p) => p.id === person.id);
    }

    file.showFile();
  }

  personEl.classList.add('selected');
  if (selectedRole) roleEl.classList.add('selected');
}

/**
 * @param {PersonWithPermissions} person
 */
function getDisplayName(person) {
  if (!person.isAnyoneWithLink) return person.emailAddress;
  return person.id === 'anyone' ? 'Public' : 'Anyone with the link';
}
