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

import { CONFIRM_DIALOG_DOM } from '../../../support/confirm-modal.dom';
import { expectedDefaultUserDetailsList } from '../../../support/helper.const';
import { MENU_DOM } from '../../../support/menu.dom';
import { WORKSPACE_OVERVIEW_DOM } from '../../../support/workspace.dom';

describe('Users', () => {
  beforeEach(() => {
    cy.visit(`/login`);
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy.expectWorkspacesListMenuToBe(['Workspace 0', 'Workspace 1']);

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 1`)
      .click();

    cy.expectLocationToBe('/workspaces/idWks1');

    cy.expectBusListToBe([`Bus 1`]);
  });

  it('should have user list', () => {
    // expect to have 6 columns
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.userTable)
      .find('th')
      .should('have.length', 6);

    // expect to have headers in good order
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.texts.headerTable)
      .each((_, index) => cy.contains(expectedHeadersTable[index]));

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.rows.allRow)
      .should('have.length', expectedDefaultUserDetailsList.length);

    // expect to have 6 users present in the list
    expectedDefaultUserDetailsList.forEach(user => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userId(user.id))
        .should('contain', user.id);
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userName(user.id))
        .should('contain', user.name);
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace(user.id))
        .should(user.adminWorkspace ? 'be.checked' : 'not.be.checked');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact(user.id))
        .should(user.deployArtifact ? 'be.checked' : 'not.be.checked');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(user.id))
        .should(user.lifecycleArtifact ? 'be.checked' : 'not.be.checked');
    });
  });

  it('should add workspace user from cockpit users', () => {
    const userToAdd = 'cdeneux';

    // userToAdd should not exist in the table
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.rows.userRow(userToAdd))
      .should('not.exist');

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.empty');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    cy.get(`mat-option .mat-option-text`).should('not.exist');

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .should('have.length', 1)
      .contains(userToAdd)
      .should('be.visible')
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl)
      .should('have.value', userToAdd);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('not.be.disabled')
      .click();

    // userToAdd should now exist in the table
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.rows.userRow(userToAdd))
      .should('exist');

    // by default, the user added has no permissions
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace(userToAdd))
      .should('not.be.checked');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact(userToAdd))
      .should('not.be.checked');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(userToAdd))
      .should('not.be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.empty');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');

    // expect to have 7 users present in the list

    expectedFullUserDetailsList.forEach(user => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userId(user.id))
        .should('contain', user.id);
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userName(user.id))
        .should('contain', user.name);
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace(user.id))
        .should(user.adminWorkspace ? 'be.checked' : 'not.be.checked');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact(user.id))
        .should(user.deployArtifact ? 'be.checked' : 'not.be.checked');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(user.id))
        .should(user.lifecycleArtifact ? 'be.checked' : 'not.be.checked');
    });

    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .should('have.length', 0);
  });

  it('should not be possible to add a non-existent cockpit user', () => {
    const userToAdd = 'toto';

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.empty');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl)
      .click()
      .type(userToAdd)
      .blur();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.addUserFormField)
      .should('have.class', 'ng-invalid');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');
  });

  it('should remove workspace user from workspace users', () => {
    const userToDelete = 'bescudie';

    // user to delete should exist in the table
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.rows.userRow(userToDelete))
      .should('exist');

    // user to delete can not be added
    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .should('not.contain', userToDelete);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userActionDelete(userToDelete))
      .click({ force: true });

    // user to delete should not exist in the table
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.rows.userRow(userToDelete))
      .should('not.exist');

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.empty');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');

    cy.get(`mat-option .mat-option-text`).should('not.exist');

    // user to delete can be added
    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .contains(userToDelete)
      .should('be.visible');
  });

  it('should update candidate list members', () => {
    const candidateMemberDefault = 'cdeneux';
    const candidateListIdsMemberAfterDelete = ['cdeneux', 'bescudie'];
    const candidateMemberAfterAdd = 'bescudie';
    const userToDelete = 'bescudie';
    const userToAdd = 'cdeneux';

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).click();
    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .should('have.length', 1)
      .contains(candidateMemberDefault);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userActionDelete(userToDelete))
      .click({ force: true });

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).click();
    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .should('have.length', 2)
      .each((_, index) =>
        cy.contains(candidateListIdsMemberAfterDelete[index])
      );

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).click();
    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .contains(userToAdd)
      .should('be.visible')
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl)
      .should('have.value', userToAdd);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('not.be.disabled')
      .click();

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).click();
    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.candidateListIds)
      .should('have.length', 1)
      .contains(candidateMemberAfterAdd);
  });

  it('should leave a workspace', () => {
    const currentUser = 'admin';

    // user to delete should exist in the table
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.rows.userRow(currentUser))
      .should('exist');

    // should not be last member
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.rows.allRow)
      .should('have.length.gt', 1);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
      .should('not.be.disabled')
      .click({ force: true });

    cy
      .get(CONFIRM_DIALOG_DOM.text.title)
      .should('be.visible')
      .contains('Leave this workspace?');

    cy
      .get(CONFIRM_DIALOG_DOM.text.message)
      .should('be.visible')
      .and(
        'contain',
        'You will no longer be member of this workspace.\nYou will be redirected to the workspaces selection page.'
      );

    cy.get(CONFIRM_DIALOG_DOM.buttons.confirm).click();

    cy.url().should('include', 'workspaces?page=list');
  });

  it('should not leave a workspace if last member', () => {
    // change workspace
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy.expectWorkspacesListMenuToBe(['Workspace 0', 'Workspace 1']);

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 0`)
      .click();

    cy.expectLocationToBe('/workspaces/idWks0');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
      .should('not.exist');
  });

  it('should not be possible to leave workspace if current user is last admin remaining', () => {
    // check leave button behaviour if delete user
    cy.get(WORKSPACE_OVERVIEW_DOM.table.userTable).scrollIntoView();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('adminldap'))
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
      .should('be.enabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userActionDelete('adminldap'))
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
      .should('be.disabled');

    // check leave button behaviour if update user
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('bescudie'))
      .should('not.be.checked')
      .parent()
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('bescudie'))
      .should('be.checked');

    // Current user leave workspace should be still disabled if change is not save.
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.enabled')
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
      .should('be.enabled');
  });

  it('should edit and update workspace users permissions from workspace users', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.table.userTable).scrollIntoView();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    // should change permission
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact('mrobert'))
      .should('be.checked')
      .click({
        force: true,
      })
      .should('not.be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.enabled');

    // should put the same permission than the store
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact('mrobert'))
      .should('not.be.checked')
      .click({
        force: true,
      })
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    // should change multiple permissions
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('vnoel'))
      .should('not.be.checked')
      .click({
        force: true,
      })
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact('cchevalier'))
      .should('be.checked')
      .click({
        force: true,
      })
      .should('not.be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact('bescudie'))
      .should('not.be.checked')
      .click({
        force: true,
      })
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.enabled')
      .click();

    // should keep changed permissions after saving
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact('mrobert'))
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('vnoel'))
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact('cchevalier'))
      .should('not.be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact('bescudie'))
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    cy.get(MENU_DOM.buttons.toggleMenu).click();

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 0`)
      .click();

    cy.expectLocationToBe('/workspaces/idWks0');

    cy.get(MENU_DOM.buttons.toggleMenu).click();

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 1`)
      .click();

    cy.expectLocationToBe('/workspaces/idWks1');

    // expect that a permission checkbox have the new store value unchanged
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact('bescudie'))
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');
  });

  it('should have a 409 conflict error when trying to remove the last adminWorkspace permission', () => {
    cy.get(MENU_DOM.buttons.toggleMenu).click();

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 0`)
      .click();

    cy.expectLocationToBe('/workspaces/idWks0');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('admin'))
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('admin'))
      .click({ force: true })
      .should('not.be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.enabled')
      .click();

    cy.expectNotification(
      'error',
      'admin permissions update failed',
      `Error backend`
    );

    // should have adminWorkspace permission unchanged
    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('admin'))
      .should('be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');
  });

  const expectedFullUserDetailsList = [
    {
      id: 'admin',
      name: 'Administrator',
      adminWorkspace: true,
      deployArtifact: true,
      lifecycleArtifact: true,
    },
    {
      id: 'adminldap',
      name: 'Administrator LDAP',
      adminWorkspace: true,
      deployArtifact: true,
      lifecycleArtifact: true,
    },
    {
      id: 'bescudie',
      name: 'Bertrand ESCUDIE',
      adminWorkspace: false,
      deployArtifact: false,
      lifecycleArtifact: false,
    },
    {
      id: 'cchevalier',
      name: 'Christophe CHEVALIER',
      adminWorkspace: false,
      deployArtifact: true,
      lifecycleArtifact: false,
    },
    {
      id: 'mrobert',
      name: 'Maxime ROBERT',
      adminWorkspace: false,
      deployArtifact: true,
      lifecycleArtifact: true,
    },
    {
      id: 'vnoel',
      name: 'Victor NOEL',
      adminWorkspace: false,
      deployArtifact: false,
      lifecycleArtifact: true,
    },
    {
      id: 'cdeneux',
      name: 'Christophe DENEUX',
      adminWorkspace: false,
      deployArtifact: false,
      lifecycleArtifact: false,
    },
  ];

  const expectedHeadersTable = [
    'Name',
    'Id',
    'Admin Workspace',
    'Deploy Artifact',
    'Lifecycle Artifact',
    'Action',
  ];
});
