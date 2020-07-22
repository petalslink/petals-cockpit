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

import { TOPOLOGY_DOM } from '../../../support/topology.dom';
import { WORKSPACE_OVERVIEW_DOM } from '../../../support/workspace.dom';

describe('Buses', () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy.expectBusListToBe([`Bus 0`]);

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus0`);

    cy.expectBreadcrumbsToBe([`Workspace 0`, `Topology`, `Bus 0`]);
  });

  it('should have info message when no description', () => {
    // TODO: complete this test when 'feat(frontend): get bus description' will be merged
    cy.expectMessageToBe(
      `.info-no-bus-description`,
      'info',
      `This topology doesn't have any description.`
    );
  });

  it('should have container list', () => {
    // expect to have 4 columns
    cy
      .get('.bus-containers-table')
      .find('th')
      .should('have.length', 4);

    // expect to have 2 containers present on the list
    cy.get(TOPOLOGY_DOM.table.rowNames).should('have.length', 2);

    // expect to have names, ip, port for all containers sorted in asc order
    cy.expectContainerListToBe(expectedContainerListSortedInAscOrder);

    // expect to have reachable information present for all containers
    cy
      .get('.bus-containers-table')
      .find('app-led')
      .should('have.length', 2)
      .and('have.attr', 'color', 'green');
  });

  it('should navigate to the selected container page from the container list', () => {
    cy
      .get('td.cell-name')
      .find('.mat-row-link')
      .contains(`Cont 0`)
      .click({ force: true });

    cy.expectLocationToBe(`/workspaces/idWks0/petals/containers/idCont0`);
  });

  it('should sort container list by name', () => {
    // expect to have 4 columns
    cy
      .get('.bus-containers-table')
      .find('th')
      .should('have.length', 4);

    // expect to have 2 containers present on the list
    cy.get(TOPOLOGY_DOM.table.rowNames).should('have.length', 2);

    // expect to have names, ip, port for all containers sorted in asc order
    cy.expectContainerListToBe(expectedContainerListSortedInAscOrder);

    cy
      .get('.bus-containers-table')
      .find('app-led')
      .should('have.length', 2)
      .and('have.attr', 'color', 'green');

    cy
      .get('.bus-containers-table')
      .find(`th>.mat-sort-header-container`)
      .first()
      .click({ force: true });

    // expect to have names, ip, port for all containers sorted in desc order
    cy.expectContainerListToBe(expectedSortContainerListSortedInDescOrder);

    // expect to have reachable information present for all containers
    cy
      .get('.bus-containers-table')
      .find('app-led')
      .should('have.length', 2)
      .and('have.attr', 'color', 'green');
  });

  const expectedContainerListSortedInAscOrder = [
    `Cont 0`,
    `192.168.0.0`,
    `7700`,
    `Cont 1`,
    `192.168.0.1`,
    `7700`,
  ];

  const expectedSortContainerListSortedInDescOrder = [
    `Cont 1`,
    `192.168.0.1`,
    `7700`,
    `Cont 0`,
    `192.168.0.0`,
    `7700`,
  ];
});
