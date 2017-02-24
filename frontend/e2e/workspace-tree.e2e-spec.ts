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
import { browser, element, by, ExpectedConditions as EC } from 'protractor';

import { PetalsCockpitPage } from './app.po';

describe(`Workspaces Tree`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
    page.login(`admin`, `admin`);
    element.all(by.css(`app-workspaces-dialog md-card`)).first().click();
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);
  });

  it(`should filter by bus, container, component and su when searching in Petals menu`, () => {
    // test 1 : Display only parents and children, regardless of the case
    page.search(`CoMp 0`);

    const availableBusesFilteredComp0 = [
      `Bus 0`,
        `Cont 0`,
          `Comp 0`,
            `SU 0`,
            `SU 1`
    ];

    // check the list content
    expect(page.getWorkspaceTree()).toEqual(availableBusesFilteredComp0);

    // check if the searched word is highlighted
    expect(page.getHighlightedElement()).toEqual([`Comp 0`]);

    // ---------------------------------------
    // test 2 : Display every element containing 'u' in their name
    page.search(`u`);

    const availableBusesFilteredU = [
      `Bus 0`,
        `Cont 0`,
          `Comp 0`,
            `SU 0`,
            `SU 1`,
          `Comp 1`,
            `SU 2`,
            `SU 3`,
        `Cont 1`,
          `Comp 2`,
            `SU 4`,
            `SU 5`,
          `Comp 3`,
            `SU 6`,
            `SU 7`
    ];

    expect(page.getWorkspaceTree()).toEqual(availableBusesFilteredU);

    // there should be 8 matches : Bus, SU 0, SU 1, SU 2, SU 3, SU 4, SU 5, SU 6, SU 7
    expect(page.getHighlightedElement().then(e => e.length)).toEqual(9);

    // ---------------------------------------
    // test 3 : When no match, should display a message and search bar should still be enabled
    page.search(`Some random search`);

    expect(element(by.css(`app-cockpit md-sidenav .info.no-match`)).getText())
      .toEqual(`There is no match with "Some random search".`);

    // there shouldn't be any match
    expect(page.getWorkspaceTree()).toEqual([]);
  });

  it(`should fold and unfold Petals Buses/Containers/Components/SUs`, () => {
    const firstBusFolder = page.getWorkspaceTreeFolder(1);

    // 1) fold the bus 0
    firstBusFolder.click();

    // check the list content
    expect(page.getWorkspaceTree()).toEqual([`Bus 0`]);

    // 2) unfold the bus 0
    firstBusFolder.click();

    const availableBuses = [
      `Bus 0`,
        `Cont 0`,
          `Comp 0`,
            `SU 0`,
            `SU 1`,
          `Comp 1`,
            `SU 2`,
            `SU 3`,
        `Cont 1`,
          `Comp 2`,
            `SU 4`,
            `SU 5`,
          `Comp 3`,
            `SU 6`,
            `SU 7`
    ];

    expect(page.getWorkspaceTree()).toEqual(availableBuses);

    // 3) fold the container 0

    const firstContFolder = page.getWorkspaceTreeFolder(2);

    firstContFolder.click();

    let availableBusesFolded = [
      `Bus 0`,
        `Cont 0`,
        `Cont 1`,
          `Comp 2`,
            `SU 4`,
            `SU 5`,
          `Comp 3`,
            `SU 6`,
            `SU 7`
    ];

    expect(page.getWorkspaceTree()).toEqual(availableBusesFolded);

    // 4) unfold the container 0
    firstContFolder.click();

    expect(page.getWorkspaceTree()).toEqual(availableBuses);
    // 5) fold the component 0
    const firstCompFolder = page.getWorkspaceTreeFolder(3);

    firstCompFolder.click();

    availableBusesFolded = [
      `Bus 0`,
        `Cont 0`,
          `Comp 0`,
          `Comp 1`,
            `SU 2`,
            `SU 3`,
        `Cont 1`,
          `Comp 2`,
            `SU 4`,
            `SU 5`,
          `Comp 3`,
            `SU 6`,
            `SU 7`
    ];

    expect(page.getWorkspaceTree()).toEqual(availableBusesFolded);

    // 6) unfold the component 0
    firstCompFolder.click();

    expect(page.getWorkspaceTree()).toEqual(availableBuses);
  });

  it(`should unfold found element when searching in Petals menu`, () => {
    const firstBusFolder = page.getWorkspaceTreeFolder(1);

    firstBusFolder.click();

    page.search(`su 0`);

    const availableBusesFiltered = [
      `Bus 0`,
      `Cont 0`,
      `Comp 0`,
      `SU 0`
    ];

    expect(page.getWorkspaceTree()).toEqual(availableBusesFiltered);
  });
});
