/**
 * Copyright (C) 2017-2019 Linagora
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
  WORKSPACE_DELETED_DIALOG_DOM,
  WORKSPACE_DELETION_DIALOG_DOM,
  WORKSPACES_CREATE_DOM,
  WORKSPACES_LIST_DOM,
} from './workspaces.dom';

// (listWorkspacesNames, listWorkspacesShortDescriptions)
Cypress.Commands.add('expectWorkspacesListToBe', listItemWorkspacesDetails => {
  const listItemWorkspaces = cy.get(
    WORKSPACES_LIST_DOM.listItem.itemWorkspaces
  );

  listItemWorkspaces.should(
    'have.length',
    listItemWorkspacesDetails.length / 2
  );
  listItemWorkspaces.each(($item, index) => {
    const item = cy.wrap($item);
    item.should('contain', listItemWorkspacesDetails[index * 2]);
    item.should('contain', listItemWorkspacesDetails[index * 2 + 1]);
  });
});

Cypress.Commands.add('addWorkspace', (name, shortDescription?) => {
  cy.get(WORKSPACES_CREATE_DOM.inputs.name).type(name);
  if (shortDescription) {
    cy
      .get(WORKSPACES_CREATE_DOM.textArea.shortDescription)
      .type(shortDescription);
  }
  cy.get(WORKSPACES_CREATE_DOM.buttons.addWorkspace).click();
});

Cypress.Commands.add(
  'addWorkspaceAndExpectToFail',
  (msgError, name, shortDescription?) => {
    cy.get(WORKSPACES_CREATE_DOM.buttons.addWorkspace).should('be.disabled');

    cy
      .get(WORKSPACES_CREATE_DOM.inputs.name)
      .should('not.be.disabled')
      .type(name);

    cy
      .get(WORKSPACES_CREATE_DOM.buttons.addWorkspace)
      .should('not.be.disabled');

    if (shortDescription) {
      cy
        .get(WORKSPACES_CREATE_DOM.textArea.shortDescription)
        .should('not.be.disabled')
        .type(shortDescription);
    }

    cy.get(WORKSPACES_CREATE_DOM.buttons.addWorkspace).click();

    cy
      .get(WORKSPACES_CREATE_DOM.messages.error.addWksFailed)
      .contains(msgError)
      .should('be.visible');
  }
);

Cypress.Commands.add('expectDialogDeletionWksDescriptionToBe', description => {
  const eachLines = cy.get(WORKSPACE_DELETION_DIALOG_DOM.texts.description);
  eachLines.each((_, index) => cy.contains(description[index]));
});

Cypress.Commands.add('deleteWks', (shouldSuccess = true) => {
  if (shouldSuccess) {
    cy.get(WORKSPACE_DELETION_DIALOG_DOM.buttons.submit).click();

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
    cy.get(WORKSPACE_DELETION_DIALOG_DOM.buttons.cancel).click();

    cy
      .get(WORKSPACE_DELETION_DIALOG_DOM.dialog.dialogDeletionWks)
      .should('not.be.visible');

    cy
      .get(WORKSPACE_DELETED_DIALOG_DOM.dialog.dialogDeletedWks)
      .should('not.be.visible');
  }
});
