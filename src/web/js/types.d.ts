export type LoadedFile = {
  isLoaded: boolean;
  id: string;
  name: string;
  permissions: unknown[];
  isFolder: boolean;
  parent?: string;
};

export type FileInTree = LoadedFile & {
  children?: FileInTree[];
};
