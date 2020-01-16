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

import { LOGIN_DOM } from './login.dom';

Cypress.Commands.add('login', (username, password, shouldSuccess = true) => {
  cy.get(LOGIN_DOM.inputs.username).type(username);
  cy.get(LOGIN_DOM.inputs.password).type(password);
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
