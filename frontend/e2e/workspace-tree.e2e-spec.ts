/**
 * Copyright (C) 2017 Linagora
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

import { $, browser } from 'protractor';

import { page } from './common';
import { WorkspacePage } from './pages/workspace.po';

describe(`Workspaces Tree`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace('admin', 'admin');
  });

  it(`should contain the correct buses`, () => {
    // check that buses/container/component/su are available
    const availableBuses = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `SU 0`,
      `SU 2`,
      `Comp 1`,
      `SU 1`,
      `SU 3`,
      `Comp 2`,
      `SERVICE ASSEMBLIES`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `SHARED LIBRARIES`,
      `SL 0`,
      `Cont 1`,
      `COMPONENTS`,
      `Comp 3`,
      `SU 4`,
      `SU 6`,
      `Comp 4`,
      `SU 5`,
      `SU 7`,
      `Comp 5`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
      `SHARED LIBRARIES`,
      `SL 1`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(availableBuses);
  });

  it(`should contain the correct buses in progress`, () => {
    // check that 2 bus in progress are displayed
    expect(workspace.busesInProgress.count()).toEqual(2);

    // check that buses/container/component/su are available
    const availableBusesInProgress = [`192.168.0.1:7700`, `192.168.0.2:7700`];

    expect(workspace.busesInProgress.$$('span').getText()).toEqual(
      availableBusesInProgress
    );
  });

  it(`should filter by bus, container, component, su and categories when searching in Petals menu`, () => {
    // test 1 : Display only parents and children, regardless of the case
    workspace.search(`CoMp 0`);

    const availableBusesFilteredComp0 = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `SU 0`,
      `SU 2`,
    ];

    // check the list content
    expect(workspace.getWorkspaceTree()).toEqual(availableBusesFilteredComp0);

    // check if the searched word is highlighted
    expect(workspace.getHighlightedElement()).toEqual([`Comp 0`]);

    // ---------------------------------------
    // test 2 : Display every element containing 'u' in their name
    workspace.search(`u`);

    const availableBusesFilteredU = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `SU 0`,
      `SU 2`,
      `Comp 1`,
      `SU 1`,
      `SU 3`,
      `Comp 2`,
      `SERVICE ASSEMBLIES`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `SHARED LIBRARIES`,
      `SL 0`,
      `Cont 1`,
      `COMPONENTS`,
      `Comp 3`,
      `SU 4`,
      `SU 6`,
      `Comp 4`,
      `SU 5`,
      `SU 7`,
      `Comp 5`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
      `SHARED LIBRARIES`,
      `SL 1`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(availableBusesFilteredU);

    expect(workspace.getHighlightedElement().then(e => e.length)).toEqual(9);

    // ---------------------------------------
    // test 3 : When no match, should display a message and search bar should still be enabled
    workspace.search(`Some random search`);

    expect($(`app-cockpit md-sidenav .info.no-match`).getText()).toEqual(
      `There is no match with "Some random search".`
    );

    // there shouldn't be any match
    expect(workspace.getWorkspaceTree()).toEqual([]);

    // ---------------------------------------
    // test 4 : Display every element containing 'SERVICE ASSEMBLIES' in their name
    workspace.search(`SERVICE ASSEMBLIES`);

    const availableSasCategoriesFilteredU = [
      `Bus 0`,
      `Cont 0`,
      `SERVICE ASSEMBLIES`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `Cont 1`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(
      availableSasCategoriesFilteredU
    );

    expect(workspace.getHighlightedElement().then(e => e.length)).toEqual(2);
  });

  it(`should fold and unfold a category and doesn't change the url`, () => {
    workspace.openServiceUnit('SU 0');

    workspace.treeElementFolder(0, 'container').click();

    expect(browser.getCurrentUrl()).toMatch(
      /\/workspaces\/\w+\/petals\/service-units\/\w+/
    );

    workspace.treeElement(0, 'category-service-assemblies').click();

    expect(browser.getCurrentUrl()).toMatch(
      /\/workspaces\/\w+\/petals\/service-units\/\w+/
    );
  });

  it(`should fold and unfold Petals Buses/Containers/Components/SUs`, () => {
    const firstBusFolder = workspace.treeElementFolder(0, 'bus');

    // 1) fold the bus 0
    firstBusFolder.click();

    // check the list content
    expect(workspace.getWorkspaceTree()).toEqual([`Bus 0`]);

    // 2) unfold the bus 0
    firstBusFolder.click();

    const availableBuses = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `SU 0`,
      `SU 2`,
      `Comp 1`,
      `SU 1`,
      `SU 3`,
      `Comp 2`,
      `SERVICE ASSEMBLIES`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `SHARED LIBRARIES`,
      `SL 0`,
      `Cont 1`,
      `COMPONENTS`,
      `Comp 3`,
      `SU 4`,
      `SU 6`,
      `Comp 4`,
      `SU 5`,
      `SU 7`,
      `Comp 5`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
      `SHARED LIBRARIES`,
      `SL 1`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(availableBuses);

    // 3) fold the container 0

    const firstContFolder = workspace.treeElementFolder(0, 'container');

    firstContFolder.click();

    let availableBusesFolded = [
      `Bus 0`,
      `Cont 0`,
      `Cont 1`,
      `COMPONENTS`,
      `Comp 3`,
      `SU 4`,
      `SU 6`,
      `Comp 4`,
      `SU 5`,
      `SU 7`,
      `Comp 5`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
      `SHARED LIBRARIES`,
      `SL 1`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(availableBusesFolded);

    // 4) unfold the container 0
    firstContFolder.click();

    expect(workspace.getWorkspaceTree()).toEqual(availableBuses);
    // 5) fold the component 0
    const firstCompFolder = workspace.treeElementFolder(0, 'component');

    firstCompFolder.click();

    availableBusesFolded = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `Comp 1`,
      `SU 1`,
      `SU 3`,
      `Comp 2`,
      `SERVICE ASSEMBLIES`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `SHARED LIBRARIES`,
      `SL 0`,
      `Cont 1`,
      `COMPONENTS`,
      `Comp 3`,
      `SU 4`,
      `SU 6`,
      `Comp 4`,
      `SU 5`,
      `SU 7`,
      `Comp 5`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
      `SHARED LIBRARIES`,
      `SL 1`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(availableBusesFolded);

    // 6) unfold the component 0
    firstCompFolder.click();

    expect(workspace.getWorkspaceTree()).toEqual(availableBuses);
  });

  it(`should unfold found element when searching in Petals menu`, () => {
    const firstBusFolder = workspace.treeElementFolder(0, 'bus');

    firstBusFolder.click();

    workspace.search(`su 0`);

    const availableBusesFiltered = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `SU 0`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(availableBusesFiltered);
  });
});
