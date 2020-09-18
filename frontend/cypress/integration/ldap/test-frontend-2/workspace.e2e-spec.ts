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

import { BREADCRUMB_DOM } from '../../../support/breadcrumb.dom';
import { HEADER_DOM } from '../../../support/header.dom';
import { expectedDefaultUserDetailsList } from '../../../support/helper.const';
import { MENU_DOM } from '../../../support/menu.dom';
import { WORKSPACE_OVERVIEW_DOM } from '../../../support/workspace.dom';
import { WORKSPACES_LIST_DOM } from '../../../support/workspaces.dom';

describe('Workspace', () => {
  it('should reset workspace overview when changing workspaces', () => {
    cy.visit(`/login`);
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
      .should('contain', `This is short description for the Workspace 0.`);
    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.description)
      .should(
        'contain',
        `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
      );

    cy.expectBusListToBe([`Bus 0`]);

    // TODO: check user names list in workspace 0

    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .last()
      .should('not.have.class', 'active')
      .and('not.have.attr', 'disabled', 'disabled')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 1`)
      .and('be.visible')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks1`);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
      .should('contain', `No description provided.`);
    cy
      .get(WORKSPACE_OVERVIEW_DOM.texts.description)
      .should(
        'contain',
        `Put some description in markdown for the workspace here.`
      );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
      .should('be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
      .should('be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editDetachBus).should('be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).should('be.visible');

    cy.expectBusListToBe([`Bus 1`]);

    // TODO: check user names list in workspace 1
  });

  it('should logout after logging in', () => {
    cy.visit(`/login`);
    cy.login('admin', 'admin');
    cy.logout();

    cy.expectNotification('success', 'Log out !', `You're now disconnected.`);
  });

  it('should allow adminCockpit to act as adminWorkspace', () => {
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

    cy.expectLocationToBe(`/workspaces/idWks1`);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
      .should('not.be.disabled');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
      .should('not.be.disabled');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus)
      .should('not.be.disabled');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.editDetachBus)
      .should('not.be.disabled');

    expectedDefaultUserDetailsList.forEach((user, index) => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace(user.id))
        .should('not.be.disabled');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact(user.id))
        .should('not.be.disabled');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(user.id))
        .should('not.be.disabled');

      if (index !== 0 && user.id !== 'admin') {
        cy
          .get(WORKSPACE_OVERVIEW_DOM.table.cells.userActionDelete(user.id))
          .should('not.be.disabled');
      } else {
        cy
          .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
          .should('not.be.disabled');
      }
    });

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.empty');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    // remove adminWorkspace permission to user called 'admin'
    cy
      .get('.cell-user-adminWorkspace-admin')
      .find('mat-checkbox')
      .scrollIntoView()
      .should('be.visible');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace('admin'))
      .should('be.checked')
      .and('not.be.disabled')
      .click({ force: true })
      .should('not.be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('not.be.disabled')
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
      .should('not.be.disabled');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
      .should('not.be.disabled');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus)
      .should('not.be.disabled');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.editDetachBus)
      .should('not.be.disabled');

    expectedDefaultUserDetailsList.forEach((user, index) => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace(user.id))
        .should('not.be.disabled');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact(user.id))
        .should('not.be.disabled');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(user.id))
        .should('not.be.disabled');

      if (index !== 0 && user.id !== 'admin') {
        cy
          .get(WORKSPACE_OVERVIEW_DOM.table.cells.userActionDelete(user.id))
          .should('not.be.disabled');
      } else {
        cy
          .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
          .should('not.be.disabled');
      }
    });

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.empty');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');
  });

  it('should have restricted actions when connected user is not adminWorkspace', () => {
    cy.visit(`/login`);
    cy.login('cchevalier', 'cchevalier');

    cy
      .get(WORKSPACES_LIST_DOM.texts.workspaceName)
      .contains(`Workspace 1`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks1`);

    cy
      .get('.cell-user-adminWorkspace-cchevalier')
      .find('mat-checkbox')
      .scrollIntoView()
      .should('be.visible')
      .should('not.be.checked');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
      .should('be.disabled');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
      .should('be.disabled');
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).should('be.disabled');
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editDetachBus).should('be.disabled');

    expectedDefaultUserDetailsList.forEach((user, index) => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userAdminWorkspace(user.id))
        .should('be.disabled');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact(user.id))
        .should('be.disabled');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(user.id))
        .should('be.disabled');

      if (index !== 0 && user.id !== 'cchevalier') {
        cy
          .get(WORKSPACE_OVERVIEW_DOM.table.cells.userActionDelete(user.id))
          .should('be.disabled');
      } else {
        cy
          .get(WORKSPACE_OVERVIEW_DOM.table.cells.currentUserDelete)
          .should('not.be.disabled');
      }
    });

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.addUserInWorkspace)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
      .should('be.disabled');

    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.disabled');
  });

  it('should show 404 view if not found element', () => {
    cy.visit(`/login`);
    cy.login('admin', 'admin');

    cy.visit('/workspaces/idWks0/petals/service-units/XD');
    cy.login('admin', 'admin');

    cy.expectLocationToBe('/workspaces/idWks0/petals/not-found');

    cy.get('.not-found-404').should('be.visible');

    cy.expectBreadcrumbsToBe([`Workspace 0`, `Topology`, `Not Found`]);
  });

  describe('Menu', () => {
    beforeEach(() => {
      cy.visit(`/login`);
      cy.login('admin', 'admin');

      cy.expectLocationToBe(`/workspaces/idWks0`);
    });

    it('should have the current workspace name selected from the menu workspace', () => {
      // ========== Step 1 ==========
      // open menu and check if current workspace is selected and disabled
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy
        .get(MENU_DOM.links.itemsWksNames)
        .first()
        .should('have.class', 'active')
        .and('have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 0`)
        .and('be.visible');

      cy
        .get(MENU_DOM.links.itemsWksNames)
        .last()
        .should('not.have.class', 'active')
        .and('not.have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 1`)
        .and('be.visible')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks1`);
      cy.expectBreadcrumbsToBe([`Workspace 1`]);

      // ========== Step 2 ==========
      // open menu and check if the next workspace is selected and disabled
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy
        .get(MENU_DOM.links.itemsWksNames)
        .first()
        .should('have.class', 'active')
        .and('have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 1`)
        .and('be.visible');

      cy
        .get(MENU_DOM.links.itemsWksNames)
        .last()
        .should('not.have.class', 'active')
        .and('not.have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 0`)
        .and('be.visible');

      // create new workspace
      cy.get(`.menu-item-create-wks`).click();

      cy.addWorkspace('Workspace 2');

      cy.expectLocationToBe('/workspaces/idWks2');

      // ========== Step 3 ==========
      // open menu and check if the new workspace is selected and disabled
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy
        .get(MENU_DOM.links.itemsWksNames)
        .first()
        .should('have.class', 'active')
        .and('have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 2`)
        .and('be.visible');

      cy
        .get(MENU_DOM.links.itemsWksNames)
        .eq(-2)
        .should('not.have.class', 'active')
        .and('not.have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 0`)
        .and('be.visible');

      cy
        .get(MENU_DOM.links.itemsWksNames)
        .last()
        .should('not.have.class', 'active')
        .and('not.have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 1`)
        .and('be.visible');
    });

    it('should display the workspaces names list from the menu workspace', () => {
      // ========== Case 1 ==========
      // open menu and check if the workspaces names list is displayed
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy.expectWorkspacesListMenuToBe([`Workspace 0`, `Workspace 1`]);

      // create new workspace
      cy.get(`.menu-item-create-wks`).click();

      cy.addWorkspace('Workspace 2');

      cy.expectLocationToBe('/workspaces/idWks2');

      // ========== Case 2 ==========
      // open menu and check if the workspaces names list is updated
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy.expectWorkspacesListMenuToBe([
        `Workspace 2`,
        `Workspace 0`,
        `Workspace 1`,
      ]);
    });

    it('should navigate to the workspaces pages from the menu workspace', () => {
      // open menu
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

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

      cy.url().should('include', '?page=list');

      cy.get(MENU_DOM.buttons.toggleMenu).should('not.be.visible');
      cy.get(MENU_DOM.links.goToCreateWks).should('not.be.visible');
      cy.get(MENU_DOM.links.goToWksList).should('not.be.visible');

      // go back to the same workspace we had just left before
      cy
        .get(WORKSPACES_LIST_DOM.listItem.itemWorkspaces)
        .eq(0)
        .click();

      cy.expectLocationToBe('/workspaces/idWks0');

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

    it('should show the workspace name in the header and active link when the route match with workspace overview', () => {
      // check if header and nav are visible
      cy.get(HEADER_DOM.toolbar).should('be.visible');
      cy.get(BREADCRUMB_DOM.nav).should('be.visible');

      // expect to have workspace name
      cy
        .get(BREADCRUMB_DOM.texts.itemName)
        .eq(0)
        .should('contain', 'Workspace 0');
      // expect to have router link active
      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
        .eq(0)
        .should('have.class', 'active-link');

      cy
        .get('app-sidebar')
        .find('.btn-topology')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals`);

      // open menu
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      // check if Workspace 0 is selected in the menu
      cy
        .get(MENU_DOM.links.itemsWksNames)
        .first()
        .should('have.class', 'active')
        .and('have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 0`)
        .and('be.visible');

      // close menu
      cy.get(`body`).type(`{esc}`);

      // expect to have the menu closed
      cy
        .get(
          `.menu + * .cdk-overlay-pane > div.mat-menu-panel > div.mat-menu-content`
        )
        .should('not.be.visible');

      // go to the child view
      cy.getElementInPetalsTree(`service-unit`, `SU 0`).click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);

      // open menu
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      // check if Workspace 0 is always selected in the menu
      cy
        .get(MENU_DOM.links.itemsWksNames)
        .first()
        .should('have.class', 'active')
        .and('have.attr', 'disabled', 'disabled')
        .find(MENU_DOM.texts.wksNames)
        .should('contain', `Workspace 0`)
        .and('be.visible');

      // close menu
      cy.get(`.cdk-overlay-backdrop`).click();

      // expect to have workspace name
      cy
        .get(BREADCRUMB_DOM.texts.itemName)
        .eq(0)
        .should('contain', 'Workspace 0');
      // expect to have router link inactive
      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
        .eq(0)
        .should('not.have.class', 'active-link')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0`);

      // expect to have router link active
      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
        .eq(0)
        .should('have.class', 'active-link');

      // open menu
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      // go back to workspaces list
      cy
        .get(`.menu-item-back-wks-list`)
        .find(MENU_DOM.texts.itemNameWksList)
        .should('contain', `Back to Workspaces`)
        .and('be.visible')
        .click();

      // go back to the same workspace we had just left before
      cy
        .get(WORKSPACES_LIST_DOM.listItem.itemWorkspaces)
        .eq(0)
        .click();

      cy.expectLocationToBe('/workspaces/idWks0');

      // expect to have router link active again
      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
        .eq(0)
        .should('have.class', 'active-link');
    });

    it('should have the workspaces names list sorted by name', () => {
      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy.expectWorkspacesListMenuToBe(['Workspace 0', 'Workspace 1']);

      cy.get(`.menu-item-create-wks`).click();

      cy.addWorkspace('Z Workspace Name');

      cy.expectLocationToBe(`/workspaces/idWks2`);

      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy.expectWorkspacesListMenuToBe([
        'Z Workspace Name',
        'Workspace 0',
        'Workspace 1',
      ]);

      cy.get(`.menu-item-create-wks`).click();

      cy.addWorkspace('A Workspace Name');

      cy.expectLocationToBe(`/workspaces/idWks3`);

      cy
        .get(MENU_DOM.buttons.toggleMenu)
        .should('be.visible')
        .click();

      cy.expectWorkspacesListMenuToBe([
        'A Workspace Name',
        'Workspace 0',
        'Workspace 1',
        'Z Workspace Name',
      ]);
    });
  });

  describe('Details', () => {
    beforeEach(() => {
      cy.visit(`/login`);
      cy.login('admin', 'admin');

      cy.expectLocationToBe(`/workspaces/idWks0`);
    });

    it('should not update workspace details', () => {
      cy
        .get(BREADCRUMB_DOM.texts.itemName)
        .eq(0)
        .should('contain', `Workspace 0`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
        .should('contain', `This is short description for the Workspace 0.`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.description)
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
        );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.saveWorkspaceDetails)
        .should('be.disabled');

      cy.get(WORKSPACE_OVERVIEW_DOM.inputs.workspaceName).type('bla bla bla');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.saveWorkspaceDetails)
        .should('be.enabled');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.shortDescriptionTextarea)
        .type(`bla bla bla`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.descriptionTextarea)
        .type(`bla bla bla`);

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.cancelEditWorkspaceDetails).click();

      cy
        .get(BREADCRUMB_DOM.texts.itemName)
        .eq(0)
        .should('contain', `Workspace 0`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
        .should('contain', `This is short description for the Workspace 0.`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.description)
        .scrollIntoView()
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
        );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.saveWorkspaceDetails)
        .should('be.disabled');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.inputs.workspaceName)
        .should('have.value', `Workspace 0`)
        .clear()
        .type(`UPDATE_WKS_HTTP_ERROR_BACKEND`);

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.saveWorkspaceDetails).click();

      cy.expectNotification(
        'error',
        'Workspace',
        `An error occurred while updating workspace details.`
      );

      // should stay in edit mode view when an error occurred from the backend and keep the current changes
      cy
        .get(WORKSPACE_OVERVIEW_DOM.inputs.workspaceName)
        .should('have.value', `UPDATE_WKS_HTTP_ERROR_BACKEND`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.saveWorkspaceDetails)
        .should('be.visible');
    });

    it('should update workspace name', () => {
      cy
        .get(BREADCRUMB_DOM.texts.itemName)
        .eq(0)
        .should('contain', `Workspace 0`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.inputs.workspaceName)
        .scrollIntoView()
        .should('have.value', `Workspace 0`)
        .and('be.enabled');

      cy.updateWorkspaceName(`PedRoBot's family`, `17/100`, null);

      cy
        .get(BREADCRUMB_DOM.texts.itemName)
        .eq(0)
        .should('contain', `PedRoBot's family`);
    });

    it('should have 100 characters max available to the workspace name', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.inputs.workspaceName)
        .should('have.value', `Workspace 0`)
        .and('be.enabled');

      cy.updateWorkspaceName(
        `ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO`,
        `100/100`
      );

      cy
        .get(BREADCRUMB_DOM.texts.itemName)
        .eq(0)
        .should(
          'contain',
          `ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO ZA WARUDO `
        );
    });

    it('should have the workspace descriptions', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
        .should('contain', `This is short description for the Workspace 0.`);
      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.description)
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
        );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
        .should('be.visible');
    });

    it('should update the short description', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
        .should('contain', `This is short description for the Workspace 0.`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.shortDescriptionTextarea)
        .should('have.value', `This is short description for the Workspace 0.`)
        .and('be.enabled');

      cy.updateShortDescription(` And some more.`, `61/200`, null);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
        .should(
          'contain',
          `This is short description for the Workspace 0. And some more.`
        );
    });

    it('should have 200 characters max available to the short description textarea', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.shortDescriptionTextarea)
        .should('have.value', `This is short description for the Workspace 0.`)
        .and('be.enabled');

      cy.updateShortDescription(
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sed imperdiet nisl, eu fringilla diam. Duis interdum ex ligula, non pharetra odio commodo nec.`,
        `200/200`,
        null
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.shortDescription)
        .should(
          'contain',
          `This is short description for the Workspace 0.Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sed imperdiet nisl, eu fringilla diam. Duis interdum ex ligula, non pharetra odio commodo nec.`
        );
    });

    it('should have live markdown rendering of the description while edit', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.description)
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
        );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.descriptionPreview)
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
        );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.descriptionTextarea)
        .should(
          'have.value',
          `You can import a bus from the container **192.168.0.1:7700** to get a mock bus.`
        )
        .and('be.enabled')
        .type(` And some ~~more~~`);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.descriptionPreview)
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus. And some more`
        );
    });

    it('should update the description', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.description)
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
        );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .should('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.descriptionTextarea)
        .should(
          'have.value',
          `You can import a bus from the container **192.168.0.1:7700** to get a mock bus.`
        )
        .and('be.enabled');

      cy.updateDescription(
        ` And some ~~more~~`,
        `Supports Standard Markdown Syntax`
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.texts.description)
        .should(
          'contain',
          `You can import a bus from the container 192.168.0.1:7700 to get a mock bus. And some more`
        );
    });

    it('should have info messages when no descriptions', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .find(`.edit-text-btn`)
        .should('contain', 'Edit')
        .and('be.visible')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.shortDescriptionTextarea)
        .should('have.value', `This is short description for the Workspace 0.`)
        .and('be.enabled');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.descriptionTextarea)
        .should(
          'have.value',
          `You can import a bus from the container **192.168.0.1:7700** to get a mock bus.`
        )
        .and('be.enabled');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.shortDescriptionTextarea)
        .clear()
        .should('be.empty')
        .and(
          'have.attr',
          'placeholder',
          `Add short description to the current workspace`
        )
        .and('be.enabled');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.textArea.descriptionTextarea)
        .clear()
        .should('be.empty');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.saveWorkspaceDetails)
        .should('be.enabled')
        .click();

      // cy.get('.wrapper-content').scrollIntoView();

      cy.expectMessageToBe(
        `.info-no-short-description`,
        'info',
        `This workspace doesn't have any short description.`
      );

      cy.expectMessageToBe(
        `.info-no-description`,
        'info',
        `This workspace doesn't have any description.`
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.addEditWorkspaceDetails)
        .find(`.add-text-btn`)
        .should('contain', 'Add')
        .and('be.visible');
    });
  });
});
