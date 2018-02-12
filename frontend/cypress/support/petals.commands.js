import { PETALS_DOM, PETALS_TREE_DOM, BIP_DOM } from './petals.dom';
import { MESSAGE_DOM } from './message.dom';

function foldOrUnfoldElementInTree(foldOrUnfold, type, name) {
  const should = foldOrUnfold === 'fold' ? 'not.have.class' : 'have.class';

  cy
    .getElementInPetalsTree(type, name)
    .closest('.item-content')
    .within(item => {
      cy
        .get(`.arrow-size`)
        .contains(`arrow_drop_down`)
        .should(should, 'rotate-minus-90')
        .click();
    });
}

Cypress.Commands.add('expectPetalsTreeToBe', tree => {
  const treeNames = cy.get(PETALS_TREE_DOM.texts.itemsNames);
  treeNames.should('have.length', tree.length);
  treeNames.each(($item, index) => cy.contains(tree[index]));
});

Cypress.Commands.add('getElementInPetalsTree', (type, name) => {
  // type can be: bus, container, component, service-unit, service-assembly, shared-library,
  // category-components, category-service-assemblies, category-shared-libraries
  return cy.get(`.workspace-element-type-${type}`).contains(name);
});

Cypress.Commands.add('foldElementInTree', (type, name) => {
  return foldOrUnfoldElementInTree('fold', type, name);
});

Cypress.Commands.add('unfoldElementInTree', (type, name) => {
  return foldOrUnfoldElementInTree('unfold', type, name);
});

Cypress.Commands.add('getSearchMessage', (type, name) => {
  return cy.get(`.workspace-element-type-${type}`).contains(name);
});

Cypress.Commands.add('expectHighlightedElementToBe', tree => {
  const treeNames = cy.get(PETALS_TREE_DOM.texts.itemsHighlights);
  treeNames.each(($item, index) => cy.contains(tree[index]));
});
