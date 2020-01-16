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

import {
  WORKSPACE_BUS_DETACH_DIALOG_DOM,
  WORKSPACE_BUS_IMPORT_DIALOG_DOM,
  WORKSPACE_DELETED_DIALOG_DOM,
  WORKSPACE_DELETION_DIALOG_DOM,
  WORKSPACE_OVERVIEW_DOM,
} from './workspace.dom';

Cypress.Commands.add('openDialogToDeleteWks', () => {
  cy
    .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
    .should('be.enabled')
    .click({ force: true })
    .should('be.disabled');
});

Cypress.Commands.add('deleteWks', (shouldSuccess = true) => {
  if (shouldSuccess) {
    // cypress-pipe does not retry any Cypress commands
    // so we need to click on the element using
    // jQuery method "$el.click()" and not "cy.click()"
    const click = ($el: any) => $el.click();

    cy
      .get(WORKSPACE_DELETION_DIALOG_DOM.buttons.submit)
      .should('be.visible')
      .pipe(click)
      .should($el => expect($el).to.not.be.visible);

    cy
      .get(WORKSPACE_DELETION_DIALOG_DOM.dialog.dialogDeletionWks)
      .should('not.be.visible');

    /*
    * We can't simpy use 'be visible' for the moment because of
    * https://github.com/cypress-io/cypress/issues/723
    * A more global issue has been created on the visibility of elements
    * See https://github.com/cypress-io/cypress/issues/1242
    *
    * cy
    *   .get(WORKSPACE_DELETED_DIALOG_DOM.dialog.dialogDeletedWks)
    *   .should('be.visible');
    */
  } else {
    cy
      .get(WORKSPACE_DELETION_DIALOG_DOM.buttons.cancel)
      .should('be.visible')
      .click();

    cy
      .get(WORKSPACE_DELETION_DIALOG_DOM.dialog.dialogDeletionWks)
      .should('not.be.visible');

    cy
      .get(WORKSPACE_DELETED_DIALOG_DOM.dialog.dialogDeletedWks)
      .should('not.be.visible');
  }
});

Cypress.Commands.add('expectDialogDeletionWksDescriptionToBe', description => {
  const eachLines = cy.get(WORKSPACE_DELETION_DIALOG_DOM.texts.description);
  eachLines.each((_, index) => eachLines.contains(description[index]));
});

Cypress.Commands.add('detachBusAndCheck', (username, shouldSuccess = true) => {
  if (shouldSuccess) {
    cy.get(WORKSPACE_BUS_DETACH_DIALOG_DOM.buttons.submit).click();

    cy
      .get(WORKSPACE_BUS_DETACH_DIALOG_DOM.dialog.dialogDetachBus)
      .should('not.be.visible');

    cy.expectNotification('info', /^Bus .*$/, 'Bus detached by ' + username);
  } else {
    cy.get(WORKSPACE_BUS_DETACH_DIALOG_DOM.buttons.cancel).click();

    cy
      .get(WORKSPACE_BUS_DETACH_DIALOG_DOM.dialog.dialogDetachBus)
      .should('not.be.visible');
  }
});

Cypress.Commands.add('expectBusListToBe', listGridItemBusNames => {
  const busNames = cy.get(WORKSPACE_OVERVIEW_DOM.texts.busNames);

  busNames.should('have.length', listGridItemBusNames.length);
  busNames.each(($item, index) =>
    cy.wrap($item).contains(listGridItemBusNames[index])
  );
});

Cypress.Commands.add('expectDetachBusListToBe', listGridItemDetachBusNames => {
  const detachBusNames = cy.get(WORKSPACE_OVERVIEW_DOM.texts.busDetachNames);

  detachBusNames.should('have.length', listGridItemDetachBusNames.length);
  detachBusNames.each((_, index) =>
    detachBusNames.contains(listGridItemDetachBusNames[index])
  );
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

Cypress.Commands.add('expectBusImportFields', () => {
  cy
    .get(
      `${WORKSPACE_OVERVIEW_DOM.inputs.ip},
       ${WORKSPACE_OVERVIEW_DOM.inputs.port},
       ${WORKSPACE_OVERVIEW_DOM.inputs.username},
       ${WORKSPACE_OVERVIEW_DOM.inputs.password},
       ${WORKSPACE_OVERVIEW_DOM.inputs.passphrase}`
    )
    .should('have.length', 5);
});

Cypress.Commands.add(
  'addBusImportInformations',
  (ip, port, username, password, passphrase) => {
    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.ip).type(ip);
    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.port).type(port);
    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.username).type(username);
    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.password).type(password);
    cy.get(WORKSPACE_OVERVIEW_DOM.inputs.passphrase).type(passphrase);
  }
);

Cypress.Commands.add(
  'importBusAndCheck',
  (ip, port, username, password, passphrase, shouldSuccess = true) => {
    cy.addBusImportInformations(ip, port, username, password, passphrase);

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');

    if (shouldSuccess) {
      cy.get('.error-import-details').should('not.be.visible');

      cy.expectNotification(
        'success',
        'Bus import success',
        /^The import of the bus .* succeeded$/
      );
    }
  }
);

Cypress.Commands.add(
  'cancelImportBusAndCheck',
  (ip, port, username, password, passphrase) => {
    cy.addBusImportInformations(ip, port, username, password, passphrase);

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();
    cy.get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.buttons.cancel).click();

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');
  }
);

Cypress.Commands.add('expectUserListToBe', userList => {
  const cellNames = cy
    .get('.users-table')
    .find('td.cell-user-action')
    .siblings();

  cellNames.should('have.length', userList.length);
  cellNames.each(($cell, index) => cy.wrap($cell).contains(userList[index]));
});
