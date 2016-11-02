import { makeTypedFactory, TypedRecord } from 'typed-immutable-record';

import { configFactory } from './shared-module/reducers/config.state';
import { userFactory } from './shared-module/reducers/user.state';
import { workspaceFactory } from './shared-module/reducers/workspace.state';
import { minimalWorkspacesFactory } from './shared-module/reducers/minimal-workspaces.state';
import { IStore } from './shared-module/interfaces/store.interface';

// only used here, so don't export
interface IStoreRecord extends TypedRecord<IStoreRecord>, IStore {};

export const storeFactory = makeTypedFactory<IStore, IStoreRecord>({
  config: configFactory(),
  user: userFactory(),
  minimalWorkspaces: minimalWorkspacesFactory(),
  workspace: workspaceFactory()
});
