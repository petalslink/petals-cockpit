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

import { SHARED_LIBRARY_DOM } from '../../support/shared-library.dom';

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
  });

  it('should have shared-library details', () => {
    cy
      .get('.mat-list-item-content')
      .contains('SL 0')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/shared-libraries/idSl0`);

    cy.get(SHARED_LIBRARY_DOM.texts.slName).should('contain', 'SL 0');

    cy.get(SHARED_LIBRARY_DOM.texts.slVersion).should('contain', '1.0.0');
  });
});
