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
import { SERVICE_OVERVIEW_DOM } from '../../../support/service.dom';

describe(`Service`, () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);
    cy.expectBreadcrumbsToBe([`Workspace 0`, `Service`]);
  });

  it(`should contain the service details overview with interfaces and endpoints`, () => {
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    // 1) expect to have 1 Service namespace, 2 Interface, 2 Endpoints
    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/1.0`
    );

    cy.expectInterfacesListToBe(
      expectedInterfacesLocalpartsNamespacesOfServiceLocalpart0
    );

    cy.expectEndpointsListToBe(expectedEndpointsOfServiceLocalpart0);

    // 2) expect to have 1 Service namespace, 1 Interface, 2 Endpoints
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart1`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService1`);

    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/1.0`
    );

    cy.expectInterfacesListToBe([
      `Interface-Localpart1`,
      `http://namespace-example.fr/interface/technique/version/1.0`,
    ]);

    cy.expectEndpointsListToBe(expectedEndpointsOfServiceLocalpart1);

    // 3) expect to have 1 Service namespace, 2 Interfaces, 1 Endpoint
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart2`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService2`);

    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/2.0`
    );

    cy.expectInterfacesListToBe(
      expectedInterfacesLocalpartsNamespacesOfServiceLocalpart2
    );

    cy.expectEndpointsListToBe([`edpt-89p82661-test-31o4-l391-02`]);

    // 4) expect to have 1 Service namespace, 1 Interface, 1 Endpoint
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart3`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService3`);

    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/3.0`
    );

    cy.expectInterfacesListToBe([
      `Interface-Localpart3`,
      `http://namespace-example.fr/interface/technique/version/3.0`,
    ]);

    cy.expectEndpointsListToBe([`edpt-89p82661-test-31o4-l391-03`]);

    // 5) expect to have 1 Service namespace, 5 Interfaces, 5 Endpoints
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart4`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService4`);

    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/3.0`
    );

    cy.expectInterfacesListToBe(
      expectedInterfacesLocalpartsNamespacesOfServiceLocalpart4
    );

    cy.expectEndpointsListToBe(expectedEndpointsOfServiceLocalpart4);
  });

  it(`should go to details of Interface from the view of a selected Service`, () => {
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    cy
      .get(SERVICE_OVERVIEW_DOM.navList.navListInterfaces)
      .contains(`Interface-Localpart0`)
      .click();

    cy.expectLocationToBe(
      `/workspaces/idWks0/services/interfaces/idInterface0`
    );

    cy
      .get(INTERFACE_OVERVIEW_DOM.texts.aboutInterface)
      .contains(`http://namespace-example.fr/interface/technique/version/1.0`)
      .should('be.visible');
  });

  it(`should go to details of Endpoint from the view of a selected Service`, () => {
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart4`);

    cy
      .get(SERVICE_OVERVIEW_DOM.navList.navListEndpoints)
      .contains(`edpt-89p82661-test-31o4-l391-04`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/idEndpoint4`);
  });

  it(`should open the 404 page if the service doesn't exists`, () => {
    cy.visit(`/workspaces/idWks0/services/endpoints/unknownIdService`);

    // We authenticate again because we are in an environment e2e prod and
    // when changing the url manually, it reloads the application through the login page.
    // In this case, we may need to reconsider the fact of this connection via the UI ...
    // See some recipes exemple: https://github.com/cypress-io/cypress-example-recipes
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0/services/not-found`);
  });

  it(`should display a component icon for each Endpoint from the view of a selected Service`, () => {
    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart4`);

    cy.get(`app-workspace-element .mat-tab-body-content`).scrollTo('bottom');

    cy
      .get(SERVICE_OVERVIEW_DOM.listItem.itemEndpoints)
      .find(`mat-icon[svgIcon="component"]`)
      .should('be.visible');
  });

  // ---------------------------- Service Localpart 0 ---------------------------- //

  const expectedInterfacesLocalpartsNamespacesOfServiceLocalpart0 = [
    `Interface-Localpart0`,
    `http://namespace-example.fr/interface/technique/version/1.0`,
    `Interface-Localpart4`,
    `http://namespace-example.fr/interface/technique/version/3.0`,
  ];

  const expectedEndpointsOfServiceLocalpart0 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-04`,
  ];

  // ---------------------------- Service Localpart 1 ---------------------------- //

  const expectedEndpointsOfServiceLocalpart1 = [
    `edpt-89p82661-test-31o4-l391-01`,
    `edpt-89p82661-test-31o4-l391-02`,
  ];

  // ---------------------------- Service Localpart 2 ---------------------------- //

  const expectedInterfacesLocalpartsNamespacesOfServiceLocalpart2 = [
    `Interface-Localpart2`,
    `http://namespace-example.fr/interface/technique/version/2.0`,
    `Interface-Localpart3`,
    `http://namespace-example.fr/interface/technique/version/3.0`,
  ];

  // ---------------------------- Service Localpart 4 ---------------------------- //

  const expectedInterfacesLocalpartsNamespacesOfServiceLocalpart4 = [
    `Interface-Localpart0`,
    `http://namespace-example.fr/interface/technique/version/1.0`,
    `Interface-Localpart1`,
    `http://namespace-example.fr/interface/technique/version/1.0`,
    `Interface-Localpart2`,
    `http://namespace-example.fr/interface/technique/version/2.0`,
    `Interface-Localpart3`,
    `http://namespace-example.fr/interface/technique/version/3.0`,
    `Interface-Localpart4`,
    `http://namespace-example.fr/interface/technique/version/3.0`,
  ];

  const expectedEndpointsOfServiceLocalpart4 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-01`,
    `edpt-89p82661-test-31o4-l391-02`,
    `edpt-89p82661-test-31o4-l391-03`,
    `edpt-89p82661-test-31o4-l391-04`,
  ];
});
