/**
 * Copyright (C) 2018-2019 Linagora
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
  COMPONENT_OPERATIONS_DOM,
  COMPONENT_OV_SL_DOM,
  COMPONENT_UPLOAD_DOM,
} from './component.dom';

Cypress.Commands.add('getActionStateInLifecycleComponent', name => {
  return cy.get(COMPONENT_OPERATIONS_DOM.buttons.actionState).contains(name);
});

Cypress.Commands.add(
  'checkOverrideSharedLibrariesInputs',
  expectedSharedLibraries => {
    cy
      .get(COMPONENT_OV_SL_DOM.slInputs)
      .should('have.length', expectedSharedLibraries.length)
      .each(($el, index) => {
        expect($el.val()).equals(expectedSharedLibraries[index]);
      });
  }
);

Cypress.Commands.add(
  'checkUploadComponentSharedLibraries',
  expectedSharedLibraries => {
    const slList = cy.get(COMPONENT_UPLOAD_DOM.slList);
    slList.should('have.length', expectedSharedLibraries.length / 2);
    expectedSharedLibraries.forEach((sl: any) => {
      slList.should('contain', sl);
    });
  }
);
