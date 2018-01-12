import { SERVICES_DOM, SERVICES_TREE_DOM } from './services.dom';

Cypress.Commands.add('expectServicesTreeToBe', tree => {
  const treeNames = cy.get(SERVICES_TREE_DOM.texts.itemsNames);
  treeNames.each(($item, index) => cy.contains(tree[index]));
});

Cypress.Commands.add('getElementInServicesTree', (type, name) => {
  // type can be: namespace, localpart, endpoint, interface
  return cy.get(`.${type}`).contains(name);
});
