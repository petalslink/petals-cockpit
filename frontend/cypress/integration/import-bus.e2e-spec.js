import { IMPORT_BUS_DOM } from '../support/import-bus.dom';
import { PETALS_COCKPIT_DOM } from '../support/petals-cockpit.dom';
import { PETALS_DOM, BIP_DOM } from '../support/petals.dom';
import { MESSAGE_DOM } from '../support/message.dom';
import { NOTIFICATION_DOM } from '../support/notification.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';
import { WORKSPACES_LIST_DOM } from '../support/workspaces.dom';
import { SERVICES_TREE_DOM } from '../support/services.dom';
import {
  expectedServicesTreeWks0,
  expectedEndpointsTreeWks0,
} from '../support/helper.const';

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

  it(`should import a new bus with the service, endpoint list on BUS_IMPORT_OK event`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

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
