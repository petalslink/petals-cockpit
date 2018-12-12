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

import {
  expectedEndpointsTreeWks0,
  expectedInterfacesTreeWks0,
  expectedServicesTreeWks0,
} from '../../support/helper.const';
import { IMPORT_BUS_DOM } from '../../support/import-bus.dom';
import { PETALS_DOM } from '../../support/petals.dom';
import { WORKSPACE_DOM } from '../../support/workspace.dom';

describe(`Import Bus `, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should have empty fields by default`, () => {
    cy.login('admin', 'admin');

    cy.get(PETALS_DOM.buttons.addBus).click();

    cy.expectBusImportFields().should('be.empty');

    cy.get(IMPORT_BUS_DOM.buttons.clear).should('be.visible');
    cy.get(IMPORT_BUS_DOM.buttons.submit).should('be.disabled');
    cy.get(IMPORT_BUS_DOM.buttons.discard).should('not.be.visible');
  });

  it(`should be cleared when clicking on the clear button`, () => {
    cy.login('admin', 'admin');

    cy.get(PETALS_DOM.buttons.addBus).click();

    cy.addBusImportInformations(
      'ip',
      '7700',
      'admin',
      'password',
      'passphrase'
    );

    cy.get(IMPORT_BUS_DOM.buttons.clear).click();

    cy.expectBusImportFields().should('be.empty');
  });

  it(`should import a new bus with the interface, service, endpoint list on BUS_IMPORT_OK event`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click();

    cy.get(PETALS_DOM.buttons.addBus).click();

    cy.importBusAndCheck(
      '192.168.0.1',
      '7700',
      'admin',
      'password',
      'passphrase'
    );

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeUpdatedWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeUpdatedWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeUpdatedWks0);
  });

  // TODO: test inconsistently failing
  // see https://gitlab.com/linagora/petals-cockpit/issues/439
  // it(`shouldn't select the first input of the bus form on mobile`, () => {
  //   cy.viewport(412, 732);

  //   cy.login('admin', 'admin');

  //   cy.expectLocationToBe(`/workspaces/idWks0`);

  //   cy.get(PETALS_DOM.buttons.addBus).click();

  //   cy.document().then(document => expect(document.hasFocus()).to.eq(false));
  // });

  const expectedInterfacesTreeUpdatedWks0 = [
    `http://namespace-example.fr/interface/technique/version/1.0`,
    `Interface-Localpart0`,
    `Interface-Localpart1`,
    `http://namespace-example.fr/interface/technique/version/2.0`,
    `Interface-Localpart2`,
    `http://namespace-example.fr/interface/technique/version/3.0`,
    `Interface-Localpart3`,
    `Interface-Localpart4`,
    `http://namespace-example.fr/interface/technique/version/14.0`,
    `Interface-Localpart14`,
    `http://namespace-example.fr/interface/technique/version/15.0`,
    `Interface-Localpart15`,
    `http://namespace-example.fr/interface/technique/version/16.0`,
    `Interface-Localpart16`,
    `http://namespace-example.fr/interface/technique/version/17.0`,
    `Interface-Localpart17`,
    `http://namespace-example.fr/interface/technique/version/18.0`,
    `Interface-Localpart18`,
    `http://namespace-example.fr/interface/technique/version/19.0`,
    `Interface-Localpart19`,
  ];

  const expectedServicesTreeUpdatedWks0 = [
    `http://namespace-example.fr/service/technique/version/1.0`,
    `Localpart0`,
    `Localpart1`,
    `http://namespace-example.fr/service/technique/version/2.0`,
    `Localpart2`,
    `http://namespace-example.fr/service/technique/version/3.0`,
    `Localpart3`,
    `Localpart4`,
    `http://namespace-example.fr/service/technique/version/14.0`,
    `Localpart14`,
    `http://namespace-example.fr/service/technique/version/15.0`,
    `Localpart15`,
    `http://namespace-example.fr/service/technique/version/16.0`,
    `Localpart16`,
    `http://namespace-example.fr/service/technique/version/17.0`,
    `Localpart17`,
    `http://namespace-example.fr/service/technique/version/18.0`,
    `Localpart18`,
    `http://namespace-example.fr/service/technique/version/19.0`,
    `Localpart19`,
  ];

  const expectedEndpointsTreeUpdatedWks0 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-01`,
    `edpt-89p82661-test-31o4-l391-02`,
    `edpt-89p82661-test-31o4-l391-03`,
    `edpt-89p82661-test-31o4-l391-04`,
    `edpt-69f52660-test-19e9-a769-14`,
    `edpt-69f52660-test-19e9-a769-15`,
  ];
});
