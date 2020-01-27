/**
 * Copyright (C) 2018-2020 Linagora
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

import { COMPONENT_DOM } from './component.dom';

Cypress.Commands.add('getActionStateInLifecycleComponent', name => {
  return cy.get(COMPONENT_DOM.buttons.actionState).contains(name);
});

Cypress.Commands.add('expectParametersListToBe', paramList => {
  const params = cy.get(COMPONENT_DOM.lifecycle.parameters).find('mat-label');

  params.should('have.length', paramList.length);
  params.each(($cell, index) => cy.wrap($cell).contains(paramList[index]));
});

Cypress.Commands.add('expectPossibleStateListToBe', possibleStateList => {
  const actionStates = cy.get(COMPONENT_DOM.buttons.actionState);

  actionStates.should('have.length', possibleStateList.length);
  actionStates.each(($cell, index) =>
    cy.wrap($cell).contains(possibleStateList[index])
  );
});

Cypress.Commands.add('getParameterInLifecycleComponent', (label, value) => {
  return cy
    .contains(label)
    .parent()
    .parent()
    .parent()
    .find(`input`)
    .should('have.value', value)
    .and('have.attr', 'type', 'text');
});
