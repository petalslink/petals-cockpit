// base selector
const bs = `app-workspace`;
const bsWksElement = `app-workspace-element`;
const bsWksOverview = `app-workspace-overview`;

export const WORKSPACE_DOM = {
  buttons: {
    workspaceName: `${bs} .btn-workspace-name`,
    changeWorkspace: `${bs} .btn-change-workspace`,
  },
  menu: { workspaceMenu: `${bs} .workspace-menu` },
  tabs: `${bs} .mat-tab-label`,
  sidenav: {
    workspaceSidenav: `${bs} .mat-sidenav-container .workspace-sidenav`,
  },
};

export const WORKSPACE_ELEMENT_DOM = {
  workspaceElement: {
    workspaceElementView: `${bsWksElement} .workspace-element`,
  },
};

export const WORKSPACE_OVERVIEW_DOM = {
  buttons: { openDialogDeleteWks: `${bsWksOverview} .btn-delete-wks` },
};
