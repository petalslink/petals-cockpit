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

import { INTERFACE_OVERVIEW_DOM } from '../../../support/interface.dom';

describe(`Interface`, () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);
  });

  it(`should contain the interface details overview with interfaces and endpoints`, () => {
    cy.clickElementInTree(`interface-localpart`, `0-0`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/interfaces/1`);

    // 1) expect to have 1 Interface namespace, 2 Services, 2 Endpoints
    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Service`,
      `http://namespace-example.fr/interface/technique/version/1.0`,
    ]);

    cy.expectInterfaceNamespaceToBe(
      `http://namespace-example.fr/interface/technique/version/1.0`
    );

    cy.expectServicesListToBe(
      expectedServicesLocalpartsNamespacesOfInterfaceLocalpart1
    );

    cy.expectItfEndpointsListToBe(expectedEndpointsOfInterfaceLocalpart1);

    // 2) expect to have 1 Interface namespace, 1 Service, 2 Endpoints
    cy.clickElementInTree(`interface-localpart`, `0-1`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/interfaces/2`);

    cy.expectInterfaceNamespaceToBe(
      `http://namespace-example.fr/interface/technique/version/1.0`
    );

    cy.expectServicesListToBe(
      expectedServicesLocalpartsNamespacesOfInterfaceLocalpart2
    );

    cy.expectItfEndpointsListToBe(expectedEndpointsOfInterfaceLocalpart2);
  });

  it(`should go to details of Service from the view of a selected Interface`, () => {
    cy.clickElementInTree(`interface-localpart`, `0-1`);

    cy
      .get(INTERFACE_OVERVIEW_DOM.navList.navListServices)
      .contains(`Localpart0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/1`);

    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Service`,
      `http://namespace-example.fr/service/technique/version/1.0`,
    ]);
  });

  it(`should go to details of Endpoint from the view of a selected Interface`, () => {
    cy.clickElementInTree(`interface-localpart`, `0-1`);

    cy
      .get(INTERFACE_OVERVIEW_DOM.navList.navListEndpoints)
      .contains(`edpt-89p82661-test-31o4-l391-00`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/1`);
  });

  it(`should open the 404 page if the interface doesn't exists`, () => {
    cy.visit(`/workspaces/idWks0/services/interfaces/unknownIdInterface`);

    // We authenticate again because we are in an environment e2e prod and
    // when changing the url manually, it reloads the application through the login page.
    // In this case, we may need to reconsider the fact of this connection via the UI ...
    // See some recipes exemple: https://github.com/cypress-io/cypress-example-recipes
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0/services/not-found`);
  });

  it(`should display a component icon for each Endpoint from the view of a selected Interface`, () => {
    cy.clickElementInTree(`interface-localpart`, `0-1`);

    cy
      .get(INTERFACE_OVERVIEW_DOM.listItem.itemEndpoints)
      .find(`mat-icon[svgIcon="component"]`)
      .should('exist')
      .and('have.length', 2);
  });

  // ---------------------------- Interface Localpart 1 ---------------------------- //

  const expectedServicesLocalpartsNamespacesOfInterfaceLocalpart1 = [
    `Localpart0`,
    `http://namespace-example.fr/service/technique/version/1.0`,
    `Localpart1`,
    `http://namespace-example.fr/service/technique/version/1.0`,
  ];

  const expectedEndpointsOfInterfaceLocalpart1 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-01`,
  ];

  // ---------------------------- Interface Localpart 2 ---------------------------- //

  const expectedServicesLocalpartsNamespacesOfInterfaceLocalpart2 = [
    `Localpart0`,
    `http://namespace-example.fr/service/technique/version/1.0`,
    `Localpart2`,
    `http://namespace-example.fr/service/technique/version/2.0`,
  ];

  const expectedEndpointsOfInterfaceLocalpart2 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-02`,
  ];
});
