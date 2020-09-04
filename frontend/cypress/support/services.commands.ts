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

import { BREADCRUMB_DOM } from './breadcrumb.dom';
import { COMPONENT_DOM } from './component.dom';
import { MENU_DOM } from './menu.dom';
import { SERVICES_TREE_DOM } from './services.dom';
import { WORKSPACES_LIST_DOM } from './workspaces.dom';

Cypress.Commands.add('clickElementInTree', (serviceType, path) => {
  // Type can be: namespace, localpart, endpoint, interface
  // Visibility bugged: we force the action to click to disables waiting for actionability
  return (
    cy
      .get(`.service-element-node-${serviceType}-${path}`)
      // should take the first one if there are several elements
      .eq(0)
      .click()
  );
});

Cypress.Commands.add(
  'expectServicesTreeToBe',
  (tree: { elementName: string }[], filtered?: string) => {
    filtered = 'filtered';
    if (!filtered) {
      cy
        .get(SERVICES_TREE_DOM.texts.treeElementsName)
        .should('have.length', tree.length);

      cy.get(SERVICES_TREE_DOM.allNodes).each((elm, index) => {
        cy
          .wrap(elm)
          .find(SERVICES_TREE_DOM.texts.treeElementsName)
          .contains(tree[index].elementName);
      });
    } else {
      cy
        .get(SERVICES_TREE_DOM.treeNodeVisible)
        .should('have.length', tree.length);

      cy.get(SERVICES_TREE_DOM.treeNodeVisible).each((elm, index) => {
        cy
          .wrap(elm)
          .find(SERVICES_TREE_DOM.texts.treeElementsName)
          .contains(tree[index].elementName);
      });
    }
  }
);

Cypress.Commands.add('triggerSSEForComp', (name, id) => {
  cy
    .get('app-sidebar')
    .find('.btn-topology')
    .click();

  cy.expectLocationToBe(`/workspaces/idWks0/petals`);

  cy.getElementInPetalsTree(`component`, name).click();

  cy.expectLocationToBe(`/workspaces/idWks0/petals/components/${id}`);

  // TODO: we should check the state of the component when we migrate the component tests made with Protractor

  cy.get(COMPONENT_DOM.buttons.actionState('stop')).click();

  cy
    .get('app-sidebar')
    .find('.btn-services')
    .click();

  cy.expectLocationToBe(`/workspaces/idWks0/services`);

  // TODO: we should check the state of the component when we migrate the component tests made with Protractor
});

Cypress.Commands.add('triggerSSEForWks', (name, id) => {
  cy
    .get('app-sidebar')
    .find('.btn-services')
    .click();

  cy.expectLocationToBe(`/workspaces/idWks0/services`);

  // open menu
  cy
    .get(MENU_DOM.buttons.toggleMenu)
    .should('be.visible')
    .click();

  cy
    .get(`.menu-item-back-wks-list`)
    .find(MENU_DOM.texts.itemNameWksList)
    .should('contain', `Back to Workspaces`)
    .and('be.visible')
    .click();

  cy.expectWorkspacesListToBe([
    `Workspace 0`,
    `This is short description for the Workspace 0.`,
    `Workspace 1`,
    `No description provided.`,
  ]);

  const workspacesListNames = cy.get(WORKSPACES_LIST_DOM.texts.workspaceName);

  workspacesListNames.contains(name).click();

  cy.expectLocationToBe(`/workspaces/${id}`);

  // expect to have workspace name
  cy.get(BREADCRUMB_DOM.texts.itemName).should('contain', 'Workspace 1');

  cy
    .get('app-sidebar')
    .find('.btn-services')
    .click();

  cy.expectLocationToBe(`/workspaces/idWks1/services`);
});
