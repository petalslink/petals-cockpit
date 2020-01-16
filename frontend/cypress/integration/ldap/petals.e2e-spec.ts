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

import { MENU_DOM } from '../../support/menu.dom';
import { MESSAGE_DOM } from '../../support/message.dom';
import { PETALS_COCKPIT_DOM } from '../../support/petals-cockpit.dom';
import { PETALS_DOM, PETALS_TREE_DOM } from '../../support/petals.dom';
import { WORKSPACES_LIST_DOM } from '../../support/workspaces.dom';

describe(`Petals`, () => {
  const expectedTreeNames = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  beforeEach(() => {
    cy.visit(`/login`);
  });

  it('should active the topology button from the sidebar', () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .should(`not.have.class`, `active`)
      .find('.btn-topology')
      .click();

    cy
      .get('app-sidebar')
      .find('.sidebar-top>button')
      .eq(1)
      .should('have.attr', 'mattooltip', 'Topology')
      .should(`have.class`, `active`);

    // expect to not have bus selected
    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.expectPetalsTreeToBe(expectedTreeNames);

    // TODO: check if no bus is selected
  });

  it(`should have a petals tree`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.get(PETALS_TREE_DOM.navTree.navTreePetals);

    const treeNames = cy.get(PETALS_TREE_DOM.texts.itemsNames);

    treeNames.each((_, index) => cy.contains(expectedTreeNames[index]));
  });

  it(`should fold and unfold Petals Buses/Containers/Components/SUs`, () => {
    // we set a size to avoid clicking on invisible element in tree view
    cy.viewport(1920, 1200);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.expectPetalsTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`bus`, `Bus 0`);

    cy.unfoldElementInTree(`bus`, `Bus 0`);

    cy.expectPetalsTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`container`, `Cont 0`);

    cy.expectPetalsTreeToBe(treeWithCont0Folded);

    cy.unfoldElementInTree(`container`, `Cont 0`);

    cy.expectPetalsTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`component`, `Comp 0`);

    cy.expectPetalsTreeToBe(treeWithComp0Folded);

    cy.unfoldElementInTree(`component`, `Comp 0`);

    cy.expectPetalsTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`category-service-assemblies`, `Service Assemblies`);

    cy.expectPetalsTreeToBe(treeWithSasFolded);

    cy.unfoldElementInTree(`category-service-assemblies`, `Service Assemblies`);

    cy.expectPetalsTreeToBe(expectedTreeNames);
  });

  it(`should unfold found element when searching in Petals menu`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.foldElementInTree(`bus`, `Bus 0`);

    cy.get(PETALS_DOM.inputs.search).type(`su 0`);

    const treeFiltered = [`Bus 0`, `Cont 0`, `Components`, `Comp 0`, `SU 0`];

    cy.expectPetalsTreeToBe(treeFiltered);
  });

  it(`should clear input, focus search bar and unlock tree folding when the message saying no match is closed`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy
      .get(PETALS_DOM.inputs.search)
      .type(`Some random search`)
      .expectFocused();

    cy
      .get(`app-petals-menu-view ${MESSAGE_DOM.texts.msgDetails}`)
      .contains('There is no match with "Some random search".');

    cy.get(MESSAGE_DOM.buttons.cancelMessage).click();

    cy.get(PETALS_DOM.inputs.search).should('be.empty');

    cy.expectPetalsTreeToBe(expectedTreeNames);

    cy.foldElementInTree(`container`, `Cont 0`);

    cy.expectPetalsTreeToBe(treeWithCont0Folded);

    cy.unfoldElementInTree(`container`, `Cont 0`);

    cy.expectPetalsTreeToBe(expectedTreeNames);
  });

  it(`should reset search bar if we go to other location than the topology view`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.get(PETALS_DOM.inputs.search).type(`Comp 0`);

    cy.expectPetalsTreeToBe(availableBusesFilteredComp0);

    cy.get(PETALS_COCKPIT_DOM.buttons.goToAdminPage).click();

    // open menu
    cy.get(MENU_DOM.buttons.toggleMenu).click();

    cy
      .get(`.menu-item-back-wks-list`)
      .find(MENU_DOM.texts.itemNameWksList)
      .click();

    cy
      .get(WORKSPACES_LIST_DOM.texts.workspaceName)
      .contains(`Workspace 0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.get(PETALS_DOM.inputs.search).should('be.empty');

    cy.expectPetalsTreeToBe(expectedTreeNames);
  });

  it(`should filter by bus, container, component, su and categories when searching in Petals menu`, () => {
    // we set a size to avoid clicking on invisible element in tree view
    cy.viewport(1920, 1200);

    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.get(PETALS_DOM.inputs.search).type(`CoMp 0`);

    cy.expectPetalsTreeToBe(availableBusesFilteredComp0);

    cy.expectHighlightedElementToBe([`Comp 0`]);

    cy
      .get(PETALS_DOM.inputs.search)
      .clear()
      .type(`u`);

    cy.expectPetalsTreeToBe(availableBusesFiltered);

    cy.expectHighlightedElementToBe(elementsHighlighted);

    cy
      .get(PETALS_DOM.inputs.search)
      .clear()
      .type(`Service Assemblies`);

    cy.expectPetalsTreeToBe(availableSasCategoriesFiltered);

    cy.expectHighlightedElementToBe([
      `Service Assemblies`,
      `Service Assemblies`,
    ]);
  });

  it(`should fold and unfold a category without changing the url`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.getElementInPetalsTree(`service-unit`, `SU 0`).click();

    cy.foldElementInTree(`container`, `Cont 0`);

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);

    cy.foldElementInTree(`category-service-assemblies`, `Service Assemblies`);

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);
  });

  const treeWithCont0Folded = [
    `Bus 0`,
    `Cont 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const treeWithComp0Folded = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const treeWithSasFolded = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const availableBusesFilteredComp0 = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
  ];

  const availableBusesFiltered = [
    `Bus 0`,
    `Cont 0`,
    `Components`,
    `Comp 0`,
    `SU 0`,
    `SU 2`,
    `Comp 1`,
    `SU 1`,
    `SU 3`,
    `Comp 2`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Shared Libraries`,
    `SL 0`,
    `Cont 1`,
    `Components`,
    `Comp 3`,
    `SU 4`,
    `SU 6`,
    `Comp 4`,
    `SU 5`,
    `SU 7`,
    `Comp 5`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
    `Shared Libraries`,
    `SL 1`,
  ];

  const elementsHighlighted = [
    `Bus 0`,
    `SU 0`,
    `SU 2`,
    `SU 1`,
    `SU 3`,
    `SU 4`,
    `SU 6`,
    `SU 5`,
    `SU 7`,
  ];

  const availableSasCategoriesFiltered = [
    `Bus 0`,
    `Cont 0`,
    `Service Assemblies`,
    `SA 0`,
    `SA 1`,
    `SA 2`,
    `Cont 1`,
    `Service Assemblies`,
    `SA 3`,
    `SA 4`,
    `SA 5`,
  ];
});
