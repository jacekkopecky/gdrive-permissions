import { makeHierarchy, readInfoAndPermFiles } from '../lib/gdrive-files.js';
import { printHierarchy } from '../lib/print-hierarchy.js';
import { InfoFile, isPermissionRole, PermissionRole, PermissionRolesArray } from '../lib/types.js';

interface FindArgs {
  params?: string[];
}

export default async function findFilesWithPermissions({
  params,
}: FindArgs): Promise<void | number> {
  const { emailOrAnyone, role } = parseParams(params);
  if (!emailOrAnyone) {
    return -1;
  }

  const files = await readInfoAndPermFiles();
  if (files.length === 0) {
    console.log('no files found, you may need to run list-files.sh first');
    return;
  }

  annotateMatches(files, emailOrAnyone, role);

  const hierarchy = makeHierarchy(files, { onlyMatching: true });
  printHierarchy(hierarchy);
}

function parseParams(params: string[] = []) {
  if (params.length > 2 || params.length === 0) {
    console.error('Error: too many arguments (1 or 2 expected).');
    return {};
  }

  let emailOrAnyone: string | undefined;
  let role: PermissionRole | undefined;
  for (const param of params) {
    if (param.includes('@') || param === 'anyone') {
      if (emailOrAnyone) {
        console.error(
          `Error: two emails or "anyone" found: ${emailOrAnyone} and ${param}. Only one allowed.`
        );
        return {};
      }
      emailOrAnyone = param;
    } else if (isPermissionRole(param)) {
      if (role) {
        console.error(`Error: two roles found: ${role} and ${param}. Only one allowed.`);
        return {};
      }
      role = param;
    } else {
      console.error(`Unrecognized role ${param}. Known roles: ${PermissionRolesArray.join(', ')}.`);
      return {};
    }
  }
  if (!emailOrAnyone) {
    console.error(
      'Error: provide either one email, or the word "anyone" to look for permissions for anyone with the link.'
    );
    return {};
  }

  return { emailOrAnyone, role };
}

function annotateMatches(files: InfoFile[], emailOrAnyone: string, role?: PermissionRole): void {
  for (const file of files) {
    const permission =
      emailOrAnyone === 'anyone'
        ? file.permissions?.find((p) => p.type === 'anyone')
        : file.permissions?.find((p) => p.email === emailOrAnyone);
    if (permission && (!role || permission.role === role)) {
      file.name = `(${permission.role}) ${file.name}                         ID:${file.id}`;
      file.matching = true;
    }
  }
}
