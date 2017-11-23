import { PETALS_COCKPIT_DOM } from './petals-cockpit.dom';
import { NOTIFICATION_DOM } from './notification.dom';

Cypress.Commands.add('logout', () => {
  cy.get(PETALS_COCKPIT_DOM.buttons.logout).click();

  cy.location().should(location => {
    expect(location.pathname).to.eq('/login');
  });
});

Cypress.Commands.add('expectNotification', (type, title, message) => {
  const NOTIFICATION_DOM_WITH_TYPE = NOTIFICATION_DOM(type);

  cy.get(NOTIFICATION_DOM_WITH_TYPE.text.title).contains(title);
  cy.get(NOTIFICATION_DOM_WITH_TYPE.text.content).contains(message);
  // TODO: the click on the notification is not working as it's
  // expecting for the notification to close before clicking on it
  // this might help to speed up testing time as notification are
  // taking quite a long time before closing (and let other tests run)
  // cy.get(NOTIFICATION_DOM_WITH_TYPE.baseSelector).click();
});
