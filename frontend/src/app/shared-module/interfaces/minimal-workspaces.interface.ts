// our interfaces
import { TypedRecord } from 'typed-immutable-record';

// a minimal workspace contains only the basic information of a workspace
// until the user select a workspace and we fetch the other information of this workspace
export interface IMinimalWorkspace {
  // from server
  id: string;
  name: string;
  usedBy: string;
}

export interface IMinimalWorkspaceRecord extends TypedRecord<IMinimalWorkspaceRecord>, IMinimalWorkspace { };

// the list of minimal workspaces
export interface IMinimalWorkspaces {
  // from server
  minimalWorkspaces: Array<IMinimalWorkspace>;

  // for UI
  fetchingWorkspaces: boolean;
}

export interface IMinimalWorkspacesRecord extends TypedRecord<IMinimalWorkspacesRecord>, IMinimalWorkspaces { };
