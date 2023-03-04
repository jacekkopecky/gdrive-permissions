/**
 * This CLI tool helps you manage permissions in shared Google Drives.
 *
 * Use `gdrivep --help` for usage instructions.
 */

import { parseArgsAndRun } from './cli/cli.js';
await parseArgsAndRun();

// import archy from './lib/archy.js';
// import { makeHierarchy, readInfoFiles } from './lib/gdrive-files.js';
// import { CoreFile, InfoFile, PermissionRolesArray } from './lib/types.js';

// const ANYONE = 'anyone';

// interface Options {
//   email?: string;
//   role?: string;
// }

// async function main(opts: Options) {
//   const files = await readInfoFiles();
//   console.log(files.length, 'files');

//   annotateNoPermissions(files);

//   const hierarchy = makeHierarchy(files);
//   const filtered = filterMatchingChildren(hierarchy, matcherByOptions(opts));

//   printHierarchy(filtered);
// }

// await main(getCliOptions());

// function getCliOptions() {
//   const args = process.argv.slice(2);
//   const email = args.find((str) => str.includes('@') || str === ANYONE);
//   if (!email) throw new Error('need an email or "anyone"');
//   const role = args.find((str) => str != null && PermissionRolesArray.includes(str));
//   return { email, role };
// }

// function printHierarchy<T extends CoreFile<T>>(roots: T[]): void {
//   for (const root of roots) {
//     console.log(archy(root));
//   }
// }

// function annotateNoPermissions(files: InfoFile[]): void {
//   for (const file of files) {
//     if (file.permissions == null || file.permissions.length === 0) {
//       file.name += '  (🔴⚠️  NO PERMISSIONS)';
//     }
//   }
// }

// function filterMatchingChildren(
//   files: InfoFile[],
//   matcher: (file: InfoFile) => boolean
// ): InfoFile[] {
//   const retval = [];
//   for (const file of files) {
//     const fileMatches = matcher(file);
//     const childrenMatches = file.children && filterMatchingChildren(file.children, matcher);
//     if (fileMatches || childrenMatches?.length) {
//       retval.push({
//         ...file,
//         name: fileMatches ? file.name : '(only children match in:) ' + file.name,
//         children: childrenMatches,
//       });
//     }
//   }
//   return retval;
// }

// function matcherByOptions(opts: Options) {
//   console.log(
//     `matching files where ${opts.email || '"anyone with the link"'} has permission ${
//       opts.role ? `role ${opts.role}` : 'in any role'
//     }`
//   );

//   return (file: InfoFile): boolean => {
//     return (
//       file.permissions?.some(
//         (permission) =>
//           (opts.email === ANYONE ? permission.type === ANYONE : permission.email === opts.email) &&
//           (!opts.role || permission.role === opts.role)
//       ) || false
//     );
//   };
// }
