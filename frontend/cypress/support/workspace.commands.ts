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

import { WORKSPACE_OVERVIEW_DOM } from './workspace.dom';

Cypress.Commands.add('openDialogToDeleteWks', () => {
  cy
    .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
    .should('be.enabled')
    .click({ force: true })
    .should('be.disabled');
});

Cypress.Commands.add('expectBusListToBe', listGridItemBusNames => {
  const busNames = cy.get(WORKSPACE_OVERVIEW_DOM.texts.busNames);

  busNames.should('have.length', listGridItemBusNames.length);
  busNames.each((_, index) => busNames.contains(listGridItemBusNames[index]));
});

Cypress.Commands.add(
  'updateShortDescription',
  (shortDescriptionText, hintLabel?, errorLabel?) => {
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.saveDescriptions)
      .should('be.disabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.textArea.shortDescriptionTextarea)
      .expectFocused()
      .type(shortDescriptionText);

    if (hintLabel) {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.shortDescriptionFormField)
        .find(`.mat-hint`)
        .should('contain', hintLabel);
    }
    if (errorLabel) {
      cy
        .get(WORKSPACE_OVERVIEW_DOM.formFields.shortDescriptionFormField)
        .find(`.mat-error`)
        .should('contain', errorLabel);
    }

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.saveDescriptions)
      .should('be.enabled')
      .click();
  }
);

Cypress.Commands.add('updateDescription', (descriptionText, hintLabel?) => {
  cy.get(WORKSPACE_OVERVIEW_DOM.buttons.saveDescriptions).should('be.disabled');

  cy
    .get(WORKSPACE_OVERVIEW_DOM.textArea.descriptionTextarea)
    .type(descriptionText);

  if (hintLabel) {
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.descriptionFormField)
      .find(`.mat-hint`)
      .should('contain', hintLabel);
  }

  cy
    .get(WORKSPACE_OVERVIEW_DOM.buttons.saveDescriptions)
    .should('be.enabled')
    .click();
});
