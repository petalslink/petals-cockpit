import { COMPONENT_DOM } from '../../support/component.dom';
import { SERVICES_TREE_DOM, SERVICES_DOM } from '../../support/services.dom';
import { WORKSPACE_DOM } from '../../support/workspace.dom';
import { WORKSPACES_LIST_DOM } from '../../support/workspaces.dom';
import { PETALS_COCKPIT_DOM } from '../../support/petals-cockpit.dom';
import {
  expectedInterfacesTreeWks0,
  expectedServicesTreeWks0,
  expectedEndpointsTreeWks0,
} from '../../support/helper.const';

describe(`Services`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should contain the interface, service, endpoint list on first workspace`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);
  });

  it(`should toggle visibility of the interface, service and endpoint list`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy
      .expectInterfacesTreeToBe(expectedInterfacesTreeWks0)
      .should('have.length', 1);

    cy
      .expectServicesTreeToBe(expectedServicesTreeWks0)
      .should('have.length', 1);

    cy
      .expectEndpointsTreeToBe(expectedEndpointsTreeWks0)
      .should('have.length', 1);

    cy
      .get(SERVICES_TREE_DOM.texts.title)
      .contains(`Interface Names`)
      .click({ force: true });

    cy.get(SERVICES_TREE_DOM.texts.interfacesNames).should('not.be.visible');

    cy
      .get(SERVICES_TREE_DOM.texts.title)
      .contains(`Service Names`)
      .click({ force: true });

    cy.get(SERVICES_TREE_DOM.texts.servicesNames).should('not.be.visible');

    cy
      .get(SERVICES_TREE_DOM.texts.title)
      .contains(`Endpoint Names`)
      .click({ force: true });

    cy.get(SERVICES_TREE_DOM.texts.endpointsNames).should('not.be.visible');
  });

  it(`should update the interface, service and endpoint list on WORKSPACE_CONTENT event`, () => {
    cy.login('admin', 'admin');

    cy.triggerSSEForWks('Workspace 1', 'idWks1');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks1);

    cy.expectServicesTreeToBe(expectedServicesTreeWks1);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks1);

    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart0`);

    cy.expectLocationToBe(
      `/workspaces/idWks1/services/interfaces/idInterface12`
    );

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    cy.expectLocationToBe(`/workspaces/idWks1/services/services/idService12`);

    cy.clickElementInTree(
      `exp-pnl-endpoints-tree`,
      `edpt-89p82661-test-31o4-l391-05`
    );

    cy.expectLocationToBe(`/workspaces/idWks1/services/endpoints/idEndpoint12`);
  });

  it(`should go to interface details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-interfaces-tree`, `Interface-Localpart0`);

    cy.expectLocationToBe(
      `/workspaces/idWks0/services/interfaces/idInterface0`
    );
  });

  it(`should go to service details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService0`);
  });

  it(`should go to endpoints details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(
      `exp-pnl-endpoints-tree`,
      `edpt-89p82661-test-31o4-l391-00`
    );

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/idEndpoint0`);
  });

  it(`should update the service, endpoint list on SERVICE_UPDATED event`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy.triggerSSEForComp('Comp 0', 'idComp0');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeActionStateComp0);

    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeActionStateComp0);
  });

  it(`should group interfaces and services by namespace even when modified`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy.triggerSSEForComp('Comp 1', 'idComp1');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeActionStateComp1);

    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp1);
  });

  it(`should clean all services, endpoints on empty SERVICE_UPDATED event`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy.triggerSSEForComp('Comp 2', 'idComp2');

    cy.get(SERVICES_TREE_DOM.texts.interfacesNames).should('have.length', 0);

    cy.get(SERVICES_TREE_DOM.texts.servicesNames).should('have.length', 0);

    cy.get(SERVICES_TREE_DOM.texts.endpointsNames).should('have.length', 0);
  });

  it(`should update interface, services, endpoints even when not on services tab`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click();

    cy.getElementInPetalsTree(`component`, 'Comp 1').click();

    cy
      .get(COMPONENT_DOM.tabs)
      .contains(`Operations`)
      .click();

    cy.getActionStateInLifecycleComponent(`Stop`).click();

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeActionStateComp1);

    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp1);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeActionStateComp1);
  });

  it('should refresh services on clicking button', () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);

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

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeRefreshedWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeRefreshedWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeRefreshedWks0);
  });

  it('should show removed service as removed when clicking on refresh button', () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    cy
      .get(SERVICES_DOM.refreshBtn)
      .should('be.enabled')
      .click();

    cy.get(SERVICES_DOM.refreshBtn).should('be.disabled');

    // waiting for refresh button to be enabled again
    cy.get(SERVICES_DOM.refreshBtn).should('be.enabled');

    cy
      .get('app-workspace-element')
      .should('contain', 'This service has been removed');
  });

  it('should not show existing service as removed when clicking on refresh button', () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart1`);

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

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains('Workspace 0');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains('Services')
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);

    cy.get(SERVICES_DOM.inputs.search).type('1.0');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeSearch1dot0);

    cy.expectServicesTreeToBe(expectedServicesTreeSearch1dot0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeSearch1dot0);

    cy
      .get(SERVICES_DOM.inputs.search)
      .clear()
      .type('Localpart4');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeSearchLocalpart4);

    cy.expectServicesTreeToBe(expectedServicesTreeSearchLocalpart4);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeSearchLocalpart4);

    cy
      .get(SERVICES_DOM.inputs.search)
      .clear()
      .type('01');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeSearch01);

    cy.expectServicesTreeToBe(expectedServicesTreeSearch01);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeSearch01);

    cy.get(SERVICES_DOM.inputs.search).type('23456789');

    cy.expectInterfacesTreeToBe([]);

    cy.expectServicesTreeToBe([]);

    cy.expectEndpointsTreeToBe([]);

    cy.get(SERVICES_DOM.inputs.search).clear();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);
  });

  it('should reset services search when changing page', () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains('Workspace 0');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains('Services')
      .click();

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);

    cy.get(SERVICES_DOM.inputs.search).type('1.0');

    cy.get(SERVICES_DOM.inputs.search).should('have.value', '1.0');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeSearch1dot0);

    cy.expectServicesTreeToBe(expectedServicesTreeSearch1dot0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeSearch1dot0);

    cy.get(PETALS_COCKPIT_DOM.buttons.logo).click();

    cy
      .get(WORKSPACES_LIST_DOM.texts.workspaceName)
      .contains(`Workspace 0`)
      .click();

    cy.get(SERVICES_DOM.inputs.search).should('not.have.value', '1.0');

    cy.expectInterfacesTreeToBe(expectedInterfacesTreeWks0);

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);
  });

  const expectedInterfacesTreeSearch1dot0 = [
    'http://namespace-example.fr/interface/technique/version/1.0',
    'Interface-Localpart0',
    'Interface-Localpart1',
    'http://namespace-example.fr/interface/technique/version/2.0',
    'Interface-Localpart2',
    'http://namespace-example.fr/interface/technique/version/3.0',
    'Interface-Localpart3',
    'Interface-Localpart4',
  ];

  const expectedServicesTreeSearch1dot0 = [
    'http://namespace-example.fr/service/technique/version/1.0',
    'Localpart0',
    'Localpart1',
    'http://namespace-example.fr/service/technique/version/2.0',
    'Localpart2',
    'http://namespace-example.fr/service/technique/version/3.0',
    'Localpart3',
    'Localpart4',
  ];

  const expectedEndpointsTreeSearch1dot0 = [];

  const expectedInterfacesTreeSearchLocalpart4 = [
    'http://namespace-example.fr/interface/technique/version/3.0',
    'Interface-Localpart4',
  ];

  const expectedServicesTreeSearchLocalpart4 = [
    'http://namespace-example.fr/service/technique/version/3.0',
    'Localpart4',
  ];

  const expectedEndpointsTreeSearchLocalpart4 = [];

  const expectedInterfacesTreeSearch01 = [];

  const expectedServicesTreeSearch01 = [];

  const expectedEndpointsTreeSearch01 = ['edpt-89p82661-test-31o4-l391-01'];

  const expectedInterfacesTreeWks1 = [
    `http://namespace-example.fr/interface/metiers/version/1.0`,
    `Interface-Localpart0`,
    `Interface-Localpart1`,
  ];

  const expectedServicesTreeWks1 = [
    `http://namespace-example.fr/service/metiers/version/1.0`,
    `Localpart0`,
    `Localpart1`,
  ];

  const expectedEndpointsTreeWks1 = [
    `edpt-89p82661-test-31o4-l391-05`,
    `edpt-89p82661-test-31o4-l391-06`,
  ];

  const expectedInterfacesTreeRefreshedWks0 = [
    `http://namespace-example.fr/interface/technique/version/1.0`,
    `Interface-LocalpartRefreshed0`,
    `Interface-LocalpartRefreshed1`,
  ];

  const expectedServicesTreeRefreshedWks0 = [
    `http://namespace-example.fr/service/technique/version/1.0`,
    `LocalpartRefreshed0`,
    `LocalpartRefreshed1`,
    `http://namespace-example.fr/service/metiers/version/1.0`,
    `Localpart1`,
  ];

  const expectedEndpointsTreeRefreshedWks0 = [
    `edpt-89p82661-refr-31o4-l391-00`,
    `edpt-89p82661-refr-31o4-l391-01`,
  ];

  const expectedInterfacesTreeActionStateComp0 = [
    `http://namespace-example.fr/interface/technique/version/1.0`,
    `Interface-Localpart97`,
    `http://namespace-example.fr/interface/technique/version/2.0`,
    `Interface-Localpart97`,
  ];

  const expectedInterfacesTreeActionStateComp1 = [
    `http://namespace-example.fr/int...ntal/international/version/1.0`,
    `Interface-Localpart98`,
    `Interface-Localpart99`,
    `http://namespace-example.fr/int...pays/international/version/1.0`,
    `Interface-Localpart96`,
    `http://namespace-example.fr/int...pays/international/version/1.0`,
    `Interface-Localpart97`,
  ];

  const expectedServicesTreeActionStateComp0 = [
    `http://namespace-example.fr/service/technique/version/1.0`,
    `Localpart97`,
    `http://namespace-example.fr/service/technique/version/2.0`,
    `Localpart97`,
  ];

  const expectedServicesTreeActionStateComp1 = [
    `http://namespace-example.fr/ser...ntal/international/version/1.0`,
    `Localpart98`,
    `Localpart99`,
    `http://namespace-example.fr/ser...pays/international/version/1.0`,
    `Localpart96`,
    `http://namespace-example.fr/ser...pays/international/version/1.0`,
    `Localpart97`,
  ];

  const expectedEndpointsTreeActionStateComp0 = [
    `edpt-13f82663-test-91i4-a147-3`,
    `edpt-13f82663-test-91i4-a147-1`,
  ];

  const expectedEndpointsTreeActionStateComp1 = [
    `edpt-13f82663-test-91i4-a147-2`,
    `edpt-13f82663-test-91i4-a147-3`,
  ];
});
