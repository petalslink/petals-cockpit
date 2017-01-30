import { IUsers } from '../../../../../shared/interfaces/users.interface';
import { IBuses } from '../buses/buses.interface';
import { IWorkspacesCommon } from './workspaces.interface';

interface IWorkspaceCommon {
  // from server
  id: string;
  name: string;

  // when a bus is in import
  isImporting: true;
  importIp?: string;
  importPort?: number;
  importUsername?: string;
  importError?: string;
}

// used within table
export interface IWorkspaceRow extends IWorkspaceCommon {
  buses: Array<string>;
  // this workspace is also used by the following users
  users: Array<string>;
}

// used in generated views
// we import IWorkspacesCommon here because when creating a view from a selector
// we'll inject those properties for the current workspace
export interface IWorkspace extends IWorkspaceCommon, IWorkspacesCommon {
  buses: IBuses;
  users: IUsers;
}
