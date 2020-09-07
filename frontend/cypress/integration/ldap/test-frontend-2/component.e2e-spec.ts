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

import {
  COMPONENT_DOM,
  SERVICE_UNIT_DEPLOYMENT_DOM,
} from '../../../support/component.dom';
import { expectedInitializedWks0Tree } from '../../../support/helper.const';
import { MESSAGE_DOM } from '../../../support/message.dom';
import { SERVICE_ASSEMBLY_DOM } from '../../../support/service-assembly.dom';
import {
  SNACKBAR_DEPLOYMENT_PROGRESS_DOM,
  UPLOAD_DOM,
} from '../../../support/upload.dom';

describe('Component', () => {
  it('should display read-only informations when deleted', () => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.getElementInPetalsTree(`component`, `Comp 0`).click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Topology`,
      `Bus 0`,
      `Cont 0`,
      `Comp 0`,
    ]);

    cy.getElementInPetalsTree(`component`, `Comp 2`).click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

    cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();

    cy.get(COMPONENT_DOM.buttons.actionState('unload')).click();

    cy
      .get(MESSAGE_DOM.texts.msgWarning)
      .contains('This component has been removed')
      .scrollIntoView()
      .should('be.visible');

    cy.getElementInPetalsTree(`component`, `Comp 2`).should('not.exist');
  });

  it('should be able to deploy service-unit with deployArtifact permission', () => {
    cy.visit(`/workspaces/idWks1/petals/components/idComp6`);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks1/petals/components/idComp6`);

    cy.get(UPLOAD_DOM.buttons.browse).should('be.enabled');
  });

  it('should not be able to deploy service-unit without deployArtifact permission', () => {
    cy.visit(`/workspaces/idWks1/petals/components/idComp6`);

    cy.login('bescudie', 'bescudie');

    cy.expectLocationToBe(`/workspaces/idWks1/petals/components/idComp6`);

    cy.get(UPLOAD_DOM.buttons.browse).should('not.be.enabled');
  });

  it('should be able to change parameters with deployArtifact permission', () => {
    cy.visit(`/workspaces/idWks1/petals/components/idComp6`);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks1/petals/components/idComp6`);

    cy
      .getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`)
      .should('be.enabled');
  });

  it('should not be able to change parameters without deployArtifact permission', () => {
    cy.visit(`/workspaces/idWks1/petals/components/idComp6`);

    cy.login('bescudie', 'bescudie');

    cy.expectLocationToBe(`/workspaces/idWks1/petals/components/idComp6`);

    cy
      .getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`)
      .should('not.be.enabled');
  });

  it('should be able to update component state with lifeCycleArtifact permission', () => {
    cy.visit(`/workspaces/idWks1/petals/components/idComp6`);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks1/petals/components/idComp6`);

    cy
      .get(COMPONENT_DOM.buttons.actionState('stop'))
      .children()
      .should('be.enabled');
  });

  it('should not be able to update component state without lifeCycleArtifact permission', () => {
    cy.visit(`/workspaces/idWks1/petals/components/idComp6`);

    cy.login('bescudie', 'bescudie');

    cy.expectLocationToBe(`/workspaces/idWks1/petals/components/idComp6`);

    cy
      .get(COMPONENT_DOM.buttons.actionState('stop'))
      .children()
      .should('be.disabled');
  });

  describe('Related Elements', () => {
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

    it('should go to related shared library view when clicking a shared library button', () => {
      cy.getElementInPetalsTree(`component`, `Comp 2`).click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);

      cy
        .get(COMPONENT_DOM.buttons.sharedLibraries)
        .should('have.length', 1)
        .eq(0)
        .should('contain', 'SL 0')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    });

    it('should go to related service unit view when clicking a service unit button', () => {
      cy.getElementInPetalsTree(`component`, `Comp 0`).click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

      cy
        .get(COMPONENT_DOM.buttons.serviceUnits)
        .should('have.length', 2)
        .eq(0)
        .should('contain', 'SU 0')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);
    });

    it('should go to related service assembly view when clicking the service assembly button next to a service unit button', () => {
      cy.getElementInPetalsTree(`component`, `Comp 0`).click();

      cy
        .get(COMPONENT_DOM.buttons.serviceAssemblies)
        .should('have.length', 2)
        .eq(0)
        .trigger('mouseenter');

      cy.get('mat-tooltip-component').should('contain', 'SA 0');

      cy
        .get(COMPONENT_DOM.buttons.serviceAssemblies)
        .eq(0)
        .trigger('mouseleave');

      cy.get('mat-tooltip-component').should('not.be.visible');

      cy
        .get(COMPONENT_DOM.buttons.serviceAssemblies)
        .eq(0)
        .click();

      cy.expectLocationToBe(
        `/workspaces/idWks0/petals/service-assemblies/idSa0`
      );
    });

    it('should show an info message when there is no related shared library', () => {
      cy.getElementInPetalsTree(`component`, `Comp 0`).click();
      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

      cy.get(COMPONENT_DOM.messages.noSl).should('be.visible');

      cy.getElementInPetalsTree(`component`, `Comp 2`).click();
      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);

      cy.get(COMPONENT_DOM.messages.noSl).should('not.be.visible');
    });

    it('should show an info message when there is no related service unit', () => {
      cy.getElementInPetalsTree(`component`, `Comp 2`).click();
      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);

      cy.get(COMPONENT_DOM.messages.noSu).should('be.visible');

      cy.getElementInPetalsTree(`component`, `Comp 0`).click();
      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

      cy.get(COMPONENT_DOM.messages.noSu).should('not.be.visible');
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      cy.visit(`/login`);

      cy.login('admin', 'admin');
      cy.expectLocationToBe(`/workspaces/idWks0`);

      cy
        .get('app-sidebar')
        .find('.btn-topology')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals`);

      cy.getElementInPetalsTree(`component`, `Comp 2`).click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);

      cy.get(COMPONENT_DOM.texts.title).should('contain', 'Comp 2');
    });

    it('should have parameters sorted by name', () => {
      // runtime parameters
      cy.expectParametersListToBe([`httpThreadPoolSizeMax`]);

      cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();

      cy.get(COMPONENT_DOM.buttons.actionState('uninstall')).click();

      // install parameters
      cy.expectParametersListToBe(expectedParametersListSortByName);
    });

    it('should manage the state started to stopped, uninstalled, re-installed and then started', () => {
      cy.checkLifecycleState(COMPONENT_DOM.lifecycle.state, 'Started');

      cy.get(COMPONENT_DOM.lifecycle.parameters).should('be.visible');

      // should have stop if started
      cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();

      cy.checkLifecycleState(COMPONENT_DOM.lifecycle.state, 'Stopped');

      cy.get(COMPONENT_DOM.lifecycle.parameters).should('be.not.visible');

      // should have start, uninstall, and unload if stopped
      cy.expectPossibleStatesListToBe(
        COMPONENT_DOM.buttons.allActionsStates,
        possibleStatesList
      );

      // should have info message when component is stopped
      cy.expectMessageToBe(
        `.info-no-parameter`,
        'info',
        `No configurable parameter in this state.`
      );

      cy.get(COMPONENT_DOM.buttons.actionState('uninstall')).click();

      cy.checkLifecycleState(COMPONENT_DOM.lifecycle.state, 'Loaded');

      cy.get(COMPONENT_DOM.lifecycle.parameters).should('be.visible');

      cy.get(COMPONENT_DOM.buttons.actionState('install')).click();

      cy.checkLifecycleState(COMPONENT_DOM.lifecycle.state, 'Shutdown');

      cy.get(COMPONENT_DOM.lifecycle.parameters).should('be.not.visible');

      // should have info message when component is shutdown
      cy.expectMessageToBe(
        `.info-no-parameter`,
        'info',
        `No configurable parameter in this state.`
      );

      // should have start, uninstall, and unload if shutdown
      cy.expectPossibleStatesListToBe(
        COMPONENT_DOM.buttons.allActionsStates,
        possibleStatesList
      );
    });

    it('should unload a component only if its SA are unload', () => {
      cy.getElementInPetalsTree(`component`, `Comp 0`).click();
      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);
      cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);
      cy.checkLifecycleState(COMPONENT_DOM.lifecycle.state, 'Started');

      // should have stop if started
      cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();

      cy.expectPossibleStatesListToBe(
        COMPONENT_DOM.buttons.allActionsStates,
        possibleStatesList
      );

      cy
        .get(COMPONENT_DOM.buttons.actionState('unload'))
        .children()
        .should('be.disabled');

      cy
        .get(COMPONENT_DOM.buttons.serviceAssemblies)
        .should('have.length', 2)
        .eq(0)
        .trigger('mouseenter', { force: true });

      cy.get('mat-tooltip-component').should('contain', 'SA 0');

      cy
        .get(COMPONENT_DOM.buttons.serviceAssemblies)
        .should('have.length', 2)
        .eq(1)
        .trigger('mouseenter', { force: true });

      cy.get('mat-tooltip-component').should('contain', 'SA 2');

      cy
        .get(COMPONENT_DOM.buttons.serviceAssemblies)
        .eq(0)
        .click({ force: true });

      cy.expectLocationToBe(
        `/workspaces/idWks0/petals/service-assemblies/idSa0`
      );

      cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('stop')).click();
      cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('unload')).click();

      // sa 0 is no longer in the list
      cy.getElementInPetalsTree(`service-assembly`, `SA 0`).should('not.exist');

      cy.getElementInPetalsTree(`component`, `Comp 0`).click();
      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

      cy
        .get(COMPONENT_DOM.buttons.serviceAssemblies)
        .should('have.length', 1)
        .eq(0)
        .click();

      cy.expectLocationToBe(
        `/workspaces/idWks0/petals/service-assemblies/idSa2`
      );
      cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('stop')).click();
      cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('unload')).click();

      // sa 2 is no longer in the list
      cy.getElementInPetalsTree(`service-assembly`, `SA 2`).should('not.exist');

      cy.getElementInPetalsTree(`component`, `Comp 0`).click();
      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

      cy
        .get(COMPONENT_DOM.buttons.actionState('unload'))
        .children()
        .should('be.enabled')
        .click();

      cy
        .get(MESSAGE_DOM.texts.msgWarning)
        .contains('This component has been removed')
        .scrollIntoView()
        .should('be.visible');

      cy.getElementInPetalsTree(`component`, `Comp 0`).should('not.exist');
    });

    it('should update runtime parameters when component state is started', () => {
      cy.expectParametersListToBe([`httpThreadPoolSizeMax`]);

      cy.getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`);

      cy.get(COMPONENT_DOM.buttons.setParameters).should('be.disabled');

      cy
        .getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`)
        .type(`123`);

      cy
        .get(COMPONENT_DOM.buttons.setParameters)
        .should('be.enabled')
        .click();

      cy.getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10123`);
    });

    it('should update install parameters when component state is loaded', () => {
      cy.get(COMPONENT_DOM.buttons.setParameters).should('be.disabled');
      cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();
      cy.get(COMPONENT_DOM.buttons.actionState('uninstall')).click();

      cy.expectParametersListToBe(expectedParametersListSortByName);

      cy.getParameterInLifecycleComponent(`httpPort`, `8484`);
      cy.getParameterInLifecycleComponent(`httpsEnabled`, `false`);
      cy.getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`);

      cy.get(COMPONENT_DOM.buttons.setParameters).should('be.disabled');

      cy
        .getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`)
        .type(`123`);

      cy
        .get(COMPONENT_DOM.buttons.setParameters)
        .should('be.enabled')
        .click();

      cy.getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10123`);

      cy.get(COMPONENT_DOM.buttons.actionState('install')).click();
      cy.get(COMPONENT_DOM.buttons.actionState('start')).click();

      // httpThreadPoolSizeMax should be updated on runtime parameter
      cy.getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10123`);
    });

    it('should display an error if component change state (install) fails', () => {
      cy.get(COMPONENT_DOM.buttons.setParameters).should('be.disabled');

      cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();
      cy.get(COMPONENT_DOM.buttons.actionState('uninstall')).click();

      cy
        .getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`)
        .clear()
        .type(`666`);

      cy
        .get(COMPONENT_DOM.buttons.setParameters)
        .should('be.enabled')
        .click();

      cy.expectMessageToBe(
        `.error-change-state`,
        'error',
        `[Mock message] An error happened when trying to change the parameters of that component`
      );

      cy.get(COMPONENT_DOM.buttons.actionState('install')).click();

      cy.get(COMPONENT_DOM.buttons.actionState('start')).click();

      cy.getParameterInLifecycleComponent(`httpThreadPoolSizeMax`, `10`);
    });
  });

  describe('Service Unit Deployment', () => {
    beforeEach(() => {
      cy.visit(`/login`);

      cy.login('admin', 'admin');
      cy.expectLocationToBe(`/workspaces/idWks0`);

      cy
        .get('app-sidebar')
        .find('.btn-topology')
        .click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals`);

      cy.getElementInPetalsTree(`component`, `Comp 0`).click();

      cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);

      cy.expectBreadcrumbsToBe([
        `Workspace 0`,
        `Topology`,
        `Bus 0`,
        `Cont 0`,
        `Comp 0`,
      ]);
    });

    it(`should forbid service unit deployment when file is unreadable`, () => {
      cy
        .get(SERVICE_UNIT_DEPLOYMENT_DOM.card)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check default content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      // try to upload unreadable file
      cy.uploadFile(
        'unreadable-service-unit.zip',
        '.deploy-su input[type=file]'
      );

      cy.expectNotification(
        'warn',
        'File error',
        `An error occurred while trying to read the service-unit zip file: Could not read zip file`
      );

      // check if default content of the deployment card did not change
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      // should not access to the selected card content when unreadable file
      cy.get(UPLOAD_DOM.card.selectedCardContent).should('not.be.visible');
    });

    it('should cancel and reset service unit deployment form', () => {
      cy
        .get(SERVICE_UNIT_DEPLOYMENT_DOM.card)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check the initial content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT.zip',
        '.deploy-su input[type=file]'
      );

      // check if the initial content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new service-unit deployment
      cy.contains(
        UPLOAD_DOM.texts.fileName,
        'su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT.zip'
      );
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      // cancel
      cy.get(UPLOAD_DOM.buttons.cancelFileName).click();

      // check if the initial content of deployment card is visible after click on cancel
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'su-pojo-calendarService-provide-1.0.0-SNAPSHOT.zip',
        '.deploy-su input[type=file]'
      );

      // check the new content of the deployment card with the new service-assembly deployment form
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.contains(
        UPLOAD_DOM.texts.fileName,
        'su-pojo-calendarService-provide-1.0.0-SNAPSHOT.zip'
      );
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');
    });

    it('should show a detailed error when the service-unit deployment fails', () => {
      cy
        .get(SERVICE_UNIT_DEPLOYMENT_DOM.card)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      // check the initial content of the deployment card
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('be.visible');

      cy.uploadFile(
        'service-unit-deploy-error.zip',
        '.deploy-su input[type=file]'
      );

      // check if the initial content of the deployment card is not visible
      cy.get(UPLOAD_DOM.texts.defaultCardContentMsg).should('not.be.visible');
      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.visible');

      // check the new content of the deployment card with the new service-unit deployment
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'service-unit-deploy-error.zip');

      cy
        .get(UPLOAD_DOM.buttons.deploy)
        .should('be.enabled')
        .click();

      cy.expectMessageToBe(
        `.error-upload`,
        'error',
        `[Mock message] An error happened when trying to deploy the service-unit`
      );

      cy.expectNotification(
        'error',
        'Service Unit Deployment Failed',
        `An error occurred while deploying service-unit-deploy-error.zip`
      );

      cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

      cy.get(UPLOAD_DOM.buttons.browse).should('be.enabled');

      cy.uploadFile(
        'service-unit-deploy-error.zip',
        '.deploy-su input[type=file]'
      );

      // check the new content of the deployment card with the new shared-library deployment
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');
      cy.contains(UPLOAD_DOM.texts.fileName, 'service-unit-deploy-error.zip');
      cy.get(UPLOAD_DOM.buttons.deploy).should('be.enabled');

      // should reset selected file and removed error message
      cy.get(UPLOAD_DOM.buttons.cancelFileName).click();

      cy
        .get(UPLOAD_DOM.card.noSelectedCardContent)
        .find(`.error-upload`)
        .should('not.be.visible');
    });

    it('should deploy a service-unit', () => {
      // cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);
      cy
        .getElementInPetalsTree(
          `service-unit`,
          `su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT`
        )
        .should('not.exist');

      cy
        .get(SERVICE_UNIT_DEPLOYMENT_DOM.card)
        .scrollIntoView()
        .should('be.visible')
        .and('not.have.class', 'hover');

      cy.get(UPLOAD_DOM.buttons.deploy).should('not.be.visible');

      cy.get(UPLOAD_DOM.buttons.cancelFileName).should('not.be.visible');

      cy.get(`app-snackbar-deployment-progress`).should('not.be.visible');

      cy.uploadFile(
        'su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT.zip',
        '.deploy-su input[type=file]'
      );

      // check the new content of the deployment card with the new service-unit deployment
      cy.contains(UPLOAD_DOM.texts.titleCard, 'Service Unit Deployment');

      cy.contains(
        UPLOAD_DOM.texts.fileName,
        'su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT.zip'
      );

      cy.get(UPLOAD_DOM.buttons.cancelFileName).should('be.visible');

      cy
        .get(UPLOAD_DOM.buttons.deploy, {
          timeout: 15000,
        })
        .should('be.enabled')
        .click();

      cy.get(UPLOAD_DOM.buttons.browse).should('not.be.enabled');

      cy.contains(
        SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.title,
        `Service-unit deployment in progress...`
      );

      cy.get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value).should('be.visible');

      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('be.visible');

      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.texts.value, {
          timeout: 20000,
        })
        .should('not.be.visible');

      cy
        .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss)
        .should('not.be.visible');

      cy
        .getElementInPetalsTree(
          `service-unit`,
          `su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT`
        )
        .should('exist');

      cy.expectNotification(
        'success',
        'Service Unit Deployed',
        `su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT has been successfully deployed`
      );

      cy.get(UPLOAD_DOM.buttons.browse).should('be.enabled');

      // cy.expectPetalsTreeToBe(expectedTreeAfterDeploySU);
    });
  });

  // const expectedTreeAfterDeploySU = [
  //   { elementName: `Bus 0` },
  //   { elementName: `Cont 0` },
  //   { elementName: `Components` },
  //   { elementName: `Comp 0`, state: 'Started' },
  //   { elementName: `SU 0`, state: 'Started' },
  //   { elementName: `SU 2`, state: 'Started' },
  //   {
  //     elementName: `su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT`,
  //     state: 'Shutdown',
  //   },
  //   { elementName: `Comp 1`, state: 'Started' },
  //   { elementName: `SU 1`, state: 'Started' },
  //   { elementName: `SU 3`, state: 'Started' },
  //   { elementName: `Comp 2`, state: 'Started' },
  //   { elementName: `Service Assemblies` },
  //   { elementName: `SA 0`, state: 'Started' },
  //   { elementName: `SA 1`, state: 'Started' },
  //   { elementName: `SA 2`, state: 'Started' },
  //   {
  //     elementName: `sa-su-soap-demande-deplacement-consume-1.0.0-SNAPSHOT`,
  //     state: 'Shutdown',
  //   },
  //   { elementName: `Shared Libraries` },
  //   { elementName: `SL 0` },
  //   { elementName: `Cont 1` },
  //   { elementName: `Components` },
  //   { elementName: `Comp 3`, state: 'Started' },
  //   { elementName: `SU 4`, state: 'Started' },
  //   { elementName: `SU 6`, state: 'Started' },
  //   { elementName: `Comp 4`, state: 'Started' },
  //   { elementName: `SU 5`, state: 'Started' },
  //   { elementName: `SU 7`, state: 'Started' },
  //   { elementName: `Comp 5`, state: 'Started' },
  //   { elementName: `Service Assemblies` },
  //   { elementName: `SA 3`, state: 'Started' },
  //   { elementName: `SA 4`, state: 'Started' },
  //   { elementName: `SA 5`, state: 'Started' },
  //   { elementName: `Shared Libraries` },
  //   { elementName: `SL 1` },
  // ];

  const expectedParametersListSortByName = [
    `httpPort`,
    `httpsEnabled`,
    `httpThreadPoolSizeMax`,
  ];

  const possibleStatesList = [`Start`, `Uninstall`, `Unload`];
});
