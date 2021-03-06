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

import { BREADCRUMB_DOM } from './breadcrumb.dom';

Cypress.Commands.add(
  'expectFocused',
  {
    prevSubject: true,
  },
  ([subject]) => {
    // The only difference between .then() with .should() is that .should() will retry any contained assertions until they pass or time out.
    cy.focused().should(([focusedElem]: any) => {
      expect(focusedElem).to.eq(subject);
    });
  }
);

Cypress.Commands.add('expectLocationToBe', pathname => {
  return cy
    .location()
    .should(location => expect(location.pathname).to.eq(pathname));
});

Cypress.Commands.add('uploadFile', (fileName, selector) => {
  return cy.get(selector).then(subject => {
    return cy
      .fixture(fileName, 'base64')
      .then(Cypress.Blob.base64StringToBlob)
      .then(blob => {
        const el = subject[0];
        const testFile = new File([blob], fileName);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        el.dispatchEvent(new Event('change'));
        return subject;
      });
  });
});

Cypress.Commands.add('expectMessageToBe', (element, type, message) => {
  // TODO: need investigate why `should('be.visible')' doesn't work as expected
  cy
    .get(element)
    // .should('be.visible')
    .scrollIntoView()
    .contains(message)
    .parent()
    .parent('.msg-content')
    .should('have.class', type);
});

Cypress.Commands.add('expectBreadcrumbsToBe', elements => {
  cy.get(BREADCRUMB_DOM.texts.itemName).should('have.length', elements.length);

  for (let i = 0; i < elements.length; i++) {
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(i)
      .should('contain', elements[i]);
  }

  if (elements[elements.length - 1] === 'Not Found') {
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(2)
      .find('div')
      .should('have.class', 'breadcrumb-category');
    return;
  }

  if (elements.length === 2) {
    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(1)
      .find('div')
      .should('have.class', 'breadcrumb-category');
  } else {
    cy
      .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
      .last()
      .should('have.class', 'active-link');
  }
});

Cypress.Commands.add('checkLifecycleState', (element, state) => {
  cy
    .get(element)
    .should('contain', state)
    .and('be.visible')
    .find('app-led div')
    .should('have.class', getColorFromState(state));
});

Cypress.Commands.add(
  'expectPossibleStatesListToBe',
  (element, possibleStateList) => {
    const actionStates = cy.get(element);

    actionStates.should('have.length', possibleStateList.length);
    actionStates.each(($cell, index) =>
      cy.wrap($cell).contains(possibleStateList[index])
    );
  }
);

export function getColorFromState(state: string) {
  let color: string;
  switch (state) {
    case 'Started':
      color = 'green';
      break;
    case 'Loaded':
      color = 'grey';
      break;
    case 'Shutdown':
      color = 'red';
      break;
    case 'Stopped':
      color = 'yellow';
      break;
    case 'Unknown':
      color = 'black';
      break;
    case 'Unloaded':
      color = 'white';
      break;
  }

  return color;
}
