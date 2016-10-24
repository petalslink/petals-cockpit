// immutable
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

// our interfaces
import { IWorkspaces } from '../interfaces/workspace.interface';

// the typeScript interface that defines the application state's properties
// this is to be imported wherever a reference to a workspace is used
// (reducers, components, services...)
export interface WorkspacesState extends IWorkspaces {
  selectedWorkspaceId: string;
  searchPetals: string;
  fetchingWorkspaces: boolean;
  // importing bus is just here to block the import bus button during
  // the http request. It won't wait for sse
  importingBus: boolean;
  gettingBusConfig: boolean;
};

// an Immutable.js Record implementation of the WorkspacesState interface
// this only needs to be imported by reducers, since they produce new versions
// of the state
// components should only ever read the state, never change it,
// so they should only need the interface, not the record
export interface WorkspacesStateRecord extends TypedRecord<WorkspacesStateRecord>, WorkspacesState {};

// an Immutable.js record factory for the recowrd
export const workspacesStateFactory = makeTypedFactory<WorkspacesState, WorkspacesStateRecord>({
  selectedWorkspaceId: null,
  searchPetals: '',
  workspaces: null,
  fetchingWorkspaces: false,
  gettingBusConfig: false,
  importingBus: false
});
