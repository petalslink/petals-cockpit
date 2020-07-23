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

import { ARTIFACT_DEPLOYMENT_DOM } from '../../../support/container.dom';
import {
  expectedInitializedWks0Tree,
  expectedInitializedWks1Tree,
} from '../../../support/helper.const';
import { MENU_DOM } from '../../../support/menu.dom';
import {
  SNACKBAR_DEPLOYMENT_PROGRESS_DOM,
  UPLOAD_DOM,
} from '../../../support/upload.dom';
import { WORKSPACE_OVERVIEW_DOM } from '../../../support/workspace.dom';
import { WORKSPACES_CREATE_DOM } from '../../../support/workspaces.dom';

describe('Container', () => {
  beforeEach(() => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);
  });

  it('should have the container details overview with system info and container reachabilities', () => {
    cy.getElementInPetalsTree(`container`, `Cont 0`).click();
    cy.expectBreadcrumbsToBe([`Workspace 0`, `Topology`, `Bus 0`, `Cont 0`]);

    cy.expectLocationToBe(`/workspaces/idWks0/petals/containers/idCont0`);

    cy
      .get('.container-ip')
      .should('be.visible')
      .and('contain', `192.168.0.0`);

    cy
      .get('.container-port')
      .should('be.visible')
      .and('contain', '7700');

    cy
      .get('.container-system-info')
      .should('be.visible')
      .and(
        'contain',
        `Petals ESB µKernel 4.0.2\nPetals Standalone Shared Memory 4.0.2\nOpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation\nLinux 3.16.0-4-amd64 amd64`
      );

    // we can only check if the graph is visible
    cy
      .get('.container-list-graph')
      .scrollIntoView()
      .should('be.visible');
  });

  it('should have info message when no other containers exist in the bus', () => {
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(`.menu-item-create-wks`)
      .find(MENU_DOM.texts.itemNameCreateWks)
      .should('contain', `Create New Workspace`)
      .and('be.visible')
      .click();

    cy.expectLocationToBe(`/workspaces`);
    cy.url().should('include', '?page=create');

    cy.get(WORKSPACES_CREATE_DOM.inputs.workspaceName).expectFocused();

    cy.addWorkspace('Min Workspace');

    cy.expectLocationToBe('/workspaces/idWks2');

    cy.expectBusListToBe([`Bus 2`]);

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

    cy.expectLocationToBe(`/workspaces/idWks2/petals/buses/idBus2`);

    cy.getElementInPetalsTree(`container`, `Cont 4`).click();
    cy.expectBreadcrumbsToBe([`Min Workspace`, `Topology`, `Bus 2`, `Cont 4`]);

    cy
      .get('.container-ip')
      .should('be.visible')
      .and('contain', `192.168.0.4`);

    cy
      .get('.container-port')
      .should('be.visible')
      .and('contain', '7700');

    cy
      .get('.container-system-info')
      .should('be.visible')
      .and(
        'contain',
        `Petals ESB µKernel 4.0.2\nPetals Standalone Shared Memory 4.0.2\nOpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation\nLinux 3.16.0-4-amd64 amd64`
      );

    cy.expectMessageToBe(
      `.info-no-container-reachable`,
      'info',
      `There are no other containers in this bus.`
    );

    // we can only check if the graph is visible
    cy.get('.container-list-graph').should('be.visible');
  });

  it('should not have the container reachabilities and system info when unreachable container', () => {
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 1`)
      .click();

    cy.expectLocationToBe('/workspaces/idWks1');

    cy.expectBusListToBe([`Bus 1`]);

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

    cy.getElementInPetalsTree(`container`, `Cont 3`).click();
    cy.expectBreadcrumbsToBe([`Workspace 1`, `Topology`, `Bus 1`, `Cont 3`]);

    cy
      .get('.container-ip')
      .should('be.visible')
      .and('contain', `192.168.0.3`);

    cy
      .get('.container-port')
      .should('be.visible')
      .and('contain', '7700');

    cy.expectMessageToBe(`.warning-unreachable`, 'warning', 'Unreachable');

    // we can only check if the graph is not visible
    cy.get('.container-list-graph').should('not.be.visible');

    cy.expectPetalsTreeToBe(expectedInitializedWks1Tree);
  });

  describe('Artifact Deployment', () => {
    beforeEach(() => {
      cy.getElementInPetalsTree(`container`, `Cont 0`).click();
      cy.expectBreadcrumbsToBe([`Workspace 0`, `Topology`, `Bus 0`, `Cont 0`]);

      cy.expectLocationToBe(`/workspaces/idWks0/petals/containers/idCont0`);
    });

    // ALL
    it(`should forbid artifact deployment when file is unreadable`, () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check default content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      // try to upload unreadable file
      cy.uploadFile(
        'unreadable-artefact.zip',
        '.deploy-artifact input[type=file]'
      );

      cy.expectNotification(
        'warn',
        'File error',
        `An error occurred while trying to read the artifact zip file: Could not read zip file`
      );

      // check if default content of the deployment card did not change
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      // should not access to the deployment form when unreadable file
      cy.get(UPLOAD_DOM.card.selectedCardContent).should('not.be.visible');
    });

    // SERVICE ASSEMBLY
    it('should have a correct service-assembly deployment form', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check default content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'sa-flowable-vacation-sample.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if default content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new service-assembly deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Assembly Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'sa-flowable-vacation-sample.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `sa-flowable-vacation-sample`);
    });

    it('should cancel and reset service-assembly deployment form', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check the initial content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'sa-flowable-vacation-sample.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if the initial content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new service-assembly deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Assembly Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'sa-flowable-vacation-sample.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `sa-flowable-vacation-sample`);

      // clear input value
      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearSaName).click();

      // the current default value should be used if empty field
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.attr', 'placeholder', 'sa-flowable-vacation-sample')
        .and('not.have.value');

      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName).type('SA 0');

      // cancel form
      cy.get(UPLOAD_DOM.buttons.cancelFileName).click();

      // check if the initial content of deployment card is visible after click on cancel form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'sa-flowable-vacation-sample.zip',
        '.deploy-artifact input[type=file]'
      );

      // check the new content of the deployment card with the new service-assembly deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Assembly Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'sa-flowable-vacation-sample.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `sa-flowable-vacation-sample`);
    });

    it('should deploy a service-assembly', () => {
      cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.visible');

      cy.get(`app-snackbar-deployment-progress`).should('not.be.visible');

      cy.uploadFile(
        'sa-flowable-vacation-sample.zip',
        '.deploy-artifact input[type=file]'
      );

      cy
        .get(UPLOAD_DOM.buttons.deploy, { timeout: 10000 })
        .should('be.enabled')
        .click();

      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.enabled');

      cy.contains(
        SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.title,
        `Service-assembly deployment in progress...`
      );

      cy.get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value).should('be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value, { timeout: 15000 })
        .should('not.be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('not.be.visible');

      cy.expectPetalsTreeToBe(expectedTreeAfterDeploySA);

      cy.expectNotification(
        'success',
        'Service Assembly Deployed',
        `sa-flowable-vacation-sample has been successfully deployed`
      );

      cy.get(UPLOAD_DOM.buttons.browse).should('be.enabled');
    });

    // SHARED LIBRARY
    it('should have incorrect shared-library deployment form', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check default content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'petals-sl-hsql-1.8.0.10.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if default content of the deployment card is not visible
      cy
        .get(UPLOAD_DOM.texts.defaultCardContentMsg, { timeout: 10000 })
        .should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new shared-library deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Shared Library Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'petals-sl-hsql-1.8.0.10.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      // rename current sl name and version
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `petals-sl-hsql`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactVersion)
        .should('have.value', `1.8.0.10`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearSlName).click();
      cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName).type(`SL 0`);

      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearSlVersion).click();
      cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactVersion).type(`1.0.0`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`.error-sl-name-input`)
        .contains(`This name already exists in Cont 0`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`.error-sl-version-input`)
        .contains(`This version already exists in Cont 0`);

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.enabled');
    });

    it('should have a correct shared-library deployment form', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check default content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'petals-sl-hsql-1.8.0.10.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if default content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new shared-library deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Shared Library Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'petals-sl-hsql-1.8.0.10.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `petals-sl-hsql`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactVersion)
        .should('have.value', `1.8.0.10`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`mat-error`)
        .should('not.be.visible');
    });

    it('should cancel and reset shared-library deployment form', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check the initial content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'petals-sl-hsql-1.8.0.10.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if the initial content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new service-assembly deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Shared Library Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'petals-sl-hsql-1.8.0.10.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `petals-sl-hsql`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactVersion)
        .should('have.value', `1.8.0.10`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      // clear input values
      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearSlName).click();
      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearSlVersion).click();

      // the current default values should be used if empty fields
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`input[formcontrolname=name]`)
        .should('have.attr', 'placeholder', 'petals-sl-hsql')
        .and('not.have.value');
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`input[formcontrolname=version]`)
        .should('have.attr', 'placeholder', '1.8.0.10')
        .and('not.have.value');

      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName).type('SL 0');
      cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactVersion).type('1.0.0');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`mat-error`)
        .first()
        .contains('This name already exists in Cont 0')
        .should('be.visible');
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`mat-error`)
        .first()
        .contains('This version already exists in Cont 0')
        .should('be.visible');

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.enabled');

      // cancel form
      cy.get(UPLOAD_DOM.buttons.cancelFileName).click();

      // check if the initial content of deployment card is visible after click on cancel form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'petals-sl-hsql-1.8.0.10.zip',
        '.deploy-artifact input[type=file]'
      );

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`mat-error`)
        .should('not.be.visible');
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      // check the new content of the deployment card with the new shared-library deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Shared Library Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'petals-sl-hsql-1.8.0.10.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slNameFormField)
        .find(`input[formcontrolname=name]`)
        .should('have.value', `petals-sl-hsql`);
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.slVersionFormField)
        .find(`input[formcontrolname=version]`)
        .should('have.value', `1.8.0.10`);
    });

    it('should deploy a shared-library', () => {
      cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.visible');

      cy.get(`app-snackbar-deployment-progress`).should('not.be.visible');

      cy.uploadFile(
        'petals-sl-hsql-1.8.0.10.zip',
        '.deploy-artifact input[type=file]'
      );

      cy
        .get(UPLOAD_DOM.buttons.deploy, { timeout: 10000 })
        .should('be.enabled')
        .click();

      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.enabled');

      cy.contains(
        SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.title,
        `Shared-library deployment in progress...`
      );

      cy.get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value).should('be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value, { timeout: 15000 })
        .should('not.be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('not.be.visible');

      cy.expectPetalsTreeToBe(expectedTreeAfterDeploySL);

      cy.expectNotification(
        'success',
        'Shared Library Deployed',
        `petals-sl-hsql has been successfully deployed`
      );

      cy.get(UPLOAD_DOM.buttons.browse).should('be.enabled');
    });

    // COMPONENT
    it('should have incorrect component deployment form', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check default content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if default content of the deployment card is not visible
      cy
        .get(UPLOAD_DOM.texts.defaultCardContentMsg, { timeout: 10000 })
        .should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new component deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Component Deployment');
      cy.contains(
        UPLOAD_DOM.texts.fileName,
        'petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip'
      );
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      // rename current component name
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `petals-bc-sql`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearCompName).click();
      cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName).type(`Comp 0`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField)
        .find(`.error-comp-name-input`)
        .contains(`This name already exists in Cont 0`);

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.enabled');
    });

    it('should have a correct component deployment form', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check default content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'petals-bc-jms-2.0.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if default content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new component deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Component Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'petals-bc-jms-2.0.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `petals-bc-jms`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField)
        .find(`mat-error`)
        .should('not.be.visible');
    });

    it('should show a detailed error when the component deployment fails', () => {
      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check the initial content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Artifact Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'component-deploy-error.zip',
        '.deploy-artifact input[type=file]'
      );

      // check if the initial content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new component deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Component Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'component-deploy-error.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
        .should('have.value', `petals-bc-sql`);

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField)
        .find(`mat-error`)
        .should('not.be.visible');

      // clear input value
      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearCompName).click();

      // the current default value should be used if empty fields
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField)
        .find(`input[formcontrolname=name]`)
        .should('have.attr', 'placeholder', 'petals-bc-sql')
        .and('not.have.value');

      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName).type('Comp 0');

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField)
        .find(`mat-error`)
        .first()
        .contains('This name already exists in Cont 0')
        .should('be.visible');

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.enabled');

      // clear input value
      cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.clearCompName).click();

      cy
        .get(UPLOAD_DOM.buttons.deploy)
        .should('be.enabled')
        .click();

      cy.expectMessageToBe(
        `.error-upload`,
        'error',
        `[Mock message] An error happened when trying to deploy the component`
      );

      cy.expectNotification(
        'error',
        'Component Deployment Failed',
        `An error occurred while deploying component-deploy-error.zip`
      );

      cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

      cy.get(UPLOAD_DOM.buttons.browse).should('be.enabled');

      cy.uploadFile(
        'component-deploy-error.zip',
        '.deploy-artifact input[type=file]'
      );

      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField, {
          timeout: 10000,
        })
        .find(`mat-error`)
        .should('not.be.visible');

      // check the new content of the deployment card with the new shared-library deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Component Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'component-deploy-error.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');
      cy
        .get(ARTIFACT_DEPLOYMENT_DOM.formFields.compNameFormField, {
          timeout: 10000,
        })
        .find(`input[formcontrolname=name]`)
        .should('have.value', `petals-bc-sql`);

      // should reset form and removed error message
      cy.get(UPLOAD_DOM.buttons.cancelFileName).click();

      cy
        .get(UPLOAD_DOM.card.noSelectedCardContent)
        .find(`.error-upload`)
        .should('not.be.visible');
    });

    it('should deploy a component', () => {
      cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

      cy
        .get(`.card-artifact-deployment`)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.visible');

      cy.get(`app-snackbar-deployment-progress`).should('not.be.visible');

      cy.uploadFile(
        'petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip',
        '.deploy-artifact input[type=file]'
      );

      cy
        .get(UPLOAD_DOM.buttons.deploy, { timeout: 10000 })
        .should('be.enabled')
        .click();

      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.enabled');

      cy.contains(
        SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.title,
        `Component deployment in progress...`
      );

      cy.get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value).should('be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value, { timeout: 15000 })
        .should('not.be.visible');
      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('not.be.visible');

      cy.expectPetalsTreeToBe(expectedTreeAfterDeployComp);

      cy.expectNotification(
        'success',
        'Component Deployed',
        `petals-bc-sql has been successfully deployed`
      );

      cy.get(UPLOAD_DOM.buttons.browse).should('be.enabled');
    });

    describe('Override Shared Libraries', () => {
      it('should have shared libraries when uploading a component', () => {
        cy
          .get(`.card-artifact-deployment`)
          .scrollIntoView()
          .should('be.visible')
          .and('not.have.class', 'hover');

        cy.uploadFile(
          'petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip',
          '.deploy-artifact input[type=file]'
        );

        cy.contains(
          UPLOAD_DOM.texts.fileName,
          'petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip'
        );

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
          .should('have.value', `petals-bc-sql`);

        cy.expectMessageToBe(
          `.success-all-sls`,
          'success',
          `All the shared libraries are in this container.`
        );

        // expect to have 4 columns
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable)
          .find('th')
          .should('have.length', 4);

        // expect to have 1 shared library present on the table
        cy.get(ARTIFACT_DEPLOYMENT_DOM.table.rowNames).should('have.length', 1);

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable)
          .find('app-led')
          .should('have.length', 1)
          .and('have.attr', 'color', 'green');

        cy.expectSlListToBe(expectedSlAllGreenList);
      });

      it('should be disposed to delete, edit, cancel updating shared libraries or add a new one', () => {
        cy
          .get(`.card-artifact-deployment`)
          .scrollIntoView()
          .should('be.visible')
          .and('not.have.class', 'hover');

        cy.uploadFile(
          'petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip',
          '.deploy-artifact input[type=file]'
        );

        cy.contains(
          UPLOAD_DOM.texts.fileName,
          'petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip'
        );

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
          .should('have.value', `petals-bc-sql`);

        cy.expectMessageToBe(
          `.warning-red-led`,
          'warning',
          `Shared libraries with a red led are not in this container.`
        );

        // expect to have 4 columns
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable)
          .find('th')
          .should('have.length', 4);

        // expect to have 2 shared libraries present on the table
        cy.get(ARTIFACT_DEPLOYMENT_DOM.table.rowNames).should('have.length', 2);

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable)
          .find('app-led')
          .first()
          .should('have.length', 1)
          .and('have.attr', 'color', 'green');

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable)
          .find('app-led')
          .last()
          .should('have.length', 1)
          .and('have.attr', 'color', 'red');

        cy.expectSlListToBe(expectedSlRedGreenList);

        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('not.be.visible');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.buttons.cancelSl)
          .should('not.be.visible');

        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.editSl).should('be.visible');

        // remove red sl
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.buttons.deleteSl)
          .last()
          .click();

        // expect to have 1 sl with status installed
        cy.expectSlListToBe(expectedSlAllGreenList);

        // should update message
        cy.expectMessageToBe(
          `.success-all-sls`,
          'success',
          `All the shared libraries are in this container.`
        );

        // edit green sl
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.editSl).click();
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.cancelSl).should('be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('be.visible');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
          .should('not.be.enabled');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.addSl).should('not.be.enabled');
        cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.enabled');

        // check input fields values and no errors
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.slName)
          .should('have.value', `SL 0`);
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.slVersion)
          .should('have.value', `1.0.0`);
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlNameFormField)
          .find(`mat-error`)
          .should('not.be.visible');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlVersionFormField)
          .find(`mat-error`)
          .should('not.be.visible');

        // clear input fields values and expect required errors inputs message
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.slName)
          .focus()
          .clear()
          .blur();
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlNameFormField)
          .find(`mat-error`)
          .contains('Required!')
          .should('be.visible');

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.slVersion)
          .focus()
          .clear()
          .blur();
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlVersionFormField)
          .find(`mat-error`)
          .contains('Required!')
          .should('be.visible');

        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('not.be.visible');

        // write random values and expect required errors inputs message disappear
        cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.slName).type('SL 99');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlNameFormField)
          .find(`mat-error`)
          .should('not.be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.slVersion).type('1.0.9');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlVersionFormField)
          .find(`mat-error`)
          .should('not.be.visible');

        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('be.visible');

        // cancel the editing shared library
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.cancelSl).click();

        cy.expectSlListToBe(expectedSlAllGreenList);

        // edit same green sl and keep update
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.editSl).click();
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.cancelSl).should('be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('be.visible');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
          .should('not.be.enabled');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.addSl).should('not.be.enabled');
        cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.enabled');

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.slName)
          .clear()
          .type('SL 99');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.slVersion)
          .clear()
          .type('1.0.9');

        // save the editing shared library
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).click();

        cy.expectSlListToBe(expectedSlListUpdated);

        cy.expectMessageToBe(
          `.warning-red-led`,
          'warning',
          `Shared libraries with a red led are not in this container.`
        );

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable)
          .find('app-led')
          .first()
          .should('have.length', 1)
          .and('have.attr', 'color', 'red');

        // remove green sl
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.deleteSl).click();

        // expect to not have sls table visible because all sls are removed before
        cy.get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable).should('not.be.visible');

        // should update message
        cy.expectMessageToBe(
          `.info-no-sls`,
          'info',
          `There are no shared libraries.`
        );

        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.addSl).click();

        // edit mode
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.editSl).should('not.be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('not.be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.cancelSl).should('be.visible');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
          .should('not.be.enabled');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.addSl).should('not.be.enabled');
        cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.enabled');

        // check empty input fields and no errors
        cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.slName).should('be.empty');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.slVersion).should('be.empty');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlNameFormField)
          .find(`mat-error`)
          .should('not.be.visible');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.formFields.overrideSlVersionFormField)
          .find(`mat-error`)
          .should('not.be.visible');

        // should not be visible while no input fields values
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('not.be.visible');

        cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.slName).type(`SL 0`);
        cy.get(ARTIFACT_DEPLOYMENT_DOM.inputs.slVersion).type(`1.0.0`);

        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl)
          .should('be.visible')
          .click();

        // should update message
        cy.expectMessageToBe(
          `.success-all-sls`,
          'success',
          `All the shared libraries are in this container.`
        );

        // not edit mode
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.buttons.cancelSl)
          .should('not.be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.saveSl).should('not.be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.editSl).should('be.visible');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.deleteSl).should('be.visible');
        cy
          .get(ARTIFACT_DEPLOYMENT_DOM.inputs.artifactName)
          .should('be.enabled');
        cy.get(ARTIFACT_DEPLOYMENT_DOM.buttons.addSl).should('be.enabled');
        cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');
      });
    });

    const expectedSlListUpdated = [`1.0.9`, `SL 99`];

    const expectedSlAllGreenList = [`1.0.0`, `SL 0`];

    const expectedSlRedGreenList = [
      `1.0.0-SNAPSHOT`,
      `petals-sl-sqlserver-6.1.0.jre7`,
      `1.0.0`,
      `SL 0`,
    ];

    const expectedTreeAfterDeploySA = [
      { elementName: `Bus 0` },
      { elementName: `Cont 0` },
      { elementName: `Components` },
      { elementName: `Comp 0`, state: 'Started' },
      { elementName: `SU 0`, state: 'Started' },
      { elementName: `SU 2`, state: 'Started' },
      { elementName: `su1-sa-flowable-vacation-sample`, state: 'Shutdown' },
      { elementName: `Comp 1`, state: 'Started' },
      { elementName: `SU 1`, state: 'Started' },
      { elementName: `SU 3`, state: 'Started' },
      { elementName: `su2-sa-flowable-vacation-sample`, state: 'Shutdown' },
      { elementName: `Comp 2`, state: 'Started' },
      { elementName: `Service Assemblies` },
      { elementName: `SA 0`, state: 'Started' },
      { elementName: `SA 1`, state: 'Started' },
      { elementName: `SA 2`, state: 'Started' },
      { elementName: `sa-flowable-vacation-sample`, state: 'Shutdown' },
      { elementName: `Shared Libraries` },
      { elementName: `SL 0` },
      { elementName: `Cont 1` },
      { elementName: `Components` },
      { elementName: `Comp 3`, state: 'Started' },
      { elementName: `SU 4`, state: 'Started' },
      { elementName: `SU 6`, state: 'Started' },
      { elementName: `Comp 4`, state: 'Started' },
      { elementName: `SU 5`, state: 'Started' },
      { elementName: `SU 7`, state: 'Started' },
      { elementName: `Comp 5`, state: 'Started' },
      { elementName: `Service Assemblies` },
      { elementName: `SA 3`, state: 'Started' },
      { elementName: `SA 4`, state: 'Started' },
      { elementName: `SA 5`, state: 'Started' },
      { elementName: `Shared Libraries` },
      { elementName: `SL 1` },
    ];

    const expectedTreeAfterDeploySL = [
      { elementName: `Bus 0` },
      { elementName: `Cont 0` },
      { elementName: `Components` },
      { elementName: `Comp 0`, state: 'Started' },
      { elementName: `SU 0`, state: 'Started' },
      { elementName: `SU 2`, state: 'Started' },
      { elementName: `Comp 1`, state: 'Started' },
      { elementName: `SU 1`, state: 'Started' },
      { elementName: `SU 3`, state: 'Started' },
      { elementName: `Comp 2`, state: 'Started' },
      { elementName: `Service Assemblies` },
      { elementName: `SA 0`, state: 'Started' },
      { elementName: `SA 1`, state: 'Started' },
      { elementName: `SA 2`, state: 'Started' },
      { elementName: `Shared Libraries` },
      { elementName: `SL 0` },
      { elementName: `petals-sl-hsql` },
      { elementName: `Cont 1` },
      { elementName: `Components` },
      { elementName: `Comp 3`, state: 'Started' },
      { elementName: `SU 4`, state: 'Started' },
      { elementName: `SU 6`, state: 'Started' },
      { elementName: `Comp 4`, state: 'Started' },
      { elementName: `SU 5`, state: 'Started' },
      { elementName: `SU 7`, state: 'Started' },
      { elementName: `Comp 5`, state: 'Started' },
      { elementName: `Service Assemblies` },
      { elementName: `SA 3`, state: 'Started' },
      { elementName: `SA 4`, state: 'Started' },
      { elementName: `SA 5`, state: 'Started' },
      { elementName: `Shared Libraries` },
      { elementName: `SL 1` },
    ];

    const expectedTreeAfterDeployComp = [
      { elementName: `Bus 0` },
      { elementName: `Cont 0` },
      { elementName: `Components` },
      { elementName: `Comp 0`, state: 'Started' },
      { elementName: `SU 0`, state: 'Started' },
      { elementName: `SU 2`, state: 'Started' },
      { elementName: `Comp 1`, state: 'Started' },
      { elementName: `SU 1`, state: 'Started' },
      { elementName: `SU 3`, state: 'Started' },
      { elementName: `Comp 2`, state: 'Started' },
      { elementName: `petals-bc-sql` },
      { elementName: `Service Assemblies` },
      { elementName: `SA 0`, state: 'Started' },
      { elementName: `SA 1`, state: 'Started' },
      { elementName: `SA 2`, state: 'Started' },
      { elementName: `Shared Libraries` },
      { elementName: `SL 0` },
      { elementName: `Cont 1` },
      { elementName: `Components` },
      { elementName: `Comp 3`, state: 'Started' },
      { elementName: `SU 4`, state: 'Started' },
      { elementName: `SU 6`, state: 'Started' },
      { elementName: `Comp 4`, state: 'Started' },
      { elementName: `SU 5`, state: 'Started' },
      { elementName: `SU 7`, state: 'Started' },
      { elementName: `Comp 5`, state: 'Started' },
      { elementName: `Service Assemblies` },
      { elementName: `SA 3`, state: 'Started' },
      { elementName: `SA 4`, state: 'Started' },
      { elementName: `SA 5`, state: 'Started' },
      { elementName: `Shared Libraries` },
      { elementName: `SL 1` },
    ];
  });
});
