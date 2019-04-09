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

import { BREADCRUMB_DOM } from '../../support/breadcrumb.dom';
import { HEADER_DOM } from '../../support/header.dom';
import { MENU_DOM } from '../../support/menu.dom';
import { WORKSPACE_DOM } from '../../support/workspace.dom';
import { WORKSPACES_LIST_DOM } from '../../support/workspaces.dom';

describe(`Workspace`, () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
  });

  it(`should logout after logging in`, () => {
    cy.logout();

    cy.expectNotification('success', 'Log out !', `You're now disconnected.`);
  });

  it(`should active the tab petals`, () => {
    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav);
    cy.get(WORKSPACE_DOM.menu.workspaceMenu);
    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click()
      .parent()
      .should(`have.class`, `mat-tab-label-active`);
  });

  it(`should active the tab services`, () => {
    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav);
    cy.get(WORKSPACE_DOM.menu.workspaceMenu);
    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click()
      .parent()
      .should(`have.class`, `mat-tab-label-active`);
  });

  it(`should have the current workspace name selected from the menu workspace`, () => {
    cy.expectLocationToBe(`/workspaces/idWks0`);

    // ========== Case 1 ==========
    // open menu and check if current workspace is selected
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(`.item-list .menu-item-wks-name`)
      .first()
      .should('have.class', 'active')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 0`)
      .and('be.visible');

    cy
      .get(`.item-list .menu-item-wks-name`)
      .last()
      .should('not.have.class', 'active')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 1`)
      .and('be.visible')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks1`);

    // ========== Case 2 ==========
    // open menu and check if the next workspace is selected
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(`.item-list .menu-item-wks-name`)
      .first()
      .should('not.have.class', 'active')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 0`)
      .and('be.visible');

    cy
      .get(`.item-list .menu-item-wks-name`)
      .last()
      .should('have.class', 'active')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 1`)
      .and('be.visible');

    // create new workspace
    cy.get(`.menu-item-create-wks`).click();

    cy.addWorkspace('Workspace 2');

    cy.expectLocationToBe('/workspaces/idWks2');

    // ========== Case 3 ==========
    // open menu and check if the new workspace is selected
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(`.item-list .menu-item-wks-name`)
      .eq(-2)
      .should('not.have.class', 'active')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 1`)
      .and('be.visible');

    cy
      .get(`.item-list .menu-item-wks-name`)
      .last()
      .should('have.class', 'active')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 2`)
      .and('be.visible');
  });

  it(`should display the workspaces names list from the menu workspace`, () => {
    cy.expectLocationToBe(`/workspaces/idWks0`);

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
      `Workspace 0`,
      `Workspace 1`,
      `Workspace 2`,
    ]);
  });

  it(`should navigate to the workspaces pages from the menu workspace`, () => {
    cy.expectLocationToBe(`/workspaces/idWks0`);

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

    cy.url().should('include', '?page=create');
  });

  it(`should show the workspace name in the header and active link when the route match with workspace overview`, () => {
    cy.expectLocationToBe(`/workspaces/idWks0`);

    // check if header and nav are visible
    cy.get(HEADER_DOM.toolbar).should('be.visible');
    cy.get(BREADCRUMB_DOM.nav).should('be.visible');

    // expect to have workspace name
    cy.get(BREADCRUMB_DOM.texts.itemName).should('contain', 'Workspace 0');
    // expect to have router link active
    cy
      .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
      .should('have.class', 'active-link');

    // open menu
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    // check if Workspace 0 is selected in the menu
    cy
      .get(`.item-list .menu-item-wks-name`)
      .first()
      .should('have.class', 'active')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 0`)
      .and('be.visible')
      .click();

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
      .get(`.item-list .menu-item-wks-name`)
      .first()
      .should('have.class', 'active')
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
});
