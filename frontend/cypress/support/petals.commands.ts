/**
 * Copyright (C) 2018 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { PETALS_TREE_DOM } from './petals.dom';

function foldOrUnfoldElementInTree(
  foldOrUnfold: string,
  type: string,
  name: string
) {
  const should = foldOrUnfold === 'fold' ? 'not.have.class' : 'have.class';

  cy
    .getElementInPetalsTree(type, name)
    .closest('.item-content')
    .within(() => {
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
  treeNames.each((_, index) => cy.contains(tree[index]));
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
  treeNames.each((_, index) => cy.contains(tree[index]));
});
