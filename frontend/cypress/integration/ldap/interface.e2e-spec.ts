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

import { INTERFACE_OVERVIEW_DOM } from '../../support/interface.dom';
import { SERVICE_OVERVIEW_DOM } from '../../support/service.dom';

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
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart0`);

    // 1) expect to have 1 Interface namespace, 2 Services, 2 Endpoints
    cy.expectInterfaceNamespaceToBe(
      `http://namespace-example.fr/interface/technique/version/1.0`
    );

    cy.expectServicesListToBe(
      expectedServicesLocalpartsNamespacesOfInterfaceLocalpart0
    );

    cy.expectItfEndpointsListToBe(expectedEndpointsOfInterfaceLocalpart0);

    // 2) expect to have 1 Interface namespace, 1 Service, 2 Endpoints
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart1`);

    cy.expectLocationToBe(
      `/workspaces/idWks0/services/interfaces/idInterface1`
    );

    cy.expectInterfaceNamespaceToBe(
      `http://namespace-example.fr/interface/technique/version/1.0`
    );

    cy.expectServicesListToBe([
      `Localpart1`,
      `http://namespace-example.fr/service/technique/version/1.0`,
    ]);

    cy.expectItfEndpointsListToBe(expectedEndpointsOfInterfaceLocalpart1);

    // 3) expect to have 1 Interface namespace, 2 Services, 1 Endpoint
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart2`);

    cy.expectLocationToBe(
      `/workspaces/idWks0/services/interfaces/idInterface2`
    );

    cy.expectInterfaceNamespaceToBe(
      `http://namespace-example.fr/interface/technique/version/2.0`
    );

    cy.expectServicesListToBe(
      expectedServicesLocalpartsNamespacesOfInterfaceLocalpart2
    );

    cy.expectItfEndpointsListToBe([`edpt-89p82661-test-31o4-l391-02`]);

    // 4) expect to have 1 Interface namespace, 1 Service, 1 Endpoint
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart3`);

    cy.expectLocationToBe(
      `/workspaces/idWks0/services/interfaces/idInterface3`
    );

    cy.expectInterfaceNamespaceToBe(
      `http://namespace-example.fr/interface/technique/version/3.0`
    );

    cy.expectServicesListToBe([
      `Localpart3`,
      `http://namespace-example.fr/service/technique/version/3.0`,
    ]);

    cy.expectItfEndpointsListToBe([`edpt-89p82661-test-31o4-l391-03`]);

    // 5) expect to have 1 Interface namespace, 5 Services, 5 Endpoints
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart4`);

    cy.expectLocationToBe(
      `/workspaces/idWks0/services/interfaces/idInterface4`
    );

    cy.expectInterfaceNamespaceToBe(
      `http://namespace-example.fr/interface/technique/version/3.0`
    );

    cy.expectServicesListToBe(
      expectedServicesLocalpartsNamespacesOfInterfaceLocalpart4
    );

    cy.expectItfEndpointsListToBe(expectedEndpointsOfInterfaceLocalpart4);
  });

  it(`should go to details of Service from the view of a selected Interface`, () => {
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart0`);

    cy
      .get(INTERFACE_OVERVIEW_DOM.navList.navListServices)
      .contains(`Localpart0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService0`);

    cy
      .get(SERVICE_OVERVIEW_DOM.texts.aboutService)
      .contains(`http://namespace-example.fr/service/technique/version/1.0`)
      .should('be.visible');
  });

  it(`should go to details of Endpoint from the view of a selected Interface`, () => {
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart4`);

    cy
      .get(INTERFACE_OVERVIEW_DOM.navList.navListEndpoints)
      .contains(`edpt-89p82661-test-31o4-l391-04`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/idEndpoint4`);
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
    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart4`);

    cy.get(`app-workspace-element .mat-tab-body-content`).scrollTo('bottom');

    cy
      .get(INTERFACE_OVERVIEW_DOM.listItem.itemEndpoints)
      .find(`mat-icon[svgIcon="component"]`)
      .should('be.visible');
  });

  // ---------------------------- Interface Localpart 0 ---------------------------- //

  const expectedServicesLocalpartsNamespacesOfInterfaceLocalpart0 = [
    `Localpart0`,
    `http://namespace-example.fr/service/technique/version/1.0`,
    `Localpart4`,
    `http://namespace-example.fr/service/technique/version/3.0`,
  ];

  const expectedEndpointsOfInterfaceLocalpart0 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-04`,
  ];

  // ---------------------------- Interface Localpart 1 ---------------------------- //

  const expectedEndpointsOfInterfaceLocalpart1 = [
    `edpt-89p82661-test-31o4-l391-01`,
    `edpt-89p82661-test-31o4-l391-02`,
  ];

  // ---------------------------- Interface Localpart 2 ---------------------------- //

  const expectedServicesLocalpartsNamespacesOfInterfaceLocalpart2 = [
    `Localpart2`,
    `http://namespace-example.fr/service/technique/version/2.0`,
    `Localpart3`,
    `http://namespace-example.fr/service/technique/version/3.0`,
  ];

  // ---------------------------- Interface Localpart 4 ---------------------------- //

  const expectedServicesLocalpartsNamespacesOfInterfaceLocalpart4 = [
    `Localpart0`,
    `http://namespace-example.fr/service/technique/version/1.0`,
    `Localpart1`,
    `http://namespace-example.fr/service/technique/version/1.0`,
    `Localpart2`,
    `http://namespace-example.fr/service/technique/version/2.0`,
    `Localpart3`,
    `http://namespace-example.fr/service/technique/version/3.0`,
    `Localpart4`,
    `http://namespace-example.fr/service/technique/version/3.0`,
  ];

  const expectedEndpointsOfInterfaceLocalpart4 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-01`,
    `edpt-89p82661-test-31o4-l391-02`,
    `edpt-89p82661-test-31o4-l391-03`,
    `edpt-89p82661-test-31o4-l391-04`,
  ];
});
