import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { IWorkspaces } from '../interfaces/workspace.interface';

// the typeScript interface that defines the application state's properties
// this is to be imported wherever a reference to a user is used
// (reducers, components, services...)
export interface WorkspacesState extends IWorkspaces {};

// an Immutable.js Record implementation of the UserState interface.
// this only needs to be imported by reducers, since they produce new versions
// of the state
// components should only ever read the state, never change it,
// so they should only need the interface, not the record
export interface WorkspacesStateRecord extends TypedRecord<WorkspacesState>, WorkspacesState  {};

// an Immutable.js record factory for the record
export const workspacesStateFactory = makeTypedFactory<WorkspacesState, WorkspacesStateRecord>({
    workspaces: [
      {
        id: 0,
        name: 'Default workspace',
        buses: []
      }
    ]
});
