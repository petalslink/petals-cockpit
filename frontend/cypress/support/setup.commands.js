import { SETUP_DOM } from './setup.dom';

Cypress.Commands.add('setupUserAndExpectToFail', (username, msgError) => {
  cy.get(SETUP_DOM.inputs.username).type(username);
  cy.get(SETUP_DOM.buttons.submit).click();

  cy
    .get(SETUP_DOM.messages.error.setupFailed)
    .contains(msgError)
    .should('be.visible');

  cy.location().should(location => {
    expect(location.pathname).not.to.eq('/login');
  });
});
