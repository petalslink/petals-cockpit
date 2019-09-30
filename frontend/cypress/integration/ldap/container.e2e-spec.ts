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

import { MENU_DOM } from '../../support/menu.dom';
import { WORKSPACE_OVERVIEW_DOM } from '../../support/workspace.dom';
import { WORKSPACES_CREATE_DOM } from '../../support/workspaces.dom';

describe('Containers', () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
  });

  it('should have the container details overview with system info and container reachabilities', () => {
    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy.expectBusListToBe([`Bus 0`]);

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus0`);

    cy.getElementInPetalsTree(`container`, `Cont 0`).click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/containers/idCont0`);

    cy
      .get('.container-ip')
      .should('be.visible')
      .and('contain', `192.168.0.0`);

    cy
      .get('.container-port')
      .should('be.visible')
      .and('contain', '7700');

    cy
      .get('.container-system-info')
      .should('be.visible')
      .and(
        'contain',
        `Petals ESB µKernel 4.0.2\nPetals Standalone Shared Memory 4.0.2\nOpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation\nLinux 3.16.0-4-amd64 amd64`
      );

    // we can only check if the graph is visible
    cy
      .get('.container-list-graph')
      .scrollIntoView()
      .should('be.visible');
  });

  it('should have info message when no other containers exist in the bus', () => {
    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(`.menu-item-create-wks`)
      .find(MENU_DOM.texts.itemNameCreateWks)
      .should('contain', `Create New Workspace`)
      .and('be.visible')
      .click();

    cy.expectLocationToBe(`/workspaces`);
    cy.url().should('include', '?page=create');

    cy.get(WORKSPACES_CREATE_DOM.inputs.name).expectFocused();

    cy.addWorkspace('Min Workspace');

    cy.expectLocationToBe('/workspaces/idWks2');

    cy.expectBusListToBe([`Bus 2`]);

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

    cy.expectLocationToBe(`/workspaces/idWks2/petals/buses/idBus2`);

    cy.getElementInPetalsTree(`container`, `Cont 4`).click();

    cy
      .get('.container-ip')
      .should('be.visible')
      .and('contain', `192.168.0.4`);

    cy
      .get('.container-port')
      .should('be.visible')
      .and('contain', '7700');

    cy
      .get('.container-system-info')
      .should('be.visible')
      .and(
        'contain',
        `Petals ESB µKernel 4.0.2\nPetals Standalone Shared Memory 4.0.2\nOpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation\nLinux 3.16.0-4-amd64 amd64`
      );

    cy.expectMessageToBe(
      `.info-no-container-reachable`,
      'info',
      `There are no other containers in this bus.`
    );

    // we can only check if the graph is not visible
    cy.get('.container-list-graph').should('not.be.visible');
  });

  it('should not have the container reachabilities and system info when unreachable container', () => {
    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(`.item-list .menu-item-wks-name`)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 1`)
      .click();

    cy.expectLocationToBe('/workspaces/idWks1');

    cy.expectBusListToBe([`Bus 1`]);

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

    cy.getElementInPetalsTree(`container`, `Cont 3`).click();

    cy
      .get('.container-ip')
      .should('be.visible')
      .and('contain', `192.168.0.3`);

    cy
      .get('.container-port')
      .should('be.visible')
      .and('contain', '7700');

    cy.expectMessageToBe(`.warning-unreachable`, 'warning', 'Unreachable');

    // we can only check if the graph is not visible
    cy.get('.container-list-graph').should('not.be.visible');
  });
});
