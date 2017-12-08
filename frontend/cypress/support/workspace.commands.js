import { WORKSPACE_DOM } from './workspace.dom';

Cypress.Commands.add(
  'workspace',
  (workspaceSidenav, workspaceMenu, tab, should = true) => {
    cy.get(WORKSPACE_DOM.sidenav).get(workspaceSidenav);
    cy.get(WORKSPACE_DOM.menu).get(workspaceMenu);
    cy.get(WORKSPACE_DOM.tabs).get(tab);
    cy
      .get(WORKSPACE_DOM.tabs.tab)
      .contains(`Petals`)
      .should(`have.class`, `mat-tab-label-active`);
  }
);
