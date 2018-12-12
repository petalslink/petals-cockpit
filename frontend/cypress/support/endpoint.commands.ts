/**
 * Copyright (C) 2018 Linagora
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

import { ENDPOINT_OVERVIEW_DOM } from './endpoint.dom';

Cypress.Commands.add('getNameInEndpointLocation', (classe, name) => {
  // class can be: bus, container, component
  return cy.get(`.${classe}`).contains(name);
});

Cypress.Commands.add(
  'expectEdpInterfacesListToBe',
  listInterfacesLocalpartsNamespaces => {
    const listItemInterfaces = cy.get(
      ENDPOINT_OVERVIEW_DOM.listItem.itemInterfaces
    );

    listItemInterfaces.should(
      'have.length',
      listInterfacesLocalpartsNamespaces.length / 2
    );
    listItemInterfaces.each(($item, index) => {
      const item = cy.wrap($item);
      item.should('contain', listInterfacesLocalpartsNamespaces[index * 2]);
      item.should('contain', listInterfacesLocalpartsNamespaces[index * 2 + 1]);
    });
  }
);
