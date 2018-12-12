/**
 * Copyright (C) 2018 Linagora
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
const bs = `app-administration`;
const bsAddEditUser = `app-add-edit-user`;
const bsAddLdapUser = `app-add-ldap-user`;

export const ADMINISTRATION_DOM = {
  texts: {
    title: `${bs} mat-toolbar .title`,
    titleUserIds: `${bs} .pnl-list-users mat-panel-title .user-id`,
    titleUserNames: `${bs} .pnl-list-users mat-panel-title .user-name`,
    userId: `${bs} mat-expansion-panel-content .user-id`,
    userName: `${bs} mat-expansion-panel-content .user-name`,
  },
  panel: {
    panelAddUser: `${bs} .pnl-add-user`,
    panelListUsers: `${bs} .pnl-list-users`,
  },
  expPanel: {
    expPanelAddUser: `${bs} .exp-pnl-add-user .mat-expansion-panel-header`,
    expPanelUser: `${bs} .exp-pnl-user .mat-expansion-panel-header`,
  },
};

export const ADD_EDIT_USER_DOM = {
  texts: {
    matError: `${bsAddEditUser} mat-error`,
    titleUserIds: `${bs} .pnl-list-users mat-panel-title .user-id`,
    titleUserNames: `${bs} .pnl-list-users mat-panel-title .user-name`,
  },
  inputs: {
    username: `${bsAddEditUser} input[formcontrolname="username"]`,
    name: `${bsAddEditUser} input[formcontrolname="name"]`,
    password: `${bsAddEditUser} input[formcontrolname="password"]`,
  },
  buttons: {
    cancelBtn: `${bsAddEditUser} .btn-cancel-form`,
    submitBtn: `${bsAddEditUser} .btn-add-user-form`,
    deleteBtn: `${bsAddEditUser} .btn-delete-form`,
  },
};

export const ADD_LDAP_USER_DOM = {
  inputs: {
    userSearchCtrl: `${bsAddLdapUser} input[formcontrolname="userSearchCtrl"]`,
  },
  texts: {
    ldapUsers: `.ldap-user`,
    ldapUserNames: `.ldap-user .ldap-user-name`,
    ldapUserIds: `.ldap-user .ldap-user-id`,
    matError: `${bsAddLdapUser} mat-error`,
  },
  buttons: { deleteBtn: `${bsAddLdapUser} .btn-delete-form` },
};
