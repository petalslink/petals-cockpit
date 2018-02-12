import { SERVICES_DOM, SERVICES_TREE_DOM } from './services.dom';

Cypress.Commands.add('expectServicesTreeToBe', tree => {
  const servicesNames = cy.get(SERVICES_TREE_DOM.texts.servicesNames);
  servicesNames.should('have.length', tree.length);
  servicesNames.each(($item, index) => cy.contains(tree[index]));
});

Cypress.Commands.add('getElementInServicesTree', (type, name) => {
  // type can be: namespace, localpart, endpoint, interface
  return cy.get(`.${type}`).contains(name);
});
