// base selector
const bs = `app-administration`;
const bsAddEditUser = `app-add-edit-user`;
const bsAddLdapUser = `app-add-ldap-user`;

export const ADMINISTRATION_DOM = {
  texts: { title: `${bs} mat-toolbar .title` },
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
  texts: { matError: `${bsAddEditUser} mat-error` },
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
    ldapUsers: `${bsAddLdapUser} .option-ldap-user-content`,
    ldapUserNames: `.ldap-user-name`,
    ldapUserIds: `.ldap-user-id`,
    matError: `${bsAddLdapUser} mat-error`,
  },
};
