// immutable
import { makeTypedFactory } from 'typed-immutable-record';

// our interfaces
import { IMinimalWorkspaces, IMinimalWorkspacesRecord } from '../interfaces/minimal-workspaces.interface';

export const minimalWorkspacesFactory = makeTypedFactory<IMinimalWorkspaces, IMinimalWorkspacesRecord>({
  // from server
  minimalWorkspaces: [],

  // for UI
  fetchingWorkspaces: false
});
