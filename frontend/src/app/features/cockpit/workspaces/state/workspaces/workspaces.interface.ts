import { IWorkspaceRow, IWorkspace } from './workspace.interface';

export interface IWorkspacesCommon {
  selectedWorkspaceId: string;

  isAddingWorkspace: boolean;
  isFetchingWorkspaces: boolean;
  fetchingWorkspaceWithId: string;
  searchPetals: string;
}

export interface IWorkspacesTableOnly {
  byId: { [key: string]: IWorkspaceRow };
  allIds: Array<string>;
}

export interface IWorkspacesTable extends IWorkspacesCommon, IWorkspacesTableOnly { }

export interface IWorkspaces extends IWorkspacesCommon {
  list: Array<IWorkspace>;
}
