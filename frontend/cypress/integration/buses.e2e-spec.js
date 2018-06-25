import { PETALS_DOM } from '../support/petals.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';

describe('Buses', () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
  });

  it('should clean services on bus deletion', () => {
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

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click();

    cy
      .get('.item-name')
      .contains('Bus 6')
      .click();

    cy.get('.btn-delete-bus').click();

    cy.get('.btn-confirm-delete-bus').click();

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeUpdatedWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeUpdatedWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeUpdatedWks0);
  });

  const expectedInterfacesTreeWks0 = [
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

  const expectedServicesTreeWks0 = [
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

  const expectedEndpointsTreeWks0 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-01`,
    `edpt-89p82661-test-31o4-l391-02`,
    `edpt-89p82661-test-31o4-l391-03`,
    `edpt-89p82661-test-31o4-l391-04`,
    `edpt-69f52660-test-19e9-a769-14`,
    `edpt-69f52660-test-19e9-a769-15`,
  ];

  const expectedInterfacesTreeUpdatedWks0 = [
    `http://namespace-example.fr/interface/technique/version/1.0`,
    `Interface-Localpart0`,
    `Interface-Localpart1`,
    `http://namespace-example.fr/interface/technique/version/2.0`,
    `Interface-Localpart2`,
    `http://namespace-example.fr/interface/technique/version/3.0`,
    `Interface-Localpart3`,
    `Interface-Localpart4`,
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
  ];

  const expectedEndpointsTreeUpdatedWks0 = [
    `edpt-89p82661-test-31o4-l391-00`,
    `edpt-89p82661-test-31o4-l391-01`,
    `edpt-89p82661-test-31o4-l391-02`,
    `edpt-89p82661-test-31o4-l391-03`,
    `edpt-89p82661-test-31o4-l391-04`,
  ];
});
