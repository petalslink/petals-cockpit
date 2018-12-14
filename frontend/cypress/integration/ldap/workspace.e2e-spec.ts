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

import { WORKSPACE_DOM } from '../../support/workspace.dom';

describe(`Workspace`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should logout after logging in`, () => {
    cy.login('admin', 'admin');
    cy.logout();

    cy.expectNotification('success', 'Log out !', `You're now disconnected.`);
  });

  it(`should active the tab petals`, () => {
    cy.login('admin', 'admin');

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
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav);
    cy.get(WORKSPACE_DOM.menu.workspaceMenu);
    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click()
      .parent()
      .should(`have.class`, `mat-tab-label-active`);
  });

  // TODO: for now there's an ongoing issue with hover
  // https://github.com/cypress-io/cypress/issues/953
  // it(`should display the current username`, () => {
  //   cy.login('admin', 'admin');
  //   cy.get(PETALS_COCKPIT_DOM.buttons.userAvatar).invoke('trigger', 'mouseover');
  //   cy.get('mat-tooltip-component').contains('Administrator');
  // });
});
