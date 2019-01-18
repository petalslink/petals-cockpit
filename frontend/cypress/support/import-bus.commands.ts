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

import { IMPORT_BUS_DOM } from './import-bus.dom';
import { MESSAGE_DOM } from './message.dom';

Cypress.Commands.add('expectBusImportFields', () => {
  cy.get(IMPORT_BUS_DOM.inputs.ip);
  cy.get(IMPORT_BUS_DOM.inputs.port);
  cy.get(IMPORT_BUS_DOM.inputs.username);
  cy.get(IMPORT_BUS_DOM.inputs.password);
  cy.get(IMPORT_BUS_DOM.inputs.passphrase);
});

Cypress.Commands.add(
  'addBusImportInformations',
  (ip, port, username, password, passphrase) => {
    cy.get(IMPORT_BUS_DOM.inputs.ip).type(ip);
    cy.get(IMPORT_BUS_DOM.inputs.port).type(port);
    cy.get(IMPORT_BUS_DOM.inputs.username).type(username);
    cy.get(IMPORT_BUS_DOM.inputs.password).type(password);
    cy.get(IMPORT_BUS_DOM.inputs.passphrase).type(passphrase);
  }
);

Cypress.Commands.add(
  'importBusAndCheck',
  (ip, port, username, password, passphrase, shouldSuccess = true) => {
    cy.get(IMPORT_BUS_DOM.inputs.ip).type(ip);
    cy.get(IMPORT_BUS_DOM.inputs.port).type(port);
    cy.get(IMPORT_BUS_DOM.inputs.username).type(username);
    cy.get(IMPORT_BUS_DOM.inputs.password).type(password);
    cy.get(IMPORT_BUS_DOM.inputs.passphrase).type(passphrase);
    cy.get(IMPORT_BUS_DOM.buttons.submit).click();

    if (shouldSuccess) {
      cy.get(MESSAGE_DOM.texts.msgDetails).should('not.be.visible');

      cy.location().should(location => {
        expect(location.pathname).not.to.eq(
          '/workspaces/idWks2/petals/buses-in-progress'
        );
      });

      cy.expectNotification(
        'success',
        'Bus import success',
        /^The import of the bus .* succeeded$/
      );
    } else {
      cy
        .get(MESSAGE_DOM.texts.msgDetails)
        .contains(`Can't connect to ` + ip + `:` + port)
        .should('be.visible');

      cy.location().should(location => {
        expect(location.pathname).to.eq(
          '/workspaces/idWks2/petals/buses-in-progress'
        );
      });
    }
  }
);
