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

import { PETALS_COCKPIT_DOM } from '../../support/petals-cockpit.dom';
import { WORKSPACE_DOM } from '../../support/workspace.dom';
import {
  WORKSPACE_DELETED_DIALOG_DOM,
  WORKSPACE_DELETION_DIALOG_DOM,
  WORKSPACES_CREATE_DOM,
  WORKSPACES_DOM,
  WORKSPACES_LIST_DOM,
} from '../../support/workspaces.dom';

describe(`Workspaces`, () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
  });

  it(`should have empty fields by default in Workspaces - Create New Workspace`, () => {
    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();
    cy.get(WORKSPACES_DOM.buttons.goToCreateWorkspace).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.get(WORKSPACES_CREATE_DOM.inputs.name).should('be.empty');
    cy.get(WORKSPACES_CREATE_DOM.textArea.shortDescription).should('be.empty');
    cy.get(WORKSPACES_CREATE_DOM.buttons.addWorkspace).should('be.disabled');
  });

  it(`should update the title and info message in the different views of /workspaces`, () => {
    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy.get(WORKSPACES_DOM.texts.titleSelectWks).should('be.visible');
    cy.get(WORKSPACES_DOM.texts.titleCreateWks).should('not.be.visible');
    cy.get(WORKSPACES_DOM.texts.infoCreateWks).should('not.be.visible');
    cy
      .get(WORKSPACES_DOM.texts.infoWksList)
      .should('contain', `You have access to several workspaces`);

    cy.get(WORKSPACES_DOM.buttons.goToCreateWorkspace).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.get(WORKSPACES_DOM.texts.infoWksList).should('not.be.visible');
    cy.get(WORKSPACES_DOM.texts.titleSelectWks).should('not.be.visible');
    cy.get(WORKSPACES_DOM.texts.titleCreateWks).should('be.visible');
    cy
      .get(WORKSPACES_DOM.texts.infoCreateWks)
      .should('contain', `You must create a workspace to work`);
  });

  it(`should create a new workspace and then delete it`, () => {
    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.expectWorkspacesListToBe(expectedWorkspacesListDetails);

    cy.get(WORKSPACES_DOM.buttons.goToCreateWorkspace).click();

    cy.get(WORKSPACES_CREATE_DOM.inputs.name).expectFocused();

    cy.addWorkspace('Workspace 2');

    cy.expectLocationToBe('/workspaces/idWks2');

    cy.get(PETALS_COCKPIT_DOM.buttons.goToWksList).click();

    cy.expectWorkspacesListToBe(expectedNewWorkspacesListDetails);

    // check if Administrator is only member of the new workspace
    cy
      .get(WORKSPACES_LIST_DOM.icons.iconUsers)
      .eq(2)
      .parent()
      .trigger('mouseenter');

    cy
      .get('mat-tooltip-component > .members-tooltip')
      .should('contain', 'Member: Administrator.');

    cy
      .get(WORKSPACES_LIST_DOM.icons.iconUsers)
      .first()
      .parent()
      .trigger('mouseleave');

    cy.get('mat-tooltip-component > .members-tooltip').should('not.be.visible');

    // check the total number of members for the new workspace
    cy
      .get(WORKSPACES_LIST_DOM.icons.iconBadge)
      .eq(2)
      .should('contain', 1);

    cy
      .get(WORKSPACES_LIST_DOM.texts.workspaceName)
      .contains(`Workspace 2`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks2`);

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 2`);

    cy.openDialogToDeleteWks();

    cy
      .get(WORKSPACE_DELETION_DIALOG_DOM.texts.infoTitle)
      .contains(`Delete workspace?`);

    cy.expectDialogDeletionWksDescriptionToBe([
      `Everything in the workspace will be deleted! Please, be certain.`,
      `Are you sure you want to delete Workspace 2?`,
    ]);

    // cancel the dialog
    cy.deleteWks(false);

    cy.openDialogToDeleteWks();

    // delete the workspace
    cy.deleteWks();

    cy
      .get(WORKSPACE_DELETED_DIALOG_DOM.texts.infoTitle)
      .contains(`Workspace deleted!`);

    cy
      .get(WORKSPACE_DELETED_DIALOG_DOM.texts.description)
      .contains(
        `This workspace was deleted, click on OK to go back to the workspaces list.`
      );

    cy.get(WORKSPACE_DELETED_DIALOG_DOM.buttons.ok).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav).should('not.be.visible');

    cy.expectWorkspacesListToBe(expectedWorkspacesListDetails);
  });

  it('should failed the create of new workspace and then be successful', () => {
    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.get(WORKSPACES_DOM.buttons.goToCreateWorkspace).click();

    // check the add workspace form and return http error message
    cy.addWorkspaceAndExpectToFail(
      'Error backend',
      `ADD_WKS_HTTP_ERROR_BACKEND`
    );

    cy.expectLocationToBe(`/workspaces`);

    cy
      .get(WORKSPACES_CREATE_DOM.inputs.name)
      .should('have.value', 'ADD_WKS_HTTP_ERROR_BACKEND')
      .and('not.be.disabled')
      .clear()
      .type('New Workspace');

    cy
      .get(WORKSPACES_CREATE_DOM.textArea.shortDescription)
      .should('not.be.disabled')
      .and('be.empty');

    cy
      .get(WORKSPACES_CREATE_DOM.buttons.addWorkspace)
      .should('not.be.disabled')
      .click();

    cy.expectLocationToBe(`/workspaces`);
  });

  it('should display message when there is only one workspace in the list', () => {
    cy.expectLocationToBe('/workspaces/idWks0');

    cy.openDialogToDeleteWks();

    cy.deleteWks();

    cy.get(WORKSPACE_DELETED_DIALOG_DOM.buttons.ok).click();

    cy
      .get(WORKSPACES_DOM.texts.infoWksList)
      .should('contain', `You have only access to this workspace`);

    cy.expectWorkspacesListToBe([`Workspace 1`, `No description provided.`]);
  });

  it('should display empty list message when there are no workspaces', () => {
    cy.expectLocationToBe('/workspaces/idWks0');

    cy.openDialogToDeleteWks();

    cy.deleteWks();

    cy.get(WORKSPACE_DELETED_DIALOG_DOM.buttons.ok).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.get(WORKSPACES_DOM.texts.infoNoWks).should('not.be.visible');

    // select the last workspace present on the list
    cy
      .get(WORKSPACES_LIST_DOM.listItem.itemWorkspaces)
      .eq(0)
      .click();

    cy.expectLocationToBe('/workspaces/idWks1');

    cy.openDialogToDeleteWks();

    cy.deleteWks();

    cy.get(WORKSPACE_DELETED_DIALOG_DOM.buttons.ok).click();

    cy.expectLocationToBe(`/workspaces`);

    cy
      .get(WORKSPACES_DOM.texts.infoNoWks)
      .should('contain', 'You have no access to any workspaces')
      .and('be.visible');
  });

  it('should display all names members for each workspace', () => {
    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy
      .get(WORKSPACES_LIST_DOM.icons.iconUsers)
      .first()
      .parent()
      .trigger('mouseenter');

    // check if the word member is written in singular when we have only one member
    cy
      .get('mat-tooltip-component > .members-tooltip')
      .should('contain', 'Member: Administrator.');

    cy
      .get(WORKSPACES_LIST_DOM.icons.iconUsers)
      .first()
      .parent()
      .trigger('mouseleave');

    cy.get('mat-tooltip-component > .members-tooltip').should('not.be.visible');

    cy
      .get(WORKSPACES_LIST_DOM.icons.iconUsers)
      .eq(1)
      .parent()
      .trigger('mouseenter');

    // check if the word member is written in plurals when we have severals members
    cy
      .get('mat-tooltip-component > .members-tooltip')
      .should(
        'contain',
        'Members: Administrator, Administrator LDAP, Bertrand ESCUDIE, Maxime ROBERT, Christophe CHEVALIER, Victor NOEL.'
      );

    cy
      .get(WORKSPACES_LIST_DOM.icons.iconUsers)
      .eq(1)
      .parent()
      .trigger('mouseleave');
  });

  it('should display the total number of members for each workspace', () => {
    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    // check the total number of members for the fisrt workspace
    cy
      .get(WORKSPACES_LIST_DOM.icons.iconBadge)
      .first()
      .should('contain', 1);

    // check the total number of members for the second workspace
    cy
      .get(WORKSPACES_LIST_DOM.icons.iconBadge)
      .eq(1)
      .should('contain', 6);
  });

  it(`should not reopen the workspace list after logout and re-login`, () => {
    cy.expectLocationToBe('/workspaces/idWks0');

    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.logout();

    cy.login('admin', 'admin');

    cy.expectLocationToBe('/workspaces/idWks0');
  });

  // ---------------------------- Default Workspaces List ---------------------------- //

  const expectedWorkspacesListDetails = [
    `Workspace 0`,
    `This is short description for the Workspace 0`,
    `Workspace 1`,
    `No description provided.`,
  ];

  // ---------------------------- New Workspaces List ---------------------------- //

  const expectedNewWorkspacesListDetails = [
    `Workspace 0`,
    `This is short description for the Workspace 0.`,
    `Workspace 1`,
    `No description provided.`,
    `Workspace 2`,
    `No description provided.`,
  ];
});
