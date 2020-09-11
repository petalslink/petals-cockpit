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

import { ENDPOINT_OVERVIEW_DOM } from '../../../support/endpoint.dom';
import { PETALS_TREE_DOM } from '../../../support/petals.dom';
import { SERVICE_OVERVIEW_DOM } from '../../../support/service.dom';

describe(`Endpoint`, () => {
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

  it(`should contain the endpoint details overview with service and interfaces`, () => {
    cy.clickElementInTree(`endpoint`, `0-0-0-0-0`);

    // 1) expect to have 1 Bus, 1 Container, 1 Component, 1 Service, 2 Interfaces
    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Service`,
      `edpt-89p82661-test-31o4-l391-00`,
    ]);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.busName).contains(`Bus 0`);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.containerName).contains(`Cont 0`);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.componentName).contains(`Comp 0`);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.serviceLocalpart).contains(`Localpart0`);

    cy
      .get(ENDPOINT_OVERVIEW_DOM.texts.serviceNamespace)
      .contains(`http://namespace-example.fr/service/technique/version/1.0`);

    cy.expectEdpInterfacesListToBe([
      `Interface-Localpart0`,
      `http://namespace-example.fr/interface/technique/version/1.0`,
      `Interface-Localpart1`,
      `http://namespace-example.fr/interface/technique/version/1.0`,
    ]);

    // 2) expect to have 1 Bus, 1 Container, 1 Component, 1 Service, 2 Interfaces
    cy.clickElementInTree(`endpoint`, `1-0-0-0-0`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/4`);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.busName).contains(`Bus 0`);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.containerName).contains(`Cont 0`);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.componentName).contains(`Comp 0`);

    cy.get(ENDPOINT_OVERVIEW_DOM.texts.serviceLocalpart).contains(`Localpart3`);

    cy
      .get(ENDPOINT_OVERVIEW_DOM.texts.serviceNamespace)
      .contains(`http://namespace-example.fr/service/technique/version/3.0`);

    cy.expectEdpInterfacesListToBe([
      `Interface-Localpart2`,
      `http://namespace-example.fr/interface/technique/version/2.0`,
    ]);
  });

  it(`should go to details of Service from the view of a selected Endpoint`, () => {
    cy.clickElementInTree(`endpoint`, `0-0-0-1-0`);

    cy
      .get(ENDPOINT_OVERVIEW_DOM.texts.serviceLocalpart)
      .contains(`Localpart1`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/2`);

    cy
      .get(SERVICE_OVERVIEW_DOM.texts.aboutService)
      .contains(`http://namespace-example.fr/service/technique/version/1.0`)
      .should('be.visible');
  });

  it(`should go to details of Interface from the view of a selected Endpoint`, () => {
    cy.clickElementInTree(`endpoint`, `0-0-0-1-0`);

    cy
      .get(ENDPOINT_OVERVIEW_DOM.texts.interfacesLocalparts)
      .contains(`Interface-Localpart0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/interfaces/1`);
  });

  it(`should open the 404 page if the endpoint doesn't exist`, () => {
    cy.visit(`/workspaces/idWks0/services/endpoints/unknownIdEndpoint`);

    // We authenticate again because we are in an environment e2e prod and
    // when changing the url manually, it reloads the application through the login page.
    // In this case, we may need to reconsider the fact of this connection via the UI ...
    // See some recipes exemple: https://github.com/cypress-io/cypress-example-recipes
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0/services/not-found`);
  });

  it(`should go to details of Bus from the view of a selected Endpoint`, () => {
    cy.clickElementInTree(`endpoint`, `0-0-0-1-0`);

    cy
      .get(ENDPOINT_OVERVIEW_DOM.listItem.itemBus)
      .find(`mat-icon[svgIcon="bus"]`)
      .should('be.visible');

    cy
      .get(ENDPOINT_OVERVIEW_DOM.texts.busName)
      .contains(`Bus 0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus0`);

    cy
      .get(PETALS_TREE_DOM.allNodes)
      .contains('Bus 0')
      .should('be.visible');

    cy.expectMessageToBe(
      `.info-no-bus-description`,
      'info',
      `This topology doesn't have any description.`
    );
  });

  it(`should go to details of Container from the view of a selected Endpoint`, () => {
    cy.clickElementInTree(`endpoint`, `0-0-0-1-0`);

    cy
      .get(ENDPOINT_OVERVIEW_DOM.listItem.itemContainer)
      .contains(`dns`)
      .should('be.visible');

    cy
      .get(ENDPOINT_OVERVIEW_DOM.texts.containerName)
      .contains(`Cont 0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/containers/idCont0`);

    cy.get(`.vis-network`).should('be.visible');
  });

  it(`should go to details of Component from the view of a selected Endpoint`, () => {
    cy.clickElementInTree(`endpoint`, `0-0-0-1-0`);

    cy
      .get(ENDPOINT_OVERVIEW_DOM.listItem.itemComponent)
      .find(`mat-icon[svgIcon="component"]`)
      .should('be.visible');

    cy
      .get(ENDPOINT_OVERVIEW_DOM.texts.componentName)
      .contains(`Comp 0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

    cy.get(`.card-component-lifecycle`).should('be.visible');
  });
});
