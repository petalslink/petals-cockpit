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

import { BREADCRUMB_DOM } from '../../../support/breadcrumb.dom';
import {
  expectedInitializedWks0ServiceTree,
  expectedWks0ServiceTreeAdded,
} from '../../../support/helper.const';
import { MESSAGE_DOM } from '../../../support/message.dom';
import { PETALS_TREE_DOM } from '../../../support/petals.dom';
import { SERVICES_DOM } from '../../../support/services.dom';
import {
  WORKSPACE_BUS_DETACH_DIALOG_DOM,
  WORKSPACE_OVERVIEW_DOM,
} from '../../../support/workspace.dom';

describe(`Services`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it('should active the services button from the sidebar', () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .should(`not.have.class`, `active`)
      .find('.btn-services')
      .click();

    cy
      .get('app-sidebar')
      .find('.sidebar-top>button')
      .eq(2)
      .should('have.attr', 'mattooltip', 'Services')
      .should(`have.class`, `active`);

    // expect to not have service, interface or endpoint selected
    cy.expectLocationToBe(`/workspaces/idWks0/services`);
    cy.expectBreadcrumbsToBe([`Workspace 0`, `Service`]);

    cy
      .get(PETALS_TREE_DOM.allNodes)
      .should('not.have.class', 'selected-element');
  });

  it(`should contain the interface, service, endpoint list on first workspace`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    // expect to have workspace name
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(0)
      .should('contain', 'Workspace 0');

    cy.expectServicesTreeToBe(expectedInitializedWks0ServiceTree);
  });

  it(`should fold/unfold interface, service and endpoint list`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    cy.expectServicesTreeToBe(expectedInitializedWks0ServiceTree);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('interface-namespace', '0'))
      .eq(0)
      .click();

    cy
      .get(
        PETALS_TREE_DOM.buttons.expandableBtn('service-localpart', '1-0-0-0')
      )
      .click();

    cy.expectServicesTreeToBe(serviceTreeWks0Folded);

    cy
      .get(
        PETALS_TREE_DOM.buttons.expandableBtn('service-localpart', '1-0-0-0')
      )
      .click();

    cy.expectServicesTreeToBe(serviceTreeWks0Unfolded);
  });

  it(`should update the interface, service and endpoint list on WORKSPACE_CONTENT event`, () => {
    cy.login('admin', 'admin');

    cy.triggerSSEForWks('Workspace 1', 'idWks1');

    cy.expectServicesTreeToBe(serviceTreeWks1Initialized);

    cy.clickElementInTree(`interface-localpart`, `0-0`);

    cy.expectLocationToBe(`/workspaces/idWks1/services/interfaces/5`);

    cy.clickElementInTree(`service-localpart`, `0-0-0-0`);

    cy.expectLocationToBe(`/workspaces/idWks1/services/services/6`);

    cy.clickElementInTree(`endpoint`, `0-0-0-0-0`);

    cy.expectLocationToBe(`/workspaces/idWks1/services/endpoints/7`);
  });

  it('should refresh services on clicking button', () => {
    cy.login('admin', 'admin');

    // expect to have workspace name
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(0)
      .should('contain', 'Workspace 0');

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    cy.expectServicesTreeToBe(expectedInitializedWks0ServiceTree);

    cy.get(SERVICES_DOM.refreshSpinner).should('not.be.visible');
    cy
      .get(SERVICES_DOM.refreshBtn)
      .should('be.enabled')
      .click();

    cy.get(SERVICES_DOM.refreshSpinner).should('be.visible');
    cy.get(SERVICES_DOM.refreshBtn).should('be.disabled');

    // waiting for refresh button to be enabled again
    cy.get(SERVICES_DOM.refreshSpinner).should('not.be.visible');
    cy.get(SERVICES_DOM.refreshBtn).should('be.enabled');

    cy.expectServicesTreeToBe(serviceTreeWks0Refreshed);
  });

  it('should show removed service as removed when clicking on refresh button', () => {
    cy.login('admin', 'admin');

    // expect to have workspace name
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(0)
      .should('contain', 'Workspace 0');

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    cy.clickElementInTree(`service-localpart`, `0-1-1-0`);

    cy.expectServiceNamespaceToBe(
      `http://namespace-example.fr/service/technique/version/2.0`
    );

    cy
      .get(SERVICES_DOM.refreshBtn)
      .should('be.enabled')
      .click();

    cy.expectServicesTreeToBe(serviceTreeWks0Refreshed);

    // waiting for refresh button to be enabled again
    cy.get(SERVICES_DOM.refreshBtn).should('be.enabled');

    cy
      .get('app-workspace-element')
      .should('contain', 'This service has been removed');
  });

  it('should not show existing service as removed when clicking on refresh button', () => {
    cy.login('admin', 'admin');

    // expect to have workspace name
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(0)
      .should('contain', 'Workspace 0');

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    cy.clickElementInTree(`endpoint`, `0-0-0-0-0`);

    cy
      .get(SERVICES_DOM.refreshBtn)
      .should('be.enabled')
      .click();

    cy.get(SERVICES_DOM.refreshBtn).should('be.disabled');

    // waiting for refresh button to be enabled again
    cy.get(SERVICES_DOM.refreshBtn).should('be.enabled');

    cy
      .get('app-workspace-element')
      .should('not.contain', 'This service has been removed');
  });

  it('should show only searched interfaces, services and endpoints when some text is entered in search bar', () => {
    cy.login('admin', 'admin');

    // expect to have workspace name
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(0)
      .should('contain', 'Workspace 0');

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    cy.expectServicesTreeToBe(expectedInitializedWks0ServiceTree);

    // search 1.0
    cy.get(SERVICES_DOM.inputs.search).type('1.0');

    cy.expectServicesTreeToBe(serviceTreeWks0Searched10, 'filtered');

    // search Localpart4
    cy
      .get(SERVICES_DOM.inputs.search)
      .clear()
      .type('Localpart4');

    cy.expectServicesTreeToBe(serviceTreeWks0SearchedLocalpart, 'filtered');

    cy
      .get(SERVICES_DOM.inputs.search)
      .clear()
      .type('01');

    // no result search
    cy
      .get(SERVICES_DOM.inputs.search)
      .clear()
      .type(`Some random search`)
      .expectFocused();

    cy
      .get(MESSAGE_DOM.texts.msgDetails)
      .contains('There is no match with "Some random search".');

    cy.get(MESSAGE_DOM.buttons.cancelMessage).click();

    cy.get(SERVICES_DOM.inputs.search).should('be.empty');

    cy.expectServicesTreeToBe(expectedInitializedWks0ServiceTree);
  });

  it('should remove concerned services on bus deletion', () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.addBusImportInformations(
      '192.168.0.1',
      '7700',
      'admin',
      'password',
      'passphrase'
    );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus)
      .should('be.enabled')
      .click();

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectServicesTreeToBe(expectedWks0ServiceTreeAdded);

    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(0)
      .click();

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editDetachBus).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus)
      .contains('Bus 2')
      .click({ force: true });

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDetachBus)
      .should('be.enabled')
      .click()
      .should('be.disabled');

    cy.get(WORKSPACE_BUS_DETACH_DIALOG_DOM.buttons.submit).click();

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectServicesTreeToBe(expectedInitializedWks0ServiceTree);
  });
});

const serviceTreeWks0Folded = [
  {
    elementName: `http://namespace-example.fr/interface/technique/version/1.0`,
  },
  {
    elementName: `http://namespace-example.fr/interface/technique/version/2.0`,
  },
  { elementName: `Interface-Localpart2` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/3.0`,
  },
  { elementName: `Localpart3` },
  {
    elementName: `http://namespace-example.fr/interface/technique/version/3.0`,
  },
  { elementName: `Interface-Localpart3` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/3.0`,
  },
  { elementName: `Localpart4` },
  { elementName: `edpt-89p82661-test-31o4-l391-05` },
];

const serviceTreeWks0Unfolded = [
  {
    elementName: `http://namespace-example.fr/interface/technique/version/1.0`,
  },
  {
    elementName: `http://namespace-example.fr/interface/technique/version/2.0`,
  },
  { elementName: `Interface-Localpart2` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/3.0`,
  },
  { elementName: `Localpart3` },
  { elementName: `edpt-89p82661-test-31o4-l391-03` },
  { elementName: `edpt-89p82661-test-31o4-l391-04` },

  {
    elementName: `http://namespace-example.fr/interface/technique/version/3.0`,
  },
  { elementName: `Interface-Localpart3` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/3.0`,
  },
  { elementName: `Localpart4` },
  { elementName: `edpt-89p82661-test-31o4-l391-05` },
];

const serviceTreeWks0Refreshed = [
  {
    elementName: `http://namespace-example.fr/interface/technique/version/1.0`,
  },
  { elementName: `Interface-Localpart0` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/1.0`,
  },
  { elementName: `Localpart1` },
  { elementName: `edpt-89p82661-test-31o4-l391-00` },
  { elementName: `Interface-LocalpartRefreshed0` },
  { elementName: `http://namespace-example.fr/service/metiers/version/1.0` },
  { elementName: `Localpart1` },
  { elementName: `edpt-89p82661-refr-31o4-l391-10` },
  { elementName: `Interface-LocalpartRefreshed1` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/1.0`,
  },
  { elementName: `LocalpartRefreshed0` },
  { elementName: `edpt-89p82661-refr-31o4-l391-01` },
];

const serviceTreeWks0Searched10 = [
  {
    elementName: `http://namespace-example.fr/interface/technique/version/1.0`,
  },
  { elementName: `Interface-Localpart0` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/1.0`,
  },
  { elementName: `Interface-Localpart1` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/1.0`,
  },
];

const serviceTreeWks0SearchedLocalpart = [
  {
    elementName: `http://namespace-example.fr/interface/technique/version/3.0`,
  },
  { elementName: `Interface-Localpart3` },
  {
    elementName: `http://namespace-example.fr/service/technique/version/3.0`,
  },
  { elementName: `Localpart4` },
];

const serviceTreeWks1Initialized = [
  {
    elementName: `http://namespace-example.fr/interface/metiers/version/1.0`,
  },
  { elementName: `Interface-Localpart0` },
  { elementName: `http://namespace-example.fr/service/metiers/version/1.0` },
  { elementName: `Localpart0` },
  { elementName: `edpt-89p82661-test-31o4-l391-05` },
  { elementName: `Interface-Localpart1` },
  { elementName: `http://namespace-example.fr/service/metiers/version/1.0` },
  { elementName: `Localpart1` },
  { elementName: `edpt-89p82661-test-31o4-l391-06` },
];
