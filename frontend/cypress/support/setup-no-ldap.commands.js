import { SETUP_DOM } from './setup.dom';

Cypress.Commands.add(
  'setupNoLdapUserAndExpectToFail',
  (username, password, name, msgError) => {
    cy.get(SETUP_DOM.inputs.username).type(username);

    cy.get(SETUP_DOM.inputs.password).type(password);

    cy.get(SETUP_DOM.inputs.name).type(name);

    cy.get(SETUP_DOM.buttons.submit).click();

    cy
      .get(SETUP_DOM.messages.error.setupFailed)
      .contains(msgError)
      .should('be.visible');

    cy.location().should(location => {
      expect(location.pathname).not.to.eq('/login');
    });
  }
);
