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
  'importBus',
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
