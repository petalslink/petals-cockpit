import {
  COMPONENT_DOM,
  COMPONENT_OVERVIEW_DOM,
  COMPONENT_OPERATIONS_DOM,
} from './component.dom';

Cypress.Commands.add('getActionStateInLifecycleComponent', name => {
  return cy.get(COMPONENT_OPERATIONS_DOM.buttons.actionState).contains(name);
});
