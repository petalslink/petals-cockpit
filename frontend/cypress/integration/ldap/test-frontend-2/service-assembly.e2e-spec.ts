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
import { SERVICE_ASSEMBLY_DOM } from '../../../support/service-assembly.dom';
import { SERVICE_UNITS_DOM } from '../../../support/service-units.dom';

describe('Service-assembly', () => {
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
      .contains('SA 0')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-assemblies/idSa0`);
    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Topology`,
      `Bus 0`,
      `Cont 0`,
      `SA 0`,
    ]);
  });

  it('should have all sa informations', () => {
    cy.get(SERVICE_ASSEMBLY_DOM.texts.saName).should('contain', 'About SA 0');
    cy
      .get(SERVICE_ASSEMBLY_DOM.messages.saMessage)
      .should('contain', 'Changing the state of a SA will affect its SUs.');

    cy.checkLifecycleState(SERVICE_ASSEMBLY_DOM.texts.saState, 'Started');
    cy.expectPossibleStatesListToBe(
      SERVICE_ASSEMBLY_DOM.buttons.allActionsStates,
      [`Stop`]
    );

    cy
      .get(SERVICE_ASSEMBLY_DOM.buttons.serviceUnitBtn('idSu0'))
      .should('exist');
    cy
      .get(SERVICE_ASSEMBLY_DOM.buttons.relatedComponentBtn('idSu0'))
      .should('exist');
  });

  it('should stop a sa and restart it', () => {
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('stop')).click();

    cy.checkLifecycleState(SERVICE_ASSEMBLY_DOM.texts.saState, 'Stopped');
    cy.expectPossibleStatesListToBe(
      SERVICE_ASSEMBLY_DOM.buttons.allActionsStates,
      [`Start`, `Unload`]
    );

    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('start')).click();

    cy.checkLifecycleState(SERVICE_ASSEMBLY_DOM.texts.saState, 'Started');
    cy.expectPossibleStatesListToBe(
      SERVICE_ASSEMBLY_DOM.buttons.allActionsStates,
      [`Stop`]
    );
  });

  it('should unload a sa', () => {
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('stop')).click();
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('unload')).click();

    // sa is no longer in the list
    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .should('not.contain', 'SA 0');
  });

  it('should display read-only informations when deleted', () => {
    // unload the sa
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('stop')).click();
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('unload')).click();

    // should display a warning message
    cy
      .get(MESSAGE_DOM.texts.msgWarning)
      .contains('This service assembly has been removed')
      .scrollIntoView()
      .should('be.visible');

    // should contain all informations
    cy.get(SERVICE_ASSEMBLY_DOM.texts.saName).should('contain', 'About SA 0');
    cy
      .get(SERVICE_ASSEMBLY_DOM.messages.saMessage)
      .should('contain', 'Changing the state of a SA will affect its SUs.');

    cy.checkLifecycleState(SERVICE_ASSEMBLY_DOM.texts.saState, 'Stopped');
  });

  it('should go to related su view when clicking a service-unit button', () => {
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.serviceUnitBtn('idSu0')).click();

    // check if it's the right SU
    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);
    cy.get(SERVICE_UNITS_DOM.texts.suName).contains('About SU 0');
  });

  it('should go to related component view when clicking a component button', () => {
    cy
      .get(SERVICE_ASSEMBLY_DOM.buttons.relatedComponentBtn('idSu0'))
      .should('have.class', 'comp-idComp0')
      .click();

    // check if it's the right component
    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);
    cy.get(COMPONENT_DOM.texts.title).contains('About Comp 0');
  });
});
