import { SERVICES_DOM, SERVICES_TREE_DOM } from './services.dom';
import { COMPONENT_DOM } from './component.dom';
import { WORKSPACE_DOM } from './workspace.dom';
import { WORKSPACES_LIST_DOM } from './workspaces.dom';

Cypress.Commands.add('expectInterfacesTreeToBe', tree => {
  cy
    .get(SERVICES_TREE_DOM.expPanel.expPanelInterfaces)
    .should('have.class', 'mat-expanded');

  const interfacesNames = cy.get(SERVICES_TREE_DOM.texts.interfacesNames);
  interfacesNames.should('have.length', tree.length);
  interfacesNames.each(($item, index) => cy.contains(tree[index]));
});

Cypress.Commands.add('expectServicesTreeToBe', tree => {
  cy
    .get(SERVICES_TREE_DOM.expPanel.expPanelServices)
    .should('have.class', 'mat-expanded');

  const servicesNames = cy.get(SERVICES_TREE_DOM.texts.servicesNames);
  servicesNames.should('have.length', tree.length);
  servicesNames.each(($item, index) => cy.contains(tree[index]));
});

Cypress.Commands.add('expectEndpointsTreeToBe', tree => {
  cy
    .get(SERVICES_TREE_DOM.expPanel.expPanelEndpoints)
    .should('have.class', 'mat-expanded');

  const endpointsNames = cy.get(SERVICES_TREE_DOM.texts.endpointsNames);
  endpointsNames.should('have.length', tree.length);
  endpointsNames.each(($item, index) => cy.contains(tree[index]));
});

Cypress.Commands.add('clickElementInTree', (expPanel, name) => {
  // Type can be: namespace, localpart, endpoint, interface
  // Visibility bugged: we force the action to click to disables waiting for actionability
  return cy
    .get(`.item-name`)
    .parents(`.${expPanel}`)
    .contains(name)
    .click({ force: true });
});

Cypress.Commands.add('triggerSSEForComp', (name, id) => {
  cy
    .get(WORKSPACE_DOM.tabs)
    .contains(`Petals`)
    .click();

  cy.getElementInPetalsTree(`component`, name).click();

  cy.expectLocationToBe(`/workspaces/idWks0/petals/components/${id}`);

  // TODO: we should check the state of the component when we migrate the component tests made with Protractor

  cy
    .get(WORKSPACE_DOM.tabs)
    .contains(`Services`)
    .click();

  cy
    .get(COMPONENT_DOM.tabs)
    .contains(`Operations`)
    .click();

  cy.getActionStateInLifecycleComponent(`Stop`).click();

  // TODO: we should check the state of the component when we migrate the component tests made with Protractor
});

Cypress.Commands.add('triggerSSEForWks', (name, id) => {
  cy
    .get(WORKSPACE_DOM.tabs)
    .contains(`Services`)
    .click();

  cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

  cy.expectWorkspacesListToBe([`Workspace 0`, `Workspace 1`]);

  const workspacesListNames = cy.get(WORKSPACES_LIST_DOM.texts.workspaceName);

  workspacesListNames.contains(`Workspace 1`).click();

  cy.expectLocationToBe(`/workspaces/${id}`);

  cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 1`);
});
