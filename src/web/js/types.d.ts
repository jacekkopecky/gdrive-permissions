export type LoadedFile = {
  isLoaded: boolean;
  id: string;
  name: string;
  permissions: Permission[];
  isFolder: boolean;
  parent?: string;
};

export type FileInTree = LoadedFile & {
  children?: FileInTree[];
  parentFile?: FileInTree;
  element?: HTMLElement;
  resetTreeVisibility(hide = false): void;
  showFile(): void;
};

export type Role = 'reader' | 'writer' | 'owner' | 'commenter';

export type Permission = {
  id: string;
  role: Role;
  allowFileDiscovery?: boolean;
  emailAddress?: string;
  displayName?: string;
};

export type PersonWithPermissions = {
  id: string;
  isAnyoneWithLink: boolean;
  displayName?: string;
  emailAddress?: string;
  permissions: {
    reader?: Set<FileInTree>;
    writer?: Set<FileInTree>;
    owner?: Set<FileInTree>;
    commenter?: Set<FileInTree>;
  };
};
