import { LOGIN_DOM } from './login.dom';

Cypress.Commands.add('login', (username, password, shouldSuccess = true) => {
  cy.get(LOGIN_DOM.inputs.username).type(username);
  cy.get(LOGIN_DOM.inputs.hiddenPassword).type(password);
  cy.get(LOGIN_DOM.buttons.submit).click();

  if (shouldSuccess) {
    cy.get(LOGIN_DOM.messages.error.loginFailed).should('not.be.visible');
    cy.location().should(location => {
      expect(location.pathname).not.to.eq('/login');
    });
  } else {
    cy.get(LOGIN_DOM.messages.error.loginFailed).should('be.visible');
    cy.location().should(location => {
      expect(location.pathname).to.eq('/login');
    });
  }
});
