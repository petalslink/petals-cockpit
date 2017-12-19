import { PETALS_COCKPIT_DOM } from '../support/petals-cockpit.dom';
import { WORKSPACE_DOM } from '../support/workspace.dom';

describe(`Workspace`, () => {
  beforeEach(() => {
    cy.visit(`/login`);
  });

  it(`should logout after logging in`, () => {
    cy.login('admin', 'admin');
    cy.logout();

    cy.expectNotification('success', 'Log out !', `You're now disconnected.`);
  });

  it(`should active the tab petals`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav);
    cy.get(WORKSPACE_DOM.menu.workspaceMenu);
    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Petals`)
      .click()
      .should(`have.class`, `mat-tab-label-active`);
  });

  it(`should active the tab services`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav);
    cy.get(WORKSPACE_DOM.menu.workspaceMenu);
    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Services`)
      .click()
      .should(`have.class`, `mat-tab-label-active`);
  });

  it(`should active the tab api`, () => {
    cy.login('admin', 'admin');

    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav);
    cy.get(WORKSPACE_DOM.menu.workspaceMenu);
    cy
      .get(WORKSPACE_DOM.tabs)
      .contains(`Api`)
      .click()
      .should(`have.class`, `mat-tab-label-active`);
  });

  // TODO: for now there's an ongoing issue with hover
  // https://github.com/cypress-io/cypress/issues/953
  // it(`should display the current username`, () => {
  //   cy.login('admin', 'admin');
  //   cy.get(PETALS_COCKPIT_DOM.buttons.userAvatar).invoke('trigger', 'mouseover');
  //   cy.get('mat-tooltip-component').contains('Administrator');
  // });
});
