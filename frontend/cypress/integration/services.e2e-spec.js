import {
  COMPONENT_DOM,
  COMPONENT_OPERATIONS_DOM,
} from '../support/component.dom';
import { PETALS_DOM, PETALS_TREE_DOM } from '../support/petals.dom';
import { SERVICES_DOM, SERVICES_TREE_DOM } from '../support/services.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';
import { WORKSPACES_DOM, WORKSPACES_LIST_DOM } from '../support/workspaces.dom';
import {
  expectedServicesTreeWks0,
  expectedEndpointsTreeWks0,
} from '../support/helper.const';

describe(`Service`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should contain the service, endpoint list on first workspace`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks0);
  });

  it(`should update the service, endpoint list on WORKSPACE_CONTENT event`, () => {
    cy.login('admin', 'admin');

    cy.triggerSSEForWks('Workspace 1', 'idWks1');

    cy.expectServicesTreeToBe(expectedServicesTreeWks1);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeWks1);

    cy.getTargetedElementInTree(`item-name`, `Localpart0`).click();

    cy.expectLocationToBe(`/workspaces/idWks1/services/services/idService12`);

    cy
      .getTargetedElementInTree(`item-name`, `edpt-89p82661-test-31o4-l391-05`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks1/services/endpoints/idEndpoint12`);
  });

  it(`should go to service details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.getTargetedElementInTree(`item-name`, `Localpart0`).click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/services/idService0`);
  });

  it(`should go to endpoints details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy
      .getTargetedElementInTree(`item-name`, `edpt-89p82661-test-31o4-l391-00`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/endpoints/idEndpoint0`);
  });

  it(`should update the service, endpoint list on SERVICE_UPDATED event`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy.triggerSSEForComp('Comp 0', 'idComp0');

    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp0);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeActionStateComp0);
  });

  it(`should group services by namespace even when modified`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy.triggerSSEForComp('Comp 1', 'idComp1');

    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp1);
  });

  it(`should clean all services, endpoints on empty SERVICE_UPDATED event`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy.triggerSSEForComp('Comp 2', 'idComp2');

    cy.get(SERVICES_TREE_DOM.texts.servicesNames).should('have.length', 0);

    cy.get(SERVICES_TREE_DOM.texts.endpointsNames).should('have.length', 0);
  });

  it(`should update services, endpoints even when not on services tab`, () => {
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

    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp1);

    cy.expectEndpointsTreeToBe(expectedEndpointsTreeActionStateComp1);
  });

  const expectedServicesTreeWks1 = [
    `http://namespace-example.fr/service/metiers/version/1.0`,
    `Localpart0`,
    `Localpart1`,
  ];

  const expectedEndpointsTreeWks1 = [
    `edpt-89p82661-test-31o4-l391-05`,
    `edpt-89p82661-test-31o4-l391-06`,
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
