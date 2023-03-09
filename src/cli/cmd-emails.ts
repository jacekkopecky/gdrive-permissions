import { readInfoAndPermFiles } from '../lib/gdrive-files.js';
import { PermissionRolesArray } from '../lib/types.js';

interface EmailsArgs {
  role?: string;
  'group-by-role'?: string;
}

export default async function listEmails(args: EmailsArgs): Promise<void | number> {
  if (args.role && args['group-by-role']) {
    console.error('Error: specify a role or -g, not both at the same time.');
    return -1;
  }

  if (args.role && !PermissionRolesArray.includes(args.role)) {
    const knownRoles = PermissionRolesArray.join(', ');
    console.error(`Error: unknown role "${args.role}". Supported roles are ${knownRoles}.`);
    return -1;
  }

  const files = await readInfoAndPermFiles();

  if (files.length === 0) {
    console.log('no files found, you may need to run list-files.sh first');
    return;
  }

  const emails = new Map<string, Set<string>>();
  const anyoneRoles = new Set<string>();
  for (const file of files) {
    if (file.permissions) {
      for (const perm of file.permissions) {
        if (perm.email) {
          const roles = emails.get(perm.email) ?? new Set();
          roles.add(perm.role);
          emails.set(perm.email, roles);
        } else if (perm.type === 'anyone') {
          anyoneRoles.add(perm.role);
        } else {
          console.error(`bad permission in file ${file.id}:`, perm);
        }
      }
    }
  }

  if (args.role) {
    printForRole(emails, anyoneRoles, args.role);
  } else if (args['group-by-role']) {
    for (const role of PermissionRolesArray) {
      printForRole(emails, anyoneRoles, role);
      console.log();
    }
  } else {
    printAllEmailsAndRoles(emails, anyoneRoles);
  }
}

function printForRole(emails: Map<string, Set<string>>, anyoneRoles: Set<string>, role: string) {
  const emailsArr = Array.from(emails.entries())
    .filter(([, roles]) => roles.has(role))
    .map(([email]) => email)
    .sort();
  const numLength = String(emailsArr.length).length + 1;

  if (emailsArr.length > 0) {
    console.log(`Emails who are "${role}" on some files:`);

    for (let i = 0; i < emailsArr.length; i++) {
      const email = emailsArr[i];
      console.log(`${String(i + 1).padStart(numLength)}. ${email}`);
    }
  } else {
    console.log(`No emails found with role ${role}`);
  }

  if (anyoneRoles.has(role)) {
    console.log(` ${'-'.repeat(numLength)} "anyone with the link" has role ${role}`);
  }
}

function printAllEmailsAndRoles(emails: Map<string, Set<string>>, anyoneRoles: Set<string>) {
  const numLength = String(emails.size).length + 1;
  if (emails.size > 0) {
    console.log('Emails with permissions to some files:');

    const emailsArr = Array.from(emails.keys()).sort();
    for (let i = 0; i < emailsArr.length; i++) {
      const email = emailsArr[i];
      const roles = Array.from(emails.get(email) ?? ['ERROR']).sort();
      console.log(`${String(i + 1).padStart(numLength)}. ${email} - ${roles.join(', ')}`);
    }
  } else {
    console.log('No emails found (not even owners?)');
  }

  if (anyoneRoles.size > 0) {
    console.log(
      ` ${'-'.repeat(numLength)} "anyone with the link" - ${Array.from(anyoneRoles)
        .sort()
        .join(', ')}`
    );
  }
}
