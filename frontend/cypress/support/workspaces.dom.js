// base selector
const bs = `app-workspaces`;
const bsList = `app-workspaces-list`;

export const WORKSPACES_LIST_DOM = {
  texts: {
    infoAddWorkspace: `${bsList} .info-add-workspace span`,
    workspaceName: `${bsList} .workspace-name`,
  },
  buttons: {
    addWorkspace: `${bsList} .btn-add-workspace`,
    selectWorkspace: `${bsList} .info-workspace`,
  },
  texts: { infoAddWorkspace: `${bs} .info-add-workspace span` },
  buttons: { btnAddWorkspace: `${bs} .btn-add-workspace` },
};

export const WORKSPACES_DOM = {
  dialogWorkspacesList: { workspacesList: `${bs} .dialog-workspaces-list` },
};

