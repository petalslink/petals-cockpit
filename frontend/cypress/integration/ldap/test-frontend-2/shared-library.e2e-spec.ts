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

describe('Shared-library', () => {
  beforeEach(() => {
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

  it('should have shared-library details', () => {
    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);

    cy.get(SHARED_LIBRARY_DOM.texts.slName).should('contain', 'SL 0');

    cy.get(SHARED_LIBRARY_DOM.texts.slVersion).should('contain', '1.0.0');
  });

  it('should unload a shared-library', () => {
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
