/**
 * Copyright (C) 2017-2020 Linagora
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
const bs = `app-workspaces`;
const bsCreate = `app-workspaces-create`;
const bsList = `app-workspaces-list`;

export const WORKSPACES_DOM = {
  buttons: {
    goToCreateWorkspace: `${bs} .btn-create-wks`,
    goBackToWorkspacesList: `${bs} .btn-back-wks-list`,
  },
  texts: {
    titleCreateWks: `${bs} .title-create-wks`,
    titleSelectWks: `${bs} .title-select-wks`,
    titleWksView: `${bs} .title-workspaces-view`,
    infoWksList: `${bs} .info-workspaces-list span`,
    infoCreateWks: `${bs} .info-create-wks`,
    infoNoWks: `${bs} .info-no-wks`,
  },
};

export const WORKSPACES_LIST_DOM = {
  icons: {
    iconBadge: `${bsList} .badge-users`,
    iconUsers: `${bsList} .icon-users`,
  },
  listItem: {
    itemWorkspaces: `${bsList} .workspaces-item`,
  },
  navList: {
    navListWorkspaces: `${bsList} .workspaces-list`,
  },
  texts: {
    infoAddWorkspace: `${bsList} .info-add-workspace span`,
    workspaceName: `${bsList} .workspaces-item .workspace-name`,
    workspaceShortDescription: `${bsList} .workspaces-item .workspace-short-description`,
  },
  tooltip: {
    membersTooltip: `${bsList} mat-tooltip-component > .primary-tooltip`,
  },
};

export const WORKSPACES_CREATE_DOM = {
  buttons: { addWorkspace: `${bsCreate} .btn-add-workspace` },
  inputs: {
    workspaceName: `${bsCreate} input[formcontrolname="workspaceName"]`,
  },
  messages: {
    error: {
      addWksFailed: `${bs} .error-create-wks-details`,
      workspaceName: `${bsCreate} .add-workspace-form-field .mat-error`,
    },
  },
  textArea: { shortDescription: `${bsCreate} textarea` },
};
