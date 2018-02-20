import { WORKSPACE_OVERVIEW_DOM } from './workspace.dom';

Cypress.Commands.add('openDialogToDeleteWks', () => {
  cy
    .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDeleteWks)
    .click()
    .should('be.disabled');
});
