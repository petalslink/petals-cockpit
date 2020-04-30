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

import { BREADCRUMB_DOM } from '../../support/breadcrumb.dom';
import { CONFIRM_DIALOG_DOM } from '../../support/confirm-modal.dom';
import { HEADER_DOM } from '../../support/header.dom';
import {
  expectedEndpointsTreeWks0,
  expectedInterfacesTreeWks0,
  expectedServicesTreeWks0,
} from '../../support/helper.const';
import { MENU_DOM } from '../../support/menu.dom';
import { MESSAGE_DOM } from '../../support/message.dom';
import {
  WORKSPACE_BUS_DETACH_DIALOG_DOM,
  WORKSPACE_BUS_IMPORT_DIALOG_DOM,
  WORKSPACE_OVERVIEW_DOM,
} from '../../support/workspace.dom';
import { WORKSPACES_LIST_DOM } from '../../support/workspaces.dom';

describe('Workspace', () => {
  beforeEach(() => {
    cy.visit(`/login`);
    cy.login('admin', 'admin');
  });

  it('should reset workspace overview when changing workspaces', () => {
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
    cy.logout();

    cy.expectNotification('success', 'Log out !', `You're now disconnected.`);
  });

  describe('Menu', () => {
    beforeEach(() => {
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
      cy.get(BREADCRUMB_DOM.texts.itemName).should('contain', 'Workspace 0');
      // expect to have router link active
      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
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
      cy.get(`.cdk-overlay-container`).click(600, 600);

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
      cy.get(BREADCRUMB_DOM.texts.itemName).should('contain', 'Workspace 0');
      // expect to have router link inactive
      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
        .should('not.have.class', 'active-link')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0`);

      // expect to have router link active
      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
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
      cy.expectLocationToBe(`/workspaces/idWks0`);
    });

    it('should not update workspace details', () => {
      cy.get(BREADCRUMB_DOM.texts.itemName).should('contain', `Workspace 0`);

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

      cy.get(BREADCRUMB_DOM.texts.itemName).should('contain', `Workspace 0`);

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
      cy.get(BREADCRUMB_DOM.texts.itemName).should('contain', `Workspace 0`);

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
        .should('contain', `PedRoBot's famil...`);
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
        .should('contain', `ZA WARUDO ZA WAR...`);
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

  describe('Buses', () => {
    beforeEach(() => {
      cy.expectLocationToBe(`/workspaces/idWks0`);
      cy.expectBusListToBe([`Bus 0`]);
    });

    it('should display the bus names list', () => {
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

      cy.expectBusListToBe([`Bus 1`]);
    });

    it('should navigate to the selected bus page from the bus list', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus0`);
    });

    it('should detach selected bus and update the bus names list', () => {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus)
        .should('not.be.visible');

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editDetachBus).click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus)
        .should('not.be.visible');

      cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus).click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDetachBus)
        .should('be.enabled')
        .click()
        .should('be.disabled');

      cy
        .get(WORKSPACE_BUS_DETACH_DIALOG_DOM.texts.infoTitle)
        .contains(`Detach bus?`);

      cy
        .get(WORKSPACE_BUS_DETACH_DIALOG_DOM.texts.description)
        .should('contain', `This will detach Bus 0.`);

      // cancel the dialog
      cy.detachBusAndCheck('admin', false);

      cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus).click();

      // check if the button dialog detach bus is disabled
      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDetachBus)
        .should('be.disabled');

      // the button detach the bus must be activated after selecting the bus
      cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus).click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDetachBus)
        .should('be.enabled')
        .click();

      // detach the bus selected
      cy.detachBusAndCheck('admin');

      cy.expectDetachBusListToBe([]);

      cy.expectMessageToBe(
        `.info-no-buses`,
        'info',
        `There are no buses attached to this workspace.`
      );
    });

    it('should have empty form fields when clicking attach bus', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.expectBusImportFields().should('be.empty');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus)
        .should('be.enabled');

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');
    });

    it('should clear fields when closing attach bus form', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.addBusImportInformations(
        'ip',
        '7700',
        'admin',
        'password',
        'passphrase'
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus)
        .should('be.enabled')
        .click();

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.expectBusImportFields().should('be.empty');
    });

    it(`should not have formField error when clearing attach bus form`, () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.expectBusImportFields().should('be.empty');

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.ipFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.portFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.usernameFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.passwordFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.passphraseFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');

      cy.addBusImportInformations(
        `hostname`,
        'abcd',
        'admin',
        'password',
        'passphrase'
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.ipFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.portFormField)
        .find(`mat-error`)
        .should('be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.usernameFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.passwordFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.passphraseFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.disabled');

      cy.expectBusImportFields().clear();

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');
    });

    it('should update buses info like buses and services list when attaching bus', () => {
      cy
        .get('app-sidebar')
        .find('.btn-services')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/services`);

      cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

      cy.expectServicesTreeToBe(expectedServicesTreeWks0);

      cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);

      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
        .should('not.have.class', 'active-link')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0`);

      cy
        .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
        .should('have.class', 'active-link')
        .click();

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.importBusAndCheck(
        'IMPORT_OK_IP',
        '7700',
        'admin',
        'password',
        'passphrase',
        true
      );

      cy.expectBusListToBe([`Bus 0`, `Bus 2`]);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus)
        .contains(`Bus 2`)
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus2`);

      cy
        .get('app-sidebar')
        .find('.btn-services')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/services`);

      cy.expectInterfacesTreeToBe(expectedInterfacesTreeUpdatedWks0);

      cy.expectServicesTreeToBe(expectedServicesTreeUpdatedWks0);

      cy.expectEndpointsTreeToBe(expectedEndpointsTreeUpdatedWks0);
    });

    it('should show POST import error', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.addBusImportInformations(
        `IMPORT_HTTP_ERROR_IP`,
        '7700',
        'admin',
        'password',
        'passphrase'
      );

      cy
        .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
        .should('not.be.visible');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .should('not.be.visible');

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

      cy
        .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
        .should('not.be.visible');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(`Error backend`)
        .should('be.visible');
    });

    it('should have complete message import error when clicking view more', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.addBusImportInformations(
        `IMPORT_HTTP_ERROR_IP_LONG_TEXT`,
        '7700',
        'admin',
        'password',
        'passphrase'
      );

      cy
        .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
        .should('not.be.visible');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .should('not.be.visible');

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

      cy
        .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
        .should('not.be.visible');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(postImportErrorTroncateTxt)
        .should('be.visible');

      cy.get(MESSAGE_DOM.buttons.viewMore).click();

      cy.get(`.msg-dialog`).should('be.visible');

      cy
        .get(`.msg-dialog .msg-dialog-details`)
        .contains(postImportErrorLongText)
        .should('be.visible');

      cy.get(`.msg-dialog button.btn-close-dialog`).click();

      cy.get(`.msg-dialog`).should('not.be.visible');
    });

    it('should show SSE import error', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.importBusAndCheck(
        `IMPORT_ERROR_IP`,
        '7700',
        'admin',
        'password',
        'passphrase',
        false
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(`Can't connect to IMPORT_ERROR_IP:7700`);
    });

    it('should clear message import error when closing attach bus form', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.addBusImportInformations(
        `hostname`,
        '7700',
        'admin',
        'password',
        'passphrase'
      );

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(`Can't connect to hostname:7700`)
        .should('be.visible');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus)
        .should('be.enabled')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus)
        .should('be.enabled')
        .click();

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(`Can't connect to hostname:7700`)
        .should('not.be.visible');
    });

    it('should be able to retry import bus after a failed import', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.importBusAndCheck(
        `hostname`,
        '7700',
        'admin',
        'password',
        'passphrase',
        false
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(`Can't connect to hostname:7700`)
        .should('be.visible');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.inputs.ip)
        .clear()
        .type('192.168.0.1');

      // retry import with good ip
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

      cy
        .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
        .should('not.be.visible');

      cy.expectBusListToBe([`Bus 0`, `Bus 3`]);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .should('not.be.visible');
    });

    it('should be able to cancel import', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      // should not have to import the canceled bus
      cy.cancelImportBusAndCheck(
        `IMPORT_CANCEL_IP`,
        '7700',
        'admin',
        'password',
        'passphrase',
        true
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus)
        .should('be.enabled')
        .click();

      cy.expectBusListToBe([`Bus 0`]);
    });

    it('should handle receiving SSE import error before POST response', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.importBusAndCheck(
        `FAST_IMPORT_ERROR_IP`,
        '7700',
        'admin',
        'password',
        'passphrase',
        false
      );

      // check if the new bus has not been imported
      cy.expectBusListToBe([`Bus 0`]);

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(`Can't connect to FAST_IMPORT_ERROR_IP:7700`);
    });

    it('should handle receiving SSE import OK before POST response', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.importBusAndCheck(
        `FAST_IMPORT_OK_IP`,
        '7700',
        'admin',
        'password',
        'passphrase',
        true
      );

      cy.expectBusListToBe([`Bus 0`, `Bus 2`]);
    });

    it('should remove the error import bus message when user switch workspaces', () => {
      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.importBusAndCheck(
        `FAST_IMPORT_ERROR_IP`,
        '7700',
        'admin',
        'password',
        'passphrase',
        false
      );

      cy
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .contains(`Can't connect to FAST_IMPORT_ERROR_IP:7700`);

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
        .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
        .should('not.contain', `Can't connect to FAST_IMPORT_ERROR_IP:7700`);
    });

    it('should import with default values on empty fields', () => {
      cy.expectBusListToBe([`Bus 0`]);

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

      cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

      cy
        .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
        .should('not.be.visible');

      // check if the bus is added
      cy.expectBusListToBe([`Bus 0`, `Bus 2`]);
    });

    const expectedInterfacesTreeUpdatedWks0 = [
      `http://namespace-example.fr/interface/technique/version/1.0`,
      `Interface-Localpart0`,
      `Interface-Localpart1`,
      `http://namespace-example.fr/interface/technique/version/2.0`,
      `Interface-Localpart2`,
      `http://namespace-example.fr/interface/technique/version/3.0`,
      `Interface-Localpart3`,
      `Interface-Localpart4`,
      `http://namespace-example.fr/interface/technique/version/14.0`,
      `Interface-Localpart14`,
      `http://namespace-example.fr/interface/technique/version/15.0`,
      `Interface-Localpart15`,
      `http://namespace-example.fr/interface/technique/version/16.0`,
      `Interface-Localpart16`,
      `http://namespace-example.fr/interface/technique/version/17.0`,
      `Interface-Localpart17`,
      `http://namespace-example.fr/interface/technique/version/18.0`,
      `Interface-Localpart18`,
      `http://namespace-example.fr/interface/technique/version/19.0`,
      `Interface-Localpart19`,
    ];

    const expectedServicesTreeUpdatedWks0 = [
      `http://namespace-example.fr/service/technique/version/1.0`,
      `Localpart0`,
      `Localpart1`,
      `http://namespace-example.fr/service/technique/version/2.0`,
      `Localpart2`,
      `http://namespace-example.fr/service/technique/version/3.0`,
      `Localpart3`,
      `Localpart4`,
      `http://namespace-example.fr/service/technique/version/14.0`,
      `Localpart14`,
      `http://namespace-example.fr/service/technique/version/15.0`,
      `Localpart15`,
      `http://namespace-example.fr/service/technique/version/16.0`,
      `Localpart16`,
      `http://namespace-example.fr/service/technique/version/17.0`,
      `Localpart17`,
      `http://namespace-example.fr/service/technique/version/18.0`,
      `Localpart18`,
      `http://namespace-example.fr/service/technique/version/19.0`,
      `Localpart19`,
    ];

    const expectedEndpointsTreeUpdatedWks0 = [
      `edpt-89p82661-test-31o4-l391-00`,
      `edpt-89p82661-test-31o4-l391-01`,
      `edpt-89p82661-test-31o4-l391-02`,
      `edpt-89p82661-test-31o4-l391-03`,
      `edpt-89p82661-test-31o4-l391-04`,
      `edpt-69f52660-test-19e9-a769-14`,
      `edpt-69f52660-test-19e9-a769-15`,
    ];

    const postImportErrorTroncateTxt = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu...`;

    const postImportErrorLongText = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi`;
  });

  describe('Users', () => {
    beforeEach(() => {
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
          .get(
            WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(user.id)
          )
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
        .get(`mat-option span`)
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
        .get(
          WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact(userToAdd)
        )
        .should('not.be.checked');

      cy
        .get(WORKSPACE_OVERVIEW_DOM.buttons.savePermissionsBtn)
        .should('be.disabled');

      cy.get(WORKSPACE_OVERVIEW_DOM.inputs.userSearchCtrl).should('be.empty');

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

      cy.get(`mat-option span`).should('not.contain', userToDelete);

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
        .get(`mat-option span`)
        .contains(userToDelete)
        .should('be.visible');
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
        .contains(
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
        .get(
          WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact('cchevalier')
        )
        .should('be.checked')
        .click({
          force: true,
        })
        .should('not.be.checked');

      cy
        .get(
          WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact('bescudie')
        )
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
        .get(
          WORKSPACE_OVERVIEW_DOM.table.cells.userDeployArtifact('cchevalier')
        )
        .should('not.be.checked');

      cy
        .get(
          WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact('bescudie')
        )
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
        .get(
          WORKSPACE_OVERVIEW_DOM.table.cells.userLifecycleArtifact('bescudie')
        )
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

    const expectedDefaultUserDetailsList = [
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
});
