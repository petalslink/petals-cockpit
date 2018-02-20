import {
  COMPONENT_DOM,
  COMPONENT_OPERATIONS_DOM,
} from '../support/component.dom';
import { PETALS_DOM, PETALS_TREE_DOM } from '../support/petals.dom';
import { SERVICES_DOM, SERVICES_TREE_DOM } from '../support/services.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';
import { WORKSPACES_DOM, WORKSPACES_LIST_DOM } from '../support/workspaces.dom';
import { expectedServicesTreeWks0 } from '../support/helper.const';

describe(`Service`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should contain a services tree on first workspace`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);
  });

  it(`should contain a new services tree after loading other workspace`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy.expectWorkspacesListToBe([`Workspace 0`, `Workspace 1`]);

    const workspacesListNames = cy.get(WORKSPACES_LIST_DOM.texts.workspaceName);

    workspacesListNames.contains(`Workspace 1`).click();

    cy.expectLocationToBe(`/workspaces/idWks1`);

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 1`);

    cy.expectServicesTreeToBe(expectedServicesTreeWks1);

    cy.getElementInServicesTree(`item-name`, `Localpart0`).click();

    cy.expectLocationToBe(`/workspaces/idWks1/services/idService12`);
  });

  it(`should go to service details`, () => {
    cy.login('admin', 'admin');

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.getElementInServicesTree(`item-name`, `Localpart0`).click();

    cy.expectLocationToBe(`/workspaces/idWks0/services/idService0`);
  });

  it(`should update the service list after status change of Comp 0, Comp 1 and Comp 2`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 0`);

    // test comp 0
    cy.getElementInPetalsTree(`component`, `Comp 0`).click();

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectServicesTreeToBe(expectedServicesTreeWks0);

    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

    cy
      .get(COMPONENT_DOM.tabs)
      .contains(`Operations`)
      .click();

    cy.getActionStateInLifecycleComponent(`Stop`).click();

    // check if in services tree, we have 1 localpart in each of the namespaces
    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp0);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click();

    // test comp 1
    cy.getElementInPetalsTree(`component`, `Comp 1`).click();

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp1`);

    cy
      .get(COMPONENT_DOM.tabs)
      .contains(`Operations`)
      .click();

    cy.getActionStateInLifecycleComponent(`Stop`).click();

    // check if in services tree, we have 2 localparts for the same namespace
    cy.expectServicesTreeToBe(expectedServicesTreeActionStateComp1);

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click();

    // test comp 2
    cy.getElementInPetalsTree(`component`, `Comp 2`).click();

    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);

    cy
      .get(COMPONENT_DOM.tabs)
      .contains(`Operations`)
      .click();

    cy.getActionStateInLifecycleComponent(`Stop`).click();

    // check if we have no services
    cy.get(SERVICES_TREE_DOM.texts.servicesNames).should('have.length', 0);
  });

  const expectedServicesTreeWks1 = [
    `http://namespace-example.fr/service/metiers/version/1.0`,
    `Localpart0`,
    `Localpart1`,
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
    `http://namespace-example.fr/ser.../pays/internationalversion/1.0`,
    `Localpart96`,
    `http://namespace-example.fr/ser...pays/international/version/1.0`,
    `Localpart97`,
  ];
});
