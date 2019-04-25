/**
 * Copyright (C) 2018-2019 Linagora
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
  buttons: {
    openDialogDeleteWks: `${bsWksOverview} .btn-delete-wks`,
    addEditDescriptions: `${bsWksOverview} .btn-add-edit-descriptions`,
    cancelDescriptions: `${bsWksOverview} .btn-cancel-descriptions`,
    saveDescriptions: `${bsWksOverview} .btn-save-descriptions`,
  },
  formFields: {
    shortDescriptionFormField: `${bsWksOverview} .workspace-short-description-edit .short-description-form-field`,
    descriptionFormField: `${bsWksOverview} .workspace-description-edit .description-form-field`,
  },
  listGridItem: {
    gridItemBus: `${bsWksOverview} .bus-grid-item`,
  },
  messages: {
    nothingToPreview: `${bsWksOverview} workspace-description-edit div .msg-no-description`,
  },
  texts: {
    busNames: `${bsWksOverview} .bus-grid-item .bus-item .bus-link .bus-footer .bus-name`,
    shortDescription: `${bsWksOverview} .workspace-short-description .short-description .short-description-text`,
    description: `${bsWksOverview} .workspace-description .description .description-text`,
    descriptionPreview: `${bsWksOverview} .workspace-description-edit div .workspace-description-preview`,
  },
  textArea: {
    shortDescriptionTextarea: `${bsWksOverview} textarea.short-description-wks`,
    descriptionTextarea: `${bsWksOverview} textarea.description-wks`,
  },
};
