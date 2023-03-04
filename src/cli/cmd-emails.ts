import { readInfoAndPermFiles } from '../lib/gdrive-files.js';

export default async function listEmails(): Promise<void> {
  const files = await readInfoAndPermFiles();

  if (files.length === 0) {
    console.log('no files found, you may need to run list-files.sh first');
    return;
  }

  const emails = new Set<string>();
  let includesAnyone = false;
  for (const file of files) {
    if (file.permissions) {
      for (const perm of file.permissions) {
        if (perm.email) {
          emails.add(perm.email);
        } else if (perm.type === 'anyone') {
          includesAnyone = true;
        } else {
          console.error(`bad permission in file ${file.id}:`, perm);
        }
      }
    }
  }

  if (emails.size > 0) {
    console.log('Emails with permissions to some files:');

    const emailsArr = Array.from(emails).sort();
    const numLength = String(emailsArr.length).length + 1;
    for (let i = 0; i < emailsArr.length; i++) {
      const email = emailsArr[i];
      console.log(`${String(i + 1).padStart(numLength)}. ${email}`);
    }
  } else {
    console.log('No emails found (not even owners?)');
  }

  if (includesAnyone) {
    console.log('some files are accessible by anyone with the link');
  }
}
