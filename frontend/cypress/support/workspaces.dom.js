// base selector
const bs = `app-workspaces`;
const bsList = `app-workspaces-list`;
const bsWksDeletionDiag = `app-workspace-deletion-dialog`;
const bsWksDeletedDiag = `app-workspace-deleted-dialog`;

export const WORKSPACES_LIST_DOM = {
  inputs: { name: `${bsList} input[formcontrolname="name"]` },
  texts: {
    infoAddWorkspace: `${bsList} .info-add-workspace span`,
    workspaceName: `${bsList} .workspace-name`,
  },
  buttons: {
    addWorkspace: `${bsList} .btn-add-workspace`,
    selectWorkspace: `${bsList} .info-workspace`,
  },
  listWorkspaces: `${bsList} .info-workspaces`,
};

export const WORKSPACES_DOM = {
  dialogWorkspacesList: { workspacesList: `${bs} .dialog-workspaces-list` },
};

export const WORKSPACE_DELETION_DIALOG_DOM = {
  texts: {
    infoTitle: `${bsWksDeletionDiag} .mat-dialog-title span span`,
    description: `${bsWksDeletionDiag} .mat-dialog-content p`,
  },
  buttons: {
    cancel: `${bsWksDeletionDiag} .btn-cancel-delete-wks`,
    submit: `${bsWksDeletionDiag} .btn-confirm-delete-wks`,
  },
  dialog: { dialogDeletionWks: `${bsWksDeletionDiag}` },
};

export const WORKSPACE_DELETED_DIALOG_DOM = {
  texts: {
    infoTitle: `${bsWksDeletedDiag} .mat-dialog-title span span`,
    description: `${bsWksDeletedDiag} .mat-dialog-content div p`,
  },
  buttons: { ok: `${bsWksDeletedDiag} button` },
  dialog: { dialogDeletedWks: `${bsWksDeletedDiag}` },
};
