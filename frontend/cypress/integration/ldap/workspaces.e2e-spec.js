import { IMPORT_BUS_DOM } from '../../support/import-bus.dom';
import { PETALS_COCKPIT_DOM } from '../../support/petals-cockpit.dom';
import { PETALS_DOM, BIP_DOM } from '../../support/petals.dom';
import { MESSAGE_DOM } from '../../support/message.dom';
import {
  WORKSPACE_DOM,
  WORKSPACE_OVERVIEW_DOM,
} from '../../support/workspace.dom';
import {
  WORKSPACES_LIST_DOM,
  WORKSPACE_DELETION_DIALOG_DOM,
  WORKSPACE_DELETED_DIALOG_DOM,
} from '../../support/workspaces.dom';

describe(`Workspaces`, () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
  });

  it(`should create a new workspace and then delete it`, () => {
    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy.expectWorkspacesListToBe([`Workspace 0`, `Workspace 1`]);

    const name = cy.get(WORKSPACES_LIST_DOM.inputs.name);

    cy.addWorkspace('Workspace 2');

    cy.expectWorkspacesListToBe([`Workspace 0`, `Workspace 1`, `Workspace 2`]);

    const workspacesListNames = cy.get(WORKSPACES_LIST_DOM.texts.workspaceName);

    workspacesListNames.contains(`Workspace 2`).click();

    cy.expectLocationToBe(`/workspaces/idWks2`);

    cy.get(WORKSPACE_DOM.buttons.workspaceName).contains(`Workspace 2`);

    cy.openDialogToDeleteWks();

    cy
      .get(WORKSPACE_DELETION_DIALOG_DOM.texts.infoTitle)
      .contains(`Delete workspace?`);

    cy.expectDialogDeletionWksDescriptionToBe([
      `Everything in the workspace will be deleted! Please, be certain.`,
      `Are you sure you want to delete Workspace 2?`,
    ]);

    // cancel the dialog
    cy.deleteWks(false);

    cy.openDialogToDeleteWks();

    // delete the workspace
    cy.deleteWks();

    cy
      .get(WORKSPACE_DELETED_DIALOG_DOM.texts.infoTitle)
      .contains(`Workspace deleted!`);

    cy
      .get(WORKSPACE_DELETED_DIALOG_DOM.texts.description)
      .contains(
        `This workspace was deleted, click on OK to go back to the workspaces list.`
      );

    cy.get(WORKSPACE_DELETED_DIALOG_DOM.buttons.ok).click();

    cy.expectLocationToBe(`/workspaces`);

    cy.get(WORKSPACE_DOM.sidenav.workspaceSidenav).should('not.be.visible');

    cy.expectWorkspacesListToBe([`Workspace 0`, `Workspace 1`]);
  });

  it('should not be able to click Petals logo if workspace selection dialog is open', () => {
    cy.get(PETALS_COCKPIT_DOM.buttons.logo).should('be.enabled');

    cy.get(WORKSPACE_DOM.buttons.changeWorkspace).click();

    cy.get(PETALS_COCKPIT_DOM.buttons.logo).should('be.disabled');

    const workspacesListNames = cy.get(WORKSPACES_LIST_DOM.texts.workspaceName);

    workspacesListNames.contains(`Workspace 1`).click();

    cy.get(PETALS_COCKPIT_DOM.buttons.logo).should('be.enabled');
  });
});
