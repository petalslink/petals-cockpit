// base selector
const bs = `app-workspace`;

export const WORKSPACE_DOM = {
  buttons: {
    workspaceName: `${bs} .workspace-name`,
    changeWorkspace: `${bs} .change-workspace`,
  },
  menu: { workspaceMenu: `${bs} .workspace-menu` },
  tabs: { tab: `${bs} .mat-tab-label` },
  sidenav: {
    workspaceSidenav: `${bs} .mat-sidenav-container .workspace-sidenav`,
  },
};
