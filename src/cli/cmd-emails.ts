import { readInfoAndPermFiles } from '../lib/gdrive-files.js';

export default async function listEmails(): Promise<void> {
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
      ` ${''.padStart(numLength, '-')} "anyone with the link" - ${Array.from(anyoneRoles)
        .sort()
        .join(', ')}`
    );
  }
}
