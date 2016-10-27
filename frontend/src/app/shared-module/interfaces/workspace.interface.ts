// typed-record
import { TypedRecord } from 'typed-immutable-record';

// our interfaces
import { IBus } from './petals.interface';
import { IMinimalWorkspace } from './minimal-workspaces.interface';

// the current/selected workspace
export interface IWorkspace extends IMinimalWorkspace {
  // from server
  buses: Array<IBus>;
  busesInProgress: Array<IBus>;

  // for UI
  searchPetals: string;
  fetchingWorkspace: boolean;
  importingBus: boolean;
  gettingBusConfig: boolean;
}

export interface IWorkspaceRecord extends TypedRecord<IWorkspaceRecord>, IWorkspace { };
