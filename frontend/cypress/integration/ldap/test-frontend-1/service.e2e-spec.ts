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
    cy.clickElementInTree(`service-localpart`, `0-0-0-0`);

    // 1) expect to have 1 Service namespace, 1 Interface, 1 Endpoints
    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/1.0`
    );

    cy.expectInterfacesListToBe([
      `Interface-Localpart0`,
      `http://namespace-example.fr/interface/technique/version/1.0`,
      `Interface-Localpart1`,
      `http://namespace-example.fr/interface/technique/version/1.0`,
    ]);

    cy.expectEndpointsListToBe([`edpt-89p82661-test-31o4-l391-00`]);

    // 2) expect to have 1 Service namespace, 1 Interface, 2 Endpoints
    cy.clickElementInTree(`service-localpart`, `1-0-0-0`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/4`);

    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/3.0`
    );

    cy.expectInterfacesListToBe([
      `Interface-Localpart2`,
      `http://namespace-example.fr/interface/technique/version/2.0`,
    ]);

    cy.expectEndpointsListToBe([
      `edpt-89p82661-test-31o4-l391-03`,
      `edpt-89p82661-test-31o4-l391-04`,
    ]);
  });

  it(`should go to details of Interface from the view of a selected Service`, () => {
    cy.clickElementInTree(`service-localpart`, `0-0-0-0`);

    cy
      .get(SERVICE_OVERVIEW_DOM.navList.navListInterfaces)
      .contains(`Interface-Localpart0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/interfaces/1`);

    cy
      .get(INTERFACE_OVERVIEW_DOM.texts.aboutInterface)
      .contains(`http://namespace-example.fr/interface/technique/version/1.0`)
      .should('be.visible');
  });

  it(`should go to details of Endpoint from the view of a selected Service`, () => {
    cy.clickElementInTree(`service-localpart`, `0-0-0-0`);

    cy
      .get(SERVICE_OVERVIEW_DOM.navList.navListEndpoints)
      .contains(`edpt-89p82661-test-31o4-l391-00`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/1`);
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
});
