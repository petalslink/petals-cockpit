import { PETALS_COCKPIT_DOM } from '../support/petals-cockpit.dom';

describe(`Workspace`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should logout after logging in`, () => {
    cy.login('admin', 'admin');
    cy.logout();

    cy.expectNotification('success', 'Log out !', `You're now disconnected.`);
  });

  // TODO: for now there's an ongoing issue with hover
  // https://github.com/cypress-io/cypress/issues/953
  // it(`should display the current username`, () => {
  //   cy.login('admin', 'admin');
  //   cy.get(PETALS_COCKPIT_DOM.buttons.userAvatar).invoke('trigger', 'mouseover');
  //   cy.get('mat-tooltip-component').contains('Administrator');
  // });
});
