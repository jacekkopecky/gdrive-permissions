declare namespace gapi.client {
  export namespace drive {
    const permissions: {
      delete(opts: { fileId: string; permissionId: string }): Promise<unknown>;
    };
  }
}
