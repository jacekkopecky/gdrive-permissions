export interface ReadFileOptions {
  lowercasePropertyNames?: boolean;
}

export interface CoreFile<T extends CoreFile<T>> {
  id: string;
  name: string;
  created: string;
  parent?: string;
  children?: T[];
  matching?: boolean;
}

function isCoreFile<T extends CoreFile<T>>(record: Partial<CoreFile<T>>): record is CoreFile<T> {
  return Boolean(record.id && record.name && record.created);
}

const FileTypes = ['folder', 'regular', 'document'] as const;

export interface File extends CoreFile<File> {
  type: (typeof FileTypes)[number];
  size: string;
}

export function isFile(record: Partial<File>): record is File {
  return (
    record.size != null &&
    record.type != null &&
    FileTypes.includes(record.type) &&
    isCoreFile(record)
  );
}

export interface InfoFile extends CoreFile<InfoFile> {
  mime: string;
  size?: string;
  modified: string;
  md5?: string;
  shared: string;
  parents?: string;
  viewurl: string;
  permissions?: Permission[];
}

export function isInfoFile(record: Partial<InfoFile>): record is InfoFile {
  return (
    record.mime != null &&
    record.modified != null &&
    record.shared != null &&
    record.viewurl != null &&
    isCoreFile(record)
  );
}

export const PermissionRoles = ['owner', 'writer', 'commenter', 'reader'] as const;
export const PermissionRolesArray: readonly string[] = PermissionRoles;
export type PermissionRole = (typeof PermissionRoles)[number];

export function isPermissionRole(val: unknown): val is PermissionRole {
  if (typeof val !== 'string') return false;
  return PermissionRolesArray.includes(val);
}

const PermissionTypes = ['user', 'anyone'] as const;
export const PermissionTypesArray: readonly string[] = PermissionTypes;
export type PermissionType = (typeof PermissionTypes)[number];

export function isPermissionType(val: unknown): val is PermissionType {
  if (typeof val !== 'string') return false;
  return PermissionTypesArray.includes(val);
}

export interface Permission {
  id: string;
  type: PermissionType;
  role: PermissionRole;
  email: string;
  domain: string;
  discoverable: string;
}

export function isPermission(record: Partial<Permission>): record is Permission {
  if (record.email === '' && record.type !== 'anyone') {
    console.warn('Warning: empty email but not "anyone"', record);
  }
  return (
    record.id != null &&
    isPermissionType(record.type) &&
    isPermissionRole(record.role) &&
    record.email != null &&
    record.domain != null &&
    record.discoverable != null
  );
}

export function isPermissions(arr: Partial<Permission>[]): arr is Permission[] {
  return arr.every((item) => isPermission(item));
}
