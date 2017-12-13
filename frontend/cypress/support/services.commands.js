import { SERVICES_DOM, SERVICE_LIST_DOM } from './services.dom';

Cypress.Commands.add('services', (should = true) => {
  // TODO: Describe services commands
  // cy.get(SERVICES_DOM.something).get(something);
});

Cypress.Commands.add(
  'service-list',
  (allServices, links, serviceName, should = true) => {
    cy.get(SERVICE_LIST_DOM.navList.navListServices).get(allServices);
    cy.get(SERVICE_LIST_DOM.texts.allServices).should(`be.visible`);
    cy.get(SERVICE_LIST_DOM.texts.servicesNames).contains(serviceName);
    cy.get(SERVICE_LIST_DOM.texts.servicesNames).contains(`be.visible`);
  }
);
