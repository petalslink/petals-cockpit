import {
  COMPONENT_DOM,
  COMPONENT_OPERATIONS_DOM,
} from '../support/component.dom';
import { PETALS_DOM, PETALS_TREE_DOM } from '../support/petals.dom';
import { SERVICES_DOM, SERVICES_TREE_DOM } from '../support/services.dom';
import { SERVICE_DOM, SERVICE_OVERVIEW_DOM } from '../support/service.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';
import { WORKSPACES_DOM, WORKSPACES_LIST_DOM } from '../support/workspaces.dom';
import {
  expectedInterfacesTreeWks0,
  expectedServicesTreeWks0,
  expectedEndpointsTreeWks0,
} from '../support/helper.const';

describe(`Service`, () => {
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

  it(`should have the service details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService0`);
  });

  it(`should contain the service details overview with interfaces and endpoints`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    // 1) expect to have 1 Service namespace, 1 Interface, 2 Endpoints
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
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart0`);

    cy
      .get(SERVICE_OVERVIEW_DOM.navList.navListInterfaces)
      .contains(`Interface-Localpart0`)
      .click();

    cy.expectLocationToBe(
      `/workspaces/idWks0/services/interfaces/idInterface0`
    );
  });

  it(`should go to details of Endpoint from the view of a selected Service`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.clickElementInTree(`exp-pnl-services-tree`, `Localpart4`);

    cy
      .get(SERVICE_OVERVIEW_DOM.navList.navListEndpoints)
      .contains(`edpt-89p82661-test-31o4-l391-04`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/idEndpoint4`);
  });

  it(`should open the 404 page if the service doesn't exists`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.visit(`/workspaces/idWks0/services/endpoints/unknownIdService`);

    // We authenticate again because we are in an environment e2e prod and
    // when changing the url manually, it reloads the application through the login page.
    // In this case, we may need to reconsider the fact of this connection via the UI ...
    // See some recipes exemple: https://github.com/cypress-io/cypress-example-recipes
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0/not-found`);
  });

  it(`should have icons component for each Endpoint from the view of a selected Service`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

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

  // ---------------------------- Services Tree ---------------------------- //

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
