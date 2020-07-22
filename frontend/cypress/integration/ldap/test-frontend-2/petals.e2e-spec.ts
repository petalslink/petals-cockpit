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

import { BREADCRUMB_DOM } from '../../../support/breadcrumb.dom';
import { expectedInitializedWks0Tree } from '../../../support/helper.const';
import { MENU_DOM } from '../../../support/menu.dom';
import { MESSAGE_DOM } from '../../../support/message.dom';
import { PETALS_COCKPIT_DOM } from '../../../support/petals-cockpit.dom';
import { PETALS_DOM, PETALS_TREE_DOM } from '../../../support/petals.dom';
import { WORKSPACES_LIST_DOM } from '../../../support/workspaces.dom';

describe(`Petals`, () => {
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

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

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

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);
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

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

    cy.get(PETALS_TREE_DOM.buttons.expandableBtn('bus', 'idBus0')).click();

    cy.get(PETALS_TREE_DOM.buttons.expandableBtn('bus', 'idBus0')).click();

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('container', 'idCont0'))
      .click();

    cy.expectPetalsTreeToBe(treeWithCont0Folded);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('container', 'idCont0'))
      .click();

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('component', 'idComp0'))
      .click();

    cy.expectPetalsTreeToBe(treeWithComp0Folded);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('component', 'idComp0'))
      .click();

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('sacategory', 'idCont0'))
      .click();

    cy.expectPetalsTreeToBe(treeWithSasFolded);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('sacategory', 'idCont0'))
      .click();

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);
  });

  it(`should unfold found element when searching in Petals menu`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.get(PETALS_TREE_DOM.buttons.expandableBtn('bus', 'idBus0')).click();

    cy.get(PETALS_DOM.inputs.search).type(`su 0`);

    const treeFiltered = [
      { elementName: `Bus 0` },
      { elementName: `Cont 0` },
      { elementName: `Components` },
      { elementName: `Comp 0`, state: 'Started' },
      { elementName: `SU 0`, state: 'Started' },
    ];

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

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('container', 'idCont0'))
      .click();

    cy.expectPetalsTreeToBe(treeWithCont0Folded);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('container', 'idCont0'))
      .click();

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);
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

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);
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

    cy.expectPetalsTreeToBe(expectedInitializedWks0Tree);

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

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('container', 'idCont0'))
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);

    cy
      .get(PETALS_TREE_DOM.buttons.expandableBtn('sacategory', 'idCont1'))
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/service-units/idSu0`);
  });

  it(`should redirect when clicking on breadcrumbs element`, () => {
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get('app-sidebar')
      .find('.btn-topology')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals`);

    cy.getElementInPetalsTree(`service-unit`, `SU 0`).click();
    cy.expectBreadcrumbsToBe([
      `Workspace 0`,
      `Topology`,
      `Bus 0`,
      `Cont 0`,
      `Comp 0`,
      `SU 0`,
    ]);

    cy
      .get(BREADCRUMB_DOM.texts.itemName)
      .eq(2)
      .should('contain', `Bus 0`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus0`);
  });

  const treeWithCont0Folded = [
    { elementName: `Bus 0` },
    { elementName: `Cont 0` },
    { elementName: `Cont 1` },
    { elementName: `Components` },
    { elementName: `Comp 3`, state: 'Started' },
    { elementName: `SU 4`, state: 'Started' },
    { elementName: `SU 6`, state: 'Started' },
    { elementName: `Comp 4`, state: 'Started' },
    { elementName: `SU 5`, state: 'Started' },
    { elementName: `SU 7`, state: 'Started' },
    { elementName: `Comp 5`, state: 'Started' },
    { elementName: `Service Assemblies` },
    { elementName: `SA 3`, state: 'Started' },
    { elementName: `SA 4`, state: 'Started' },
    { elementName: `SA 5`, state: 'Started' },
    { elementName: `Shared Libraries` },
    { elementName: `SL 1` },
  ];

  const treeWithComp0Folded = [
    { elementName: `Bus 0` },
    { elementName: `Cont 0` },
    { elementName: `Components` },
    { elementName: `Comp 0`, state: 'Started' },
    { elementName: `Comp 1`, state: 'Started' },
    { elementName: `SU 1`, state: 'Started' },
    { elementName: `SU 3`, state: 'Started' },
    { elementName: `Comp 2`, state: 'Started' },
    { elementName: `Service Assemblies` },
    { elementName: `SA 0`, state: 'Started' },
    { elementName: `SA 1`, state: 'Started' },
    { elementName: `SA 2`, state: 'Started' },
    { elementName: `Shared Libraries` },
    { elementName: `SL 0` },
    { elementName: `Cont 1` },
    { elementName: `Components` },
    { elementName: `Comp 3`, state: 'Started' },
    { elementName: `SU 4`, state: 'Started' },
    { elementName: `SU 6`, state: 'Started' },
    { elementName: `Comp 4`, state: 'Started' },
    { elementName: `SU 5`, state: 'Started' },
    { elementName: `SU 7`, state: 'Started' },
    { elementName: `Comp 5`, state: 'Started' },
    { elementName: `Service Assemblies` },
    { elementName: `SA 3`, state: 'Started' },
    { elementName: `SA 4`, state: 'Started' },
    { elementName: `SA 5`, state: 'Started' },
    { elementName: `Shared Libraries` },
    { elementName: `SL 1` },
  ];

  const treeWithSasFolded = [
    { elementName: `Bus 0` },
    { elementName: `Cont 0` },
    { elementName: `Components` },
    { elementName: `Comp 0`, state: 'Started' },
    { elementName: `SU 0`, state: 'Started' },
    { elementName: `SU 2`, state: 'Started' },
    { elementName: `Comp 1`, state: 'Started' },
    { elementName: `SU 1`, state: 'Started' },
    { elementName: `SU 3`, state: 'Started' },
    { elementName: `Comp 2`, state: 'Started' },
    { elementName: `Service Assemblies` },
    { elementName: `Shared Libraries` },
    { elementName: `SL 0` },
    { elementName: `Cont 1` },
    { elementName: `Components` },
    { elementName: `Comp 3`, state: 'Started' },
    { elementName: `SU 4`, state: 'Started' },
    { elementName: `SU 6`, state: 'Started' },
    { elementName: `Comp 4`, state: 'Started' },
    { elementName: `SU 5`, state: 'Started' },
    { elementName: `SU 7`, state: 'Started' },
    { elementName: `Comp 5`, state: 'Started' },
    { elementName: `Service Assemblies` },
    { elementName: `SA 3`, state: 'Started' },
    { elementName: `SA 4`, state: 'Started' },
    { elementName: `SA 5`, state: 'Started' },
    { elementName: `Shared Libraries` },
    { elementName: `SL 1` },
  ];

  const availableBusesFilteredComp0: {
    elementName: string;
    state?: string;
  }[] = [
    { elementName: `Bus 0` },
    { elementName: `Cont 0` },
    { elementName: `Components` },
    { elementName: `Comp 0`, state: 'Started' },
    { elementName: `SU 0`, state: 'Started' },
    { elementName: `SU 2`, state: 'Started' },
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

  const availableSasCategoriesFiltered: {
    elementName: string;
    state?: string;
  }[] = [
    { elementName: `Bus 0` },
    { elementName: `Cont 0` },
    { elementName: `Service Assemblies` },
    { elementName: `SA 0`, state: 'Started' },
    { elementName: `SA 1`, state: 'Started' },
    { elementName: `SA 2`, state: 'Started' },
    { elementName: `Cont 1` },
    { elementName: `Service Assemblies` },
    { elementName: `SA 3`, state: 'Started' },
    { elementName: `SA 4`, state: 'Started' },
    { elementName: `SA 5`, state: 'Started' },
  ];
});
