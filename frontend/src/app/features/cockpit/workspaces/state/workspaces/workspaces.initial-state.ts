import { IWorkspacesTable } from './workspaces.interface';

export function workspacesTableFactory(): IWorkspacesTable {
  return {
    selectedWorkspaceId: '',

    isAddingWorkspace: false,
    isFetchingWorkspaces: false,
    fetchingWorkspaceWithId: '',
    searchPetals: '',

    byId: {},
    allIds: []
  };
}
