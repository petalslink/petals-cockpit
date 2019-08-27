/**
 * Copyright (C) 2018-2019 Linagora
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

Cypress.Commands.add(
  'expectFocused',
  {
    prevSubject: true,
  },
  ([subject]) => {
    // The only difference between .then() with .should() is that .should() will retry any contained assertions until they pass or time out.
    cy.focused().should(([focusedElem]) => {
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
        return subject;
      });
  });
});

Cypress.Commands.add('expectMessageToBe', (element, type, message) => {
  cy
    .get(element)
    .scrollIntoView()
    .should('be.visible')
    .contains(message)
    .parent()
    .parent('.msg-content')
    .should('have.class', type);
});
