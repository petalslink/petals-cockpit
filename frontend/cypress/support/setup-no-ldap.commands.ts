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
