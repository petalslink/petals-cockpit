/**
 * Copyright (C) 2017-2019 Linagora
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

import { MENU_DOM } from '../../support/menu.dom';
import { PETALS_COCKPIT_DOM } from '../../support/petals-cockpit.dom';
import { PROFILE_DOM } from '../../support/profile.dom';

describe(`Profile`, () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');

    cy.get(PETALS_COCKPIT_DOM.buttons.goToProfilePage).click();

    cy.expectLocationToBe(`/profile`);
  });

  it(`should open the profile page`, () => {
    // check if the name of current user is displayed in toolbar
    cy
      .get(`mat-toolbar`)
      .find(PROFILE_DOM.texts.title)
      .should('contain', 'Administrator')
      .and('be.visible');
  });

  it(`should navigate to the workspaces page from the menu profile`, () => {
    // open menu
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    // check that no workspaces names in the menu profile
    cy.get(`.item-list .menu-item-wks-name`).should('not.be.visible');

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
    cy.get(MENU_DOM.links.goToCreateWks).should('not.be.visible');
    cy.get(MENU_DOM.links.goToWksList).should('not.be.visible');

    cy.get(PETALS_COCKPIT_DOM.buttons.goToProfilePage).click();

    cy.expectLocationToBe(`/profile`);

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
});
