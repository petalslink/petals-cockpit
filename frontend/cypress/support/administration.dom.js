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
