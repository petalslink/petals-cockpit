import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

// user
import { UserStateRecord, userStateFactory } from './shared-module/reducers/user.state';
import { ConfigStateRecord, configStateFactory } from './shared-module/reducers/config.state';
import { WorkspacesStateRecord, workspacesStateFactory } from './shared-module/reducers/workspaces.state';

// the typeScript interface that defines the application state's properties
// this is to be imported wherever a reference to the app state is used
// (reducers, components, services...)
export interface AppState {
  config: ConfigStateRecord;
  user: UserStateRecord;
  workspaces: WorkspacesStateRecord;
};

// an Immutable.js Record implementation of the AppState interface.
// this only needs to be imported by reducers, since they produce new versions
// of the state
// components should only ever read the state, never change it,
// so they should only need the interface, not the record
export interface AppStateRecord extends TypedRecord<AppStateRecord>, AppState {};

// an Immutable.js record factory for the record
export const appStateFactory = makeTypedFactory<AppState, AppStateRecord>({
  config: <ConfigStateRecord>configStateFactory(),
  user: <UserStateRecord>userStateFactory(),
  workspaces: <WorkspacesStateRecord>workspacesStateFactory()
});
