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

import { PETALS_TREE_DOM } from '../../../support/petals.dom';
import { SERVICE_ASSEMBLY_DOM } from '../../../support/service-assembly.dom';
import { SERVICE_UNITS_DOM } from '../../../support/service-units.dom';
import { COMPONENT_DOM } from './../../../support/component.dom';

describe('Service-unit', () => {
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
      .contains('SU 0')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);
    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Topology`,
      `Bus 0`,
      `Cont 0`,
      `Comp 0`,
      `SU 0`,
    ]);
  });

  it('should have all su informations', () => {
    cy.get(SERVICE_UNITS_DOM.texts.suName).should('contain', 'About SU 0');
    cy.get(SERVICE_UNITS_DOM.texts.suState).should('contain', 'Started');

    cy.get(SERVICE_UNITS_DOM.texts.saName).should('contain', 'SA 0');
    cy
      .get(SERVICE_UNITS_DOM.led.saStateLed)
      .find('div')
      .should('have.class', 'green');
    cy.get(SERVICE_UNITS_DOM.texts.compName).should('contain', 'Comp 0');
    cy
      .get(SERVICE_UNITS_DOM.led.compStateLed)
      .find('div')
      .should('have.class', 'green');
  });

  it('should go to related service assembly when clicking on sa button', () => {
    cy.get(SERVICE_UNITS_DOM.buttons.saBtn).click();

    // check if it's the right service assembly
    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-assemblies/idSa0`);

    cy
      .get(SERVICE_ASSEMBLY_DOM.texts.saName)
      .should('exist')
      .and('contain', 'About SA 0');
  });

  it('should have same state as sa', () => {
    cy
      .get(SERVICE_UNITS_DOM.led.suStateLed)
      .find('div')
      .should('have.class', 'green');
    cy
      .get(SERVICE_UNITS_DOM.led.saStateLed)
      .find('div')
      .should('have.class', 'green');

    // stop its sa
    cy.get(SERVICE_UNITS_DOM.buttons.saBtn).click();
    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-assemblies/idSa0`);
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('stop')).click();

    // check if it's the state have changed
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.serviceUnitBtn('idSu0')).click();
    cy
      .get(SERVICE_UNITS_DOM.led.suStateLed)
      .find('div')
      .should('have.class', 'yellow');
    cy
      .get(SERVICE_UNITS_DOM.led.saStateLed)
      .find('div')
      .should('have.class', 'yellow');
  });

  it('should go to related component when clicking on sa button', () => {
    cy.get(SERVICE_UNITS_DOM.buttons.compBtn).click();

    // check if it's the right component
    cy.expectLocationToBe(`/workspaces/idWks0/petals/components/idComp0`);
    cy
      .get(COMPONENT_DOM.texts.title)
      .should('exist')
      .and('contain', 'About Comp 0');
  });

  it('should be removed when unloading its sa', () => {
    // unload sa
    cy.get(SERVICE_UNITS_DOM.buttons.saBtn).click();
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('stop')).click();
    cy.get(SERVICE_ASSEMBLY_DOM.buttons.actionState('unload')).click();

    // su is no longer in the list
    cy
      .get(PETALS_TREE_DOM.buttons.workspaceElementBtn)
      .should('not.contain', 'SU 0');
  });
});
