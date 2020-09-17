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

import { INTERFACE_VIEW_DOM } from '../../../support/interface.dom';
import { SERVICE_VIEW_DOM } from './../../../support/service.dom';

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
    cy.expectBreadcrumbsToBe([`Workspace 0`, `Service`]);
  });

  it(`should contain the service details overview with interfaces and endpoints`, () => {
    cy.clickElementInTree(`interface-localpart`, `0-0`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/interfaces/1`);

    // 1) expect to have 1 Interface namespace, 2 Services, 2 Endpoints
    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Service`,
      `http://namespace-example.fr/interface/technique/version/1.0`,
    ]);

    cy.expectServicesListToBe([
      `Localpart0`,
      `http://namespace-example.fr/service/technique/version/1.0`,
      `Localpart1`,
      `http://namespace-example.fr/service/technique/version/1.0`,
    ]);

    cy.expectEndpointsItfListToBe(interface1EndpointsList);

    //  // 2) expect to have 1 Service namespace, 1 Interface, 2 Endpoints
    cy.clickElementInTree(`interface-localpart`, `2-0`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/interfaces/4`);

    cy.expectServicesListToBe([
      `Localpart4`,
      `http://namespace-example.fr/service/technique/version/3.0`,
    ]);

    cy.expectEndpointsItfListToBe(interface4EndpointsList);
  });

  it(`should go to details of Service from the view of a selected Interface`, () => {
    cy.clickElementInTree(`interface-localpart`, `2-0`);

    cy
      .get(INTERFACE_VIEW_DOM.texts.relatedElements.serviceLocalpart('5'))
      .contains(`Localpart4`);

    cy
      .get(INTERFACE_VIEW_DOM.texts.relatedElements.serviceNamespace('5'))
      .contains(`http://namespace-example.fr/service/technique/version/3.0`);

    cy.get(INTERFACE_VIEW_DOM.buttons.serviceBtn('5')).click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/5`);

    cy
      .get(SERVICE_VIEW_DOM.texts.relatedElements.interfaceNamespace('4'))
      .contains(`http://namespace-example.fr/interface/technique/version/3.0`)
      .should('be.visible');
  });

  it(`should go to details of Endpoint from the view of a selected Interface`, () => {
    cy.clickElementInTree(`interface-localpart`, `2-0`);

    cy.get(INTERFACE_VIEW_DOM.texts.details.endpoint('6')).should('exist');
    cy
      .get(INTERFACE_VIEW_DOM.texts.details.endpoint('6'))
      .find('>' + INTERFACE_VIEW_DOM.texts.details.endpointName)
      .contains('edpt-89p82661-test-31o4-l391-05');

    cy
      .get(INTERFACE_VIEW_DOM.texts.details.endpoint('6'))
      .find(INTERFACE_VIEW_DOM.buttons.endpointBtn)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/6`);
  });

  it(`should open the 404 page if the interface doesn't exists`, () => {
    cy.visit(`/workspaces/idWks0/services/interfaces/unknownIdInterfaces`);

    // We authenticate again because we are in an environment e2e prod and
    // when changing the url manually, it reloads the application through the login page.
    // In this case, we may need to reconsider the fact of this connection via the UI ...
    // See some recipes exemple: https://github.com/cypress-io/cypress-example-recipes
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0/services/not-found`);
  });
});

export const interface1EndpointsList = [
  {
    name: 'edpt-89p82661-test-31o4-l391-00',
    interfaces: ['Interface-Localpart0', 'Interface-Localpart1'],
    component: 'Comp 0',
    container: 'Cont 0',
    bus: 'Bus 0',
  },
  {
    name: 'edpt-89p82661-test-31o4-l391-01',
    interfaces: ['Interface-Localpart0'],
    component: 'Comp 0',
    container: 'Cont 0',
    bus: 'Bus 0',
  },
];

export const interface4EndpointsList = [
  {
    name: 'edpt-89p82661-test-31o4-l391-05',
    interfaces: ['Interface-Localpart3'],
    component: 'Comp 0',
    container: 'Cont 0',
    bus: 'Bus 0',
  },
];
