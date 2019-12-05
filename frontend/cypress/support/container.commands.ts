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

import { ARTIFACT_DEPLOYMENT_DOM } from './container.dom';

Cypress.Commands.add('expectSlListToBe', slList => {
  const cellNamesVersions = cy
    .get(ARTIFACT_DEPLOYMENT_DOM.table.slsTable)
    .find('td.cell-status')
    .prevAll();

  cellNamesVersions.should('have.length', slList.length);
  cellNamesVersions.each(($cell, index) =>
    cy.wrap($cell).contains(slList[index])
  );
});
