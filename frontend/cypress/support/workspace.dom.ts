/**
 * Copyright (C) 2018-2020 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// base selector
const bs = `app-workspace`;
const bsWksDeletionDiag = `app-workspace-deletion-dialog`;
const bsWksDeletedDiag = `app-workspace-deleted-dialog`;
const bsWksElement = `app-workspace-element`;
const bsWksOverview = `app-workspace-overview`;
const bsWksBusDetachDiag = `app-bus-detach-dialog`;
const bsWksBusImportDiag = `app-bus-import-dialog`;

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

export const WORKSPACE_DELETION_DIALOG_DOM = {
  buttons: {
    cancel: `${bsWksDeletionDiag} .btn-cancel-delete-wks`,
    submit: `${bsWksDeletionDiag} .btn-confirm-delete-wks`,
  },
  dialog: { dialogDeletionWks: `${bsWksDeletionDiag}` },
  texts: {
    infoTitle: `${bsWksDeletionDiag} .mat-dialog-title span span`,
    description: `${bsWksDeletionDiag} .mat-dialog-content p`,
  },
};

export const WORKSPACE_DELETED_DIALOG_DOM = {
  buttons: { ok: `${bsWksDeletedDiag} button` },
  dialog: { dialogDeletedWks: `${bsWksDeletedDiag}` },
  texts: {
    infoTitle: `${bsWksDeletedDiag} .mat-dialog-title span span`,
    description: `${bsWksDeletedDiag} .mat-dialog-content div p`,
  },
};

export const WORKSPACE_ELEMENT_DOM = {
  workspaceElement: {
    workspaceElementView: `${bsWksElement} .workspace-element`,
  },
};

export const WORKSPACE_OVERVIEW_DOM = {
  buttons: {
    openDialogDeleteWks: `${bsWksOverview} .btn-delete-wks`,
    addEditDescriptions: `${bsWksOverview} .btn-add-edit-descriptions`,
    cancelDescriptions: `${bsWksOverview} .btn-cancel-descriptions`,
    saveDescriptions: `${bsWksOverview} .btn-save-descriptions`,
    editDetachBus: `${bsWksOverview} .btn-detach-bus`,
    cancelDetachBus: `${bsWksOverview} .btn-cancel-detach-bus`,
    openDialogDetachBus: `${bsWksOverview} .btn-open-detach-bus-dialog`,
    editImportBus: `${bsWksOverview} .btn-import-bus`,
    cancelAttachBus: `${bsWksOverview} .btn-cancel-attach-bus`,
    importNewBus: `${bsWksOverview} .btn-import-new-bus`,
    addUserInWorkspace: `${bsWksOverview} .btn-add-user`,
  },
  formFields: {
    shortDescriptionFormField: `${bsWksOverview} .workspace-short-description-edit .short-description-form-field`,
    descriptionFormField: `${bsWksOverview} .workspace-description-edit .description-form-field`,

    ipFormField: `${bsWksOverview} .bus-import-edit .ip-form-field`,
    portFormField: `${bsWksOverview} .bus-import-edit .port-form-field`,
    usernameFormField: `${bsWksOverview} .bus-import-edit .username-form-field`,
    passwordFormField: `${bsWksOverview} .bus-import-edit .pwd-form-field`,
    passphraseFormField: `${bsWksOverview} .bus-import-edit .passphrase-form-field`,
  },
  inputs: {
    ip: `${bs} input[formcontrolname="ip"]`,
    port: `${bs} input[formcontrolname="port"]`,
    username: `${bs} input[formcontrolname="username"]`,
    password: `${bs} input[formcontrolname="password"]`,
    passphrase: `${bs} input[formcontrolname="passphrase"]`,
    userSearchCtrl: `${bsWksOverview} input[formcontrolname="userSearchCtrl"]`,
  },
  listGridItem: {
    itemBus: `${bsWksOverview} .bus-grid-item .bus-item .bus-link`,
    itemDetachBus: `${bsWksOverview} .bus-grid-item .bus-item .bus-detach`,
  },
  messages: {
    nothingToPreview: `${bsWksOverview} workspace-description-edit div .msg-no-description`,
    importBusDetailsError: `${bsWksOverview} .error-import-details`,
  },
  texts: {
    busNames: `${bsWksOverview} .bus-grid-item .bus-item .bus-link .bus-footer .bus-name`,
    busDetachNames: `${bsWksOverview} .bus-grid-item .bus-item .bus-detach .bus-footer .bus-name`,
    shortDescription: `${bsWksOverview} .workspace-short-description .short-description .short-description-text`,
    description: `${bsWksOverview} .workspace-description .description .description-text`,
    descriptionPreview: `${bsWksOverview} .workspace-description-edit div .workspace-description-preview`,
  },
  textArea: {
    shortDescriptionTextarea: `${bsWksOverview} textarea.short-description-wks`,
    descriptionTextarea: `${bsWksOverview} textarea.description-wks`,
  },
  table: {
    userTable: `${bsWksOverview} .users-table`,

    headerTable: `${bsWksOverview} .mat-header-cell`,

    rowUser: (userId: string) => `${bsWksOverview} .row-${userId}`,
    allRow: `${bsWksOverview} .table-row`,

    cellUserId: (userId: string) => `${bsWksOverview} .cell-userid-${userId}`,
    cellUserName: (userId: string) =>
      `${bsWksOverview} .cell-username-${userId}`,
    cellUserAdminWorkspace: (userId: string) =>
      `${bsWksOverview} .cell-user-admin-wks-${userId} .mat-checkbox-input`,
    cellUserDeployArtifact: (userId: string) =>
      `${bsWksOverview} .cell-user-deploy-artifact-${userId} .mat-checkbox-input`,
    cellUserLifecycleArtifact: (userId: string) =>
      `${bsWksOverview} .cell-user-lifecycle-artifact-${userId} .mat-checkbox-input`,
    cellUserActionDelete: (userId: string) =>
      `${bsWksOverview} .cell-user-action-${userId} .action-delete`,
  },
};

export const WORKSPACE_BUS_DETACH_DIALOG_DOM = {
  buttons: {
    cancel: `${bsWksBusDetachDiag} .btn-cancel-detach-bus-dialog`,
    submit: `${bsWksBusDetachDiag} .btn-confirm-detach-bus-dialog`,
  },
  dialog: { dialogDetachBus: `${bsWksBusDetachDiag}` },
  texts: {
    infoTitle: `${bsWksBusDetachDiag} .mat-dialog-title span span`,
    description: `${bsWksBusDetachDiag} .mat-dialog-content p`,
  },
};

export const WORKSPACE_BUS_IMPORT_DIALOG_DOM = {
  buttons: {
    cancel: `${bsWksBusImportDiag} .btn-cancel-import-bus-dialog`,
  },
  dialog: { dialogImportBus: `${bsWksBusImportDiag}` },
  texts: {
    infoTitle: `${bsWksBusImportDiag} .mat-dialog-title span span`,
  },
};
