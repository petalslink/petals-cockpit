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

import { COMPONENT_DOM } from '../../../support/component.dom';
import { MESSAGE_DOM } from '../../../support/message.dom';
import { PETALS_TREE_DOM } from '../../../support/petals.dom';
import { SHARED_LIBRARY_DOM } from '../../../support/shared-library.dom';
import {
  SNACKBAR_DEPLOYMENT_PROGRESS_DOM,
  UPLOAD_DOM,
} from '../../../support/upload.dom';

describe('Shared-library', () => {
  it('should had shared library page loaded', () => {
    cy.visit(`/login`);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .contains('SL 0')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Topology`,
      `Bus 0`,
      `Cont 0`,
      `SL 0`,
    ]);
  });

  it('should be able to unload service library with deployArtifact permission', () => {
    cy.visit(`/workspaces/idWks0/petals/containers/idCont0`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/containers/idCont0`);

    cy.uploadFile(
      'petals-sl-hsql-1.8.0.10.zip',
      '.deploy-artifact input[type=file]'
    );

    cy
      .get(UPLOAD_DOM.buttons.deploy, { timeout: 15000 })
      .should('be.enabled')
      .click();

    cy
      .get(UPLOAD_DOM.buttons.browse, { timeout: 10000 })
      .should('not.be.enabled');

    cy
      .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss, {
        timeout: 20000,
      })
      .should('not.be.visible');

    cy.expectNotification(
      'success',
      'Shared Library Deployed',
      `petals-sl-hsql has been successfully deployed`
    );

    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .contains('petals-sl-hsql')
      .click({ force: true });

    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl4`);
    cy.get(SHARED_LIBRARY_DOM.buttons.unloadSlBtn).should('be.enabled');
  });

  it('should not be able to unload service library without deployArtifact permission', () => {
    cy.visit(`/workspaces/idWks0/petals/containers/idCont0`);
    cy.login('cchevalier', 'cchevalier');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/containers/idCont0`);

    cy.uploadFile(
      'petals-sl-hsql-1.8.0.10.zip',
      '.deploy-artifact input[type=file]'
    );

    cy
      .get(UPLOAD_DOM.buttons.deploy, { timeout: 15000 })
      .should('be.enabled')
      .click();

    cy
      .get(UPLOAD_DOM.buttons.browse, { timeout: 10000 })
      .should('not.be.enabled');

    cy
      .get(SNACKBAR_DEPLOYMENT_PROGRESS_DOM.buttons.dismiss, {
        timeout: 20000,
      })
      .should('not.be.visible');

    cy.expectNotification(
      'success',
      'Shared Library Deployed',
      `petals-sl-hsql has been successfully deployed`
    );

    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .contains('petals-sl-hsql')
      .click({ force: true });

    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl4`);
    cy.get(SHARED_LIBRARY_DOM.buttons.unloadSlBtn).should('not.be.enabled');
  });

  it('should have shared-library details', () => {
    cy.visit(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);

    cy.get(SHARED_LIBRARY_DOM.texts.slName).should('contain', 'SL 0');

    cy.get(SHARED_LIBRARY_DOM.texts.slVersion).should('contain', '1.0.0');
  });

  it('should unload a shared-library', () => {
    cy.visit(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    // unload btn is disabled if started comp
    cy.get(SHARED_LIBRARY_DOM.buttons.unloadSlBtn).should('be.disabled');

    // unload the component
    cy.getElementInPetalsTree(`component`, `Comp 2`).click();
    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);
    cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();
    cy.get(COMPONENT_DOM.buttons.actionState('unload')).click();

    // unload the shared library
    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .contains('SL 0')
      .click({ force: true });
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy
      .get(SHARED_LIBRARY_DOM.buttons.unloadSlBtn)
      .should('be.enabled')
      .click();

    // sl is no longer in the list
    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .should('not.contain', 'SL 0');
  });

  it('should show an info message when there is no related component', () => {
    cy.visit(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    // unload the component
    cy.getElementInPetalsTree(`component`, `Comp 2`).click();
    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);
    cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();
    cy.get(COMPONENT_DOM.buttons.actionState('unload')).click();

    // check the app message
    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .contains('SL 0')
      .click({ force: true });
    cy
      .get(SHARED_LIBRARY_DOM.texts.slNoComponent)
      .should('be.visible')
      .contains("This shared library isn't used by any component.");
  });

  it('should go to related component view when clicking a component button', () => {
    cy.visit(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);

    cy
      .get(SHARED_LIBRARY_DOM.component('idComp2'))
      .find(SHARED_LIBRARY_DOM.buttons.componentBtn)
      .should('be.visible')
      .should('contain', 'Comp 2')
      .click();

    // check if it's the right component
    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);
    cy.get(COMPONENT_DOM.texts.title).contains('About Comp 2');
  });

  it('should have component led state updated', () => {
    cy.visit(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    // check if the led is green
    cy
      .get(SHARED_LIBRARY_DOM.component('idComp2'))
      .find('div')
      .should('have.class', 'green');

    // change component state
    cy.getElementInPetalsTree(`component`, `Comp 2`).click();
    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);
    cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();

    // check if the component is stopped
    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .contains('SL 0')
      .click({ force: true });

    // check if the led is yellow
    cy
      .get(SHARED_LIBRARY_DOM.component('idComp2'))
      .find('div')
      .should('have.class', 'yellow');
  });

  it('should display read-only informations when deleted', () => {
    cy.visit(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy.login('admin', 'admin');
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    // unload the component
    cy.getElementInPetalsTree(`component`, `Comp 2`).click();
    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp2`);
    cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();
    cy.get(COMPONENT_DOM.buttons.actionState('unload')).click();

    // unload the shared library
    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .contains('SL 0')
      .click();
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);
    cy
      .get(SHARED_LIBRARY_DOM.buttons.unloadSlBtn)
      .should('be.enabled')
      .click();

    // should display a warning message
    cy
      .get(MESSAGE_DOM.texts.msgWarning)
      .contains('This shared library has been removed')
      .scrollIntoView()
      .should('be.visible');

    // should contain all informations
    cy.get(SHARED_LIBRARY_DOM.texts.slName).should('contain', 'SL 0');
    cy.get(SHARED_LIBRARY_DOM.texts.slVersion).should('contain', '1.0.0');

    // should disable unload button
    cy.get(SHARED_LIBRARY_DOM.buttons.unloadSlBtn).should('be.disabled');
  });
});
