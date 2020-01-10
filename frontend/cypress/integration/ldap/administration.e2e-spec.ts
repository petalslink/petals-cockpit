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

import {
  ADD_EDIT_USER_DOM,
  ADD_LDAP_USER_DOM,
  ADMINISTRATION_DOM,
  EDIT_ADMIN_DIALOG_DOM,
} from '../../support/administration.dom';
import { MENU_DOM } from '../../support/menu.dom';
import { MESSAGE_DOM } from '../../support/message.dom';
import { PETALS_COCKPIT_DOM } from '../../support/petals-cockpit.dom';

describe(`Administration`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  describe(`For admin`, () => {
    beforeEach(() => {
      cy.login('admin', 'admin');

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();
    });

    it(`should open the administration page`, () => {
      cy.expectLocationToBe(`/admin`);

      // check if the name of page is displayed in toolbar
      cy
        .get(`mat-toolbar`)
        .find(ADMINISTRATION_DOM.texts.title)
        .should('contain', 'Administration')
        .and('be.visible');

      cy.expectUsersListToBe(expectedUsersIds, expectedUsersNames);

      cy.expectMessageToBe(
        MESSAGE_DOM.texts.msgDetails,
        'info',
        'As an administrator, you can ADD, EDIT, and DELETE any user.'
      );
    });

    it(`should navigate to the workspaces page from the menu administration`, () => {
      cy.expectLocationToBe(`/admin`);

      // open menu
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      // check that no workspaces names in the menu administration
      cy.get(MENU_DOM.links.itemsWksNames).should('not.be.visible');

      cy
        .get(`.menu-item-create-wks`)
        .find(MENU_DOM.texts.itemNameCreateWks)
        .should('contain', `Create New Workspace`)
        .and('be.visible');

      cy
        .get(`.menu-item-back-wks-list`)
        .find(MENU_DOM.texts.itemNameWksList)
        .should('contain', `Back to Workspaces`)
        .and('be.visible')
        .click();

      cy.expectLocationToBe(`/workspaces`);
      cy.url().should('include', '?page=list');

      cy.get(MENU_DOM.buttons.toggleMenu).should('not.be.visible');
      cy.get(MENU_DOM.links.goToWksList).should('not.be.visible');
      cy.get(MENU_DOM.links.goToCreateWks).should('not.be.visible');

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();

      cy.expectLocationToBe(`/admin`);

      // open menu
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy
        .get(`.menu-item-back-wks-list`)
        .find(MENU_DOM.texts.itemNameWksList)
        .should('contain', `Back to Workspaces`)
        .and('be.visible');

      cy
        .get(`.menu-item-create-wks`)
        .find(MENU_DOM.texts.itemNameCreateWks)
        .should('contain', `Create New Workspace`)
        .and('be.visible')
        .click();

      cy.expectLocationToBe(`/workspaces`);
      cy.url().should('include', '?page=create');
    });

    it(`should open and close add a new user with always empty form fieds`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.visible')
        .should('be.empty')
        .not('.required');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      // should reset add form user
      cy
        .get(ADMINISTRATION_DOM.expPanel.expPanelAddUser)
        .click()
        .click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('be.empty');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.empty');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty');
    });

    it(`should close and clear on cancel`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .type('Username');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .type('Name')
        .clear();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .type('Password');

      cy
        .get(ADD_EDIT_USER_DOM.texts.matError)
        .contains('Required')
        .should('have.class', 'mat-error');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('not.be.visible');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('be.empty')
        .and('be.visible');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.empty')
        .and('be.visible');
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');
    });

    it(`should open and close edit user with always empty form fieds`, () => {
      // open edit bescudie
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('bescudie')
        .click();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Bertrand ESCUDIE')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .should('contain', 'Cancel')
        .and('be.enabled')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .should('contain', 'Delete')
        .and('be.enabled')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('contain', 'Save')
        .and('be.disabled')
        .and('be.visible');

      // clean form fields
      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .clear();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .clear();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled')
        .and('be.visible');

      // the previous panel should have been closed
      // open edit admin
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('admin')
        .click();

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('not.be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Administrator')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.cancelBtn)
        .should('contain', 'Cancel')
        .and('be.enabled')
        .and('be.visible');

      // the current user can't delete itself
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .should('contain', 'Delete')
        .and('be.disabled')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('contain', 'Save')
        .and('be.disabled')
        .and('be.visible');

      // the previous panel should have been closed
      // open edit bescudie
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('bescudie')
        .click();

      // should have the same starting information that was already saved
      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Bertrand ESCUDIE')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-bescudie`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');
    });

    it(`should add a user`, () => {
      cy.get(`.exp-pnl-add-user`).should('not.have.class', 'mat-expanded');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy.get(`.exp-pnl-add-user`).should('have.class', 'mat-expanded');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .type('alagane');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .type('Alexandre LAGANE');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .type('This is awesome');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.enabled')
        .click();

      cy.get(`.exp-pnl-add-user`).should('not.have.class', 'mat-expanded');

      cy.expectUsersListToBe(
        expectedUsersIdsUpdated,
        expectedUsersNamesUpdated
      );
    });

    it(`should delete a user`, () => {
      // verify if add user view has not delete button
      cy.get(`.exp-pnl-add-user`).should('not.have.class', 'mat-expanded');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy.get(`.exp-pnl-add-user`).should('have.class', 'mat-expanded');

      cy.get(ADD_EDIT_USER_DOM.buttons.deleteBtn).should('not.be.visible');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      // delete a user
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('cchevalier')
        .click();

      cy.get(`.exp-pnl-user-cchevalier`).should('have.class', 'mat-expanded');

      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Christophe CHEVALIER')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.empty')
        .and('be.visible');

      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_EDIT_USER_DOM.buttons.deleteBtn)
        .should('exist')
        .click();

      cy.get(`.exp-pnl-user-alagane`).should('not.have.class', 'mat-expanded');

      cy.expectUsersListToBe(
        expectedUsersIdsAfterDelete,
        expectedUsersNamesAfterDelete
      );
    });

    it(`should not add an existing user`, () => {
      cy.get(`.exp-pnl-add-user`).should('not.have.class', 'mat-expanded');

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy.get(`.exp-pnl-add-user`).should('have.class', 'mat-expanded');

      // add an existing user
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .type('admin');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.texts.matError)
        .contains('User already exists!');

      // clear validator
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .clear()
        .type('Gregoire');

      // add an existing user with different case
      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.inputs.username)
        .clear()
        .type('aDmIn');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      cy
        .get(`.exp-pnl-add-user`)
        .find(ADD_EDIT_USER_DOM.texts.matError)
        .contains('User already exists!');
    });

    it(`should edit a user`, () => {
      // open edit vnoel
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('vnoel')
        .click();

      cy.get(`.exp-pnl-user-vnoel`).should('have.class', 'mat-expanded');

      // verify if submit button is disabled if no change
      cy
        .get(`.exp-pnl-user-vnoel`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.disabled');

      // change name
      cy
        .get(`.exp-pnl-user-vnoel`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('have.value', 'Victor NOEL')
        .clear()
        .type('Victor NONO');

      cy
        .get(`.exp-pnl-user-vnoel`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .click();

      cy.get(`.exp-pnl-user-vnoel`).should('not.have.class', 'mat-expanded');

      cy
        .get(ADMINISTRATION_DOM.panel.panelListUsers)
        .find(`.exp-pnl-user-vnoel`)
        .should('contain', 'Victor NONO');
    });

    it(`should change an admin`, () => {
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('cchevalier')
        .click();
      cy.get(`.exp-pnl-user-cchevalier`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('not.be.checked')
        .click();
      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.visible')
        .click();
      cy.logout();

      cy.login('cchevalier', 'cchevalier');

      cy
        .get(PETALS_COCKPIT_DOM.buttons.goToAdminPage)
        .should('be.visible')
        .click();

      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('admin')
        .click();
      cy.get(`.exp-pnl-user-admin`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('not.be.checked')
        .click();
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.visible')
        .click();
      cy.logout();

      cy.login('admin', 'admin');
      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).should('not.be.visible');
    });

    it(`should change my admin role`, () => {
      // disabled if there is only 1 admin remaining
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('adminldap')
        .click();

      cy.get(`.exp-pnl-user-adminldap`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .click();
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('not.have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.visible')
        .click();

      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('admin')
        .click();

      cy.get(`.exp-pnl-user-admin`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('have.class', 'mat-disabled');

      // change own role admin and redirect
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('adminldap')
        .click();

      cy.get(`.exp-pnl-user-adminldap`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('not.have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .click()
        .should('have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.visible')
        .click();

      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('admin')
        .click();

      cy.get(`.exp-pnl-user-admin`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .click()
        .should('not.have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.visible')
        .click();

      cy
        .get(EDIT_ADMIN_DIALOG_DOM.text.message)
        .should('be.visible')
        .contains(
          'You will no longer be admin.\nYou will be redirected to the workspaces selection page.'
        );
      cy.get(EDIT_ADMIN_DIALOG_DOM.buttons.remove).click();

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).should('not.be.visible');
      cy.url().should('include', 'workspaces?page=list');
    });

    it(`should close and clear on cancel admin dialog`, () => {
      cy
        .get(ADD_EDIT_USER_DOM.texts.titleUserIds)
        .contains('admin')
        .click();
      cy.get(`.exp-pnl-user-admin`).should('have.class', 'mat-expanded');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('be.visible');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('be.visible');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .should('have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.isAdmin)
        .click()
        .should('not.have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.buttons.submitBtn)
        .should('be.visible')
        .click();

      cy
        .get(EDIT_ADMIN_DIALOG_DOM.text.message)
        .should('be.visible')
        .contains(
          'You will no longer be admin.\nYou will be redirected to the workspaces selection page.'
        );
      cy.get(EDIT_ADMIN_DIALOG_DOM.buttons.cancel).click();

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.name)
        .should('not.be.visible');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_EDIT_USER_DOM.inputs.password)
        .should('not.be.visible');
    });
  });

  describe(`For adminldap`, () => {
    beforeEach(() => {
      cy.login('adminldap', 'adminldap');

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();
    });

    it(`should open the administration page`, () => {
      cy.expectLocationToBe(`/admin`);

      // check if the name of page is displayed in toolbar
      cy
        .get(`mat-toolbar`)
        .find(ADMINISTRATION_DOM.texts.title)
        .should('contain', 'Administration')
        .and('be.visible');

      cy.expectUsersListToBe(expectedUsersIds, expectedUsersNames);

      cy.expectMessageToBe(
        MESSAGE_DOM.texts.msgDetails,
        'info',
        'As an administrator, you can ADD and DELETE users from LDAP.'
      );
    });

    it(`should open add ldap user with always empty search`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.visible')
        .should('be.empty')
        .not('.required');
    });

    it(`should display required message when search is cleared`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`Yoann`)
        .clear();

      cy
        .get(ADD_LDAP_USER_DOM.texts.matError)
        .contains('Required')
        .should('have.class', 'mat-error');

      cy.get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl).type(`Yoann`);

      // we make sure that when we change the page and we come back on it, we clean the store correctly
      cy.get(PETALS_COCKPIT_DOM.buttons.goToProfilePage).click();

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .click();

      cy.get(ADD_LDAP_USER_DOM.texts.ldapUserIds).should('have.length', 0);

      cy.get(ADD_LDAP_USER_DOM.texts.ldapUserNames).should('have.length', 0);
    });

    it(`should display filtered list according to search string`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`e`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('7 users are matching this search.')
        .should('be.visible');

      cy.expectLdapSearchUsersListToBe(
        expected7LdapUsersNames,
        expected7LdapUsersIds
      );

      // Add a wait of  300ms to have a debounceTime at each new entrance
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`r`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('3 users are matching this search.')
        .should('be.visible');

      cy.expectLdapSearchUsersListToBe(
        expected3LdapUsersNames,
        expected3LdapUsersIds
      );

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`a`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('There is no user found.')
        .should('be.visible');

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .clear()
        .should('be.empty');

      cy
        .get(ADD_LDAP_USER_DOM.texts.matError)
        .contains('Required')
        .should('have.class', 'mat-error');

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`ert`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('1 user is matching this search.')
        .should('be.visible');

      cy.expectLdapSearchUsersListToBe(['Yoann HOUPERT'], ['yhoupert']);

      cy.get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl).not('.required');
    });

    it(`should apply highlight class when search found`, () => {
      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      // search user highlight id
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`alagane`)
        .wait(300);

      cy.expectLdapSearchUsersListToBe(['Alexandre LAGANE'], ['alagane']);

      cy.expectHighlightedUserIdToBe([`alagane`]).should('have.class', 'bold');

      // search user highlight name
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .clear()
        .should('be.empty');
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`Alexandre`)
        .wait(300);

      cy.expectLdapSearchUsersListToBe(['Alexandre LAGANE'], ['alagane']);

      cy
        .expectHighlightedUserNameToBe([`Alexandre`])
        .should('have.class', 'bold');

      // search user highlight name and id
      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .clear()
        .should('be.empty');

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .type(`aL`)
        .wait(300);

      cy.expectLdapSearchUsersListToBe(
        ['Alexandre LAGANE', 'Albin VIGIER'],
        ['alagane', 'avigier']
      );

      cy
        .expectHighlightedUserNameToBe([`Al`, `Al`])
        .should('have.class', 'bold');

      cy.get(`.ldap-user-id .bold`).should('contain', 'al');

      cy
        .get(`.ldap-user-id`)
        .contains('avigier')
        .should('not.have.class', 'bold');
    });

    it(`should add ldap user when item is selected`, () => {
      cy.expectLdapUsersListToBe(expectedUsersIds, expectedUsersNames);

      cy.get(ADMINISTRATION_DOM.expPanel.expPanelAddUser).click();

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`alexandre`)
        .wait(300);

      cy
        .expectLdapSearchUsersListToBe(['Alexandre LAGANE'], ['alagane'])
        .click();

      cy.expectLdapUsersListToBe(
        expectedUsersIdsUpdated,
        expectedUsersNamesUpdated
      );

      cy
        .get(ADD_LDAP_USER_DOM.inputs.userSearchCtrl)
        .should('be.empty')
        .type(`alexandre`)
        .wait(300);

      cy
        .get(`.msg-option`)
        .contains('There is no user found.')
        .should('be.visible');
    });

    it(`should delete ldap user`, () => {
      cy
        .get(ADMINISTRATION_DOM.texts.titleUserIds)
        .contains('cchevalier')
        .should('be.visible')
        .click();
      cy.get(`.exp-pnl-user-cchevalier`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_LDAP_USER_DOM.buttons.deleteBtn)
        .click();
      cy
        .get(ADMINISTRATION_DOM.texts.titleUserIds)
        .contains('cchevalier')
        .should('not.be.visible');
    });

    it('should change an admin', () => {
      cy.logout();
      cy.login('cchevalier', 'cchevalier');

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).should('not.be.visible');
      cy.logout();

      cy.login('adminldap', 'adminldap');
      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();

      cy
        .get(ADMINISTRATION_DOM.panel.panelListUsers)
        .contains('cchevalier')
        .click();

      cy.get(`.exp-pnl-user-cchevalier`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('not.have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .click();
      cy
        .get(`.exp-pnl-user-cchevalier`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('have.class', 'mat-checked');
      cy.logout();

      cy.login('cchevalier', 'cchevalier');
      cy
        .get(PETALS_COCKPIT_DOM.buttons.goToAdminPage)
        .should('be.visible')
        .click();
    });

    it(`should change my admin role`, () => {
      cy
        .get(ADMINISTRATION_DOM.texts.titleUserIds)
        .contains('admin')
        .click();
      cy.get(`.exp-pnl-user-admin`).should('have.class', 'mat-expanded');

      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .click();
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('not.have.class', 'mat-checked');

      cy
        .get(ADMINISTRATION_DOM.texts.titleUserIds)
        .contains('adminldap')
        .click();

      cy.get(`.exp-pnl-user-adminldap`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('have.class', 'mat-disabled');

      // change own role admin and redirect
      cy
        .get(ADMINISTRATION_DOM.texts.titleUserIds)
        .contains('admin')
        .click();

      cy.get(`.exp-pnl-user-admin`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('not.have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-admin`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .click()
        .should('have.class', 'mat-checked');

      cy
        .get(ADMINISTRATION_DOM.texts.titleUserIds)
        .contains('adminldap')
        .click();

      cy.get(`.exp-pnl-user-adminldap`).should('have.class', 'mat-expanded');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .click()
        .should('not.have.class', 'mat-checked');

      cy
        .get(EDIT_ADMIN_DIALOG_DOM.text.message)
        .should('be.visible')
        .contains(
          'You will no longer be admin.\nYou will be redirected to the workspaces selection page.'
        );
      cy.get(EDIT_ADMIN_DIALOG_DOM.buttons.remove).click();

      cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).should('not.be.visible');
      cy.url().should('include', 'workspaces?page=list');
    });

    it(`should close and clear on cancel admin dialog`, () => {
      cy
        .get(ADMINISTRATION_DOM.texts.titleUserIds)
        .contains('adminldap')
        .click();
      cy.get(`.exp-pnl-user-adminldap`).should('have.class', 'mat-expanded');

      cy
        .get(ADMINISTRATION_DOM.texts.userId)
        .contains('adminldap')
        .should('be.visible');
      cy
        .get(ADMINISTRATION_DOM.texts.userName)
        .contains('Administrator LDAP')
        .should('be.visible');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('have.class', 'mat-checked');
      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .click()
        .should('not.have.class', 'mat-checked');

      cy
        .get(EDIT_ADMIN_DIALOG_DOM.text.message)
        .should('be.visible')
        .contains(
          'You will no longer be admin.\nYou will be redirected to the workspaces selection page.'
        );
      cy.get(EDIT_ADMIN_DIALOG_DOM.buttons.cancel).click();

      cy
        .get(`.exp-pnl-user-adminldap`)
        .find(ADD_LDAP_USER_DOM.buttons.adminBtn)
        .should('have.class', 'mat-checked');
    });
  });

  it(`should not be visible to non-admin`, () => {
    cy.login('vnoel', 'vnoel');

    cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).should('not.be.visible');
  });

  it(`should show a warning to non-admin`, () => {
    cy.visit(`/admin`).login('vnoel', 'vnoel');

    cy.expectMessageToBe(
      MESSAGE_DOM.texts.msgDetails,
      'warning',
      'You are not an administrator.'
    );
  });

  // list of users already added
  const expectedUsersIds = [
    'admin',
    'adminldap',
    'bescudie',
    'cchevalier',
    'cdeneux',
    'mrobert',
    'vnoel',
  ];

  const expectedUsersNames = [
    'Administrator',
    'Administrator LDAP',
    'Bertrand ESCUDIE',
    'Christophe CHEVALIER',
    'Christophe DENEUX',
    'Maxime ROBERT',
    'Victor NOEL',
  ];

  // new list after user deleted
  const expectedUsersIdsAfterDelete = [
    'admin',
    'adminldap',
    'bescudie',
    'cdeneux',
    'mrobert',
    'vnoel',
  ];

  const expectedUsersNamesAfterDelete = [
    'Administrator',
    'Administrator LDAP',
    'Bertrand ESCUDIE',
    'Christophe DENEUX',
    'Maxime ROBERT',
    'Victor NOEL',
  ];

  // new list of users added
  const expectedUsersIdsUpdated = [
    'admin',
    'adminldap',
    'alagane',
    'bescudie',
    'cchevalier',
    'cdeneux',
    'mrobert',
    'vnoel',
  ];

  const expectedUsersNamesUpdated = [
    'Administrator',
    'Administrator LDAP',
    'Alexandre LAGANE',
    'Bertrand ESCUDIE',
    'Christophe CHEVALIER',
    'Christophe DENEUX',
    'Maxime ROBERT',
    'Victor NOEL',
  ];

  // list ids of users ldap
  const expected7LdapUsersIds = [
    'alagane',
    'psouquet',
    'vzurczak',
    'sgarcia',
    'jcabannes',
    'avigier',
    'yhoupert',
  ];

  const expected3LdapUsersIds = ['psouquet', 'avigier', 'yhoupert'];

  // list names of users ldap
  const expected7LdapUsersNames = [
    'Alexandre LAGANE',
    'Pierre SOUQUET',
    'Vincent ZURCZAK',
    'Sébastien GARCIA',
    'Jordy CABANNES',
    'Albin VIGIER',
    'Yoann HOUPERT',
  ];

  const expected3LdapUsersNames = [
    'Pierre SOUQUET',
    'Albin VIGIER',
    'Yoann HOUPERT',
  ];
});
