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

import { INTERFACE_OVERVIEW_DOM } from './interface.dom';

Cypress.Commands.add('expectInterfaceNamespaceToBe', interfaceNamespace => {
  cy
    .get(INTERFACE_OVERVIEW_DOM.texts.interfaceNamespace)
    .contains(interfaceNamespace);
});

Cypress.Commands.add(
  'expectServicesListToBe',
  listServicesLocalpartsNamespace => {
    const listItemServices = cy.get(
      INTERFACE_OVERVIEW_DOM.listItem.itemServices
    );

    listItemServices.should(
      'have.length',
      listServicesLocalpartsNamespace.length / 2
    );
    listItemServices.each(($item, index) => {
      const item = cy.wrap($item);
      item.should('contain', listServicesLocalpartsNamespace[index * 2]);
      item.should('contain', listServicesLocalpartsNamespace[index * 2 + 1]);
    });
  }
);

Cypress.Commands.add('expectItfEndpointsListToBe', list => {
  const endpointsNames = cy.get(INTERFACE_OVERVIEW_DOM.texts.endpointsNames);

  endpointsNames.should('have.length', list.length);
  endpointsNames.each(($item, index) => cy.wrap($item).contains(list[index]));
});