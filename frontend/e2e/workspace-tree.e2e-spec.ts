/**
 * Copyright (C) 2016 Linagora
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

import { element, by } from 'protractor';

describe(`Workspace Tree`, () => {
  it(`should filter by bus, container, component and su when searching in Petals menu`, () => {
    element(by.css(`button.change-workspace`)).click();

    // select the first workspace
    element.all(by.css(`.page-workspaces div.md-list-item`)).get(0).click();

    // test 1 : Display only parents and children, regardless of the case
    element(by.css(`.petals-component input`)).sendKeys(`CoMpOnEnT 0`);

    let availableBusesFiltered = [
      `Bus 0`,
        `Container 0`,
          `Component 0`,
            `SU 0`,
            `SU 1`
    ];

    // angular-material icon's name are displayed
    // in getText() method, remove them
    let listWithoutIcons = element(by.css(`md-sidenav app-buses-menu`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    // check the list content
    expect(listWithoutIcons).toEqual(availableBusesFiltered);

    // angular-material icon's name are displayed
    // in getText() method, remove them
    let itemWithoutIcons = element(by.css(`md-sidenav app-buses-menu .searched`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down')
          .join();
      });
    // check if the searched word is highlighted
    expect(itemWithoutIcons).toEqual(`Component 0`);

    // ---------------------------------------

    // test 2 : Display every element containing 'u' in their name
    element(by.css(`.petals-component input`)).clear();
    element(by.css(`.petals-component input`)).sendKeys(`u`);

    availableBusesFiltered = [
      `Bus 0`,
        `Container 0`,
          `Component 0`,
            `SU 0`,
            `SU 1`,
          `Component 1`,
            `SU 2`,
            `SU 3`,
        `Container 1`,
          `Component 2`,
            `SU 4`,
          `Component 3`,
            `SU 5`,
            `SU 6`
    ];

    listWithoutIcons = element(by.css(`md-sidenav app-buses-menu`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    expect(listWithoutIcons).toEqual(availableBusesFiltered);
    // there should be 8 matches : Bus, SU 0, SU 1, SU 2, SU 3, SU 4, SU 5, SU
    expect(element.all(by.css(`md-sidenav app-buses-menu .searched`)).count()).toEqual(8);

    // ---------------------------------------

    // test 3 : When no match, should display a message and search bar should still be enabled
    element(by.css(`.petals-component input`)).clear();
    element(by.css(`.petals-component input`)).sendKeys(`Some random search`);

    // check that the input is not disabled if no bus/container/component/su match
    expect(element(by.css(`.petals-component input`)).isEnabled()).toBe(true);

    // check there's a warning saying no buses available
    expect(element(by.css(`md-sidenav .info.no-bus`)).getText())
    .toEqual(`The workspace "Workspace 0" doesn't match any bus, container, component or SU with a name containing "Some random search".`);

    availableBusesFiltered = [];

    expect(element(by.css(`md-sidenav app-buses-menu`)).getText()).toEqual(availableBusesFiltered.join(`\n`).trim());
    // there shouldn't be any match
    expect(element.all(by.css(`md-sidenav app-buses-menu .searched`)).count()).toEqual(0);
  });

  it(`should fold and unfold Petals Buses/Containers/Components/SUs`, () => {
    // 1
    element(by.css(`.petals-component input`)).clear();

    // fold the bus 0
    element.all(by.css(`app-buses-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).get(0).click();

    // angular-material icon's name are displayed
    // in getText() method, remove them
    let listWithoutIcons = element(by.css(`md-sidenav app-buses-menu`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    // check the list content
    expect(listWithoutIcons).toEqual([`Bus 0`]);

    // 2
    // unfold the bus 0
    element.all(by.css(`app-buses-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).get(0).click();

    let availableBusesFiltered = [
      `Bus 0`,
        `Container 0`,
          `Component 0`,
            `SU 0`,
            `SU 1`,
          `Component 1`,
            `SU 2`,
            `SU 3`,
        `Container 1`,
          `Component 2`,
            `SU 4`,
          `Component 3`,
            `SU 5`,
            `SU 6`
    ];

    listWithoutIcons = element(by.css(`md-sidenav app-buses-menu`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    expect(listWithoutIcons).toEqual(availableBusesFiltered);

    // 3
    // fold the container 0
    element.all(by.css(`app-containers-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).get(0).click();

    availableBusesFiltered = [
      `Bus 0`,
        `Container 0`,
        `Container 1`,
          `Component 2`,
            `SU 4`,
          `Component 3`,
            `SU 5`,
            `SU 6`
    ];

    listWithoutIcons = element.all(by.css(`md-sidenav app-buses-menu`)).get(0)
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    expect(listWithoutIcons).toEqual(availableBusesFiltered);

    // 4
    // unfold the container 0
    element.all(by.css(`app-containers-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).get(0).click();

    availableBusesFiltered = [
      `Bus 0`,
        `Container 0`,
          `Component 0`,
            `SU 0`,
            `SU 1`,
          `Component 1`,
            `SU 2`,
            `SU 3`,
        `Container 1`,
          `Component 2`,
            `SU 4`,
          `Component 3`,
            `SU 5`,
            `SU 6`
    ];

    listWithoutIcons = element.all(by.css(`md-sidenav app-buses-menu`)).get(0)
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    expect(listWithoutIcons).toEqual(availableBusesFiltered);

    // 5
    // fold the component 0
    element.all(by.css(`app-components-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).get(0).click();

    availableBusesFiltered = [
      `Bus 0`,
        `Container 0`,
          `Component 0`,
          `Component 1`,
            `SU 2`,
            `SU 3`,
        `Container 1`,
          `Component 2`,
            `SU 4`,
          `Component 3`,
            `SU 5`,
            `SU 6`
    ];

    listWithoutIcons = element.all(by.css(`md-sidenav app-buses-menu`)).get(0)
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    expect(listWithoutIcons).toEqual(availableBusesFiltered);

    // 6
    // unfold the component 0
    element.all(by.css(`app-components-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).get(0).click();

    availableBusesFiltered = [
      `Bus 0`,
        `Container 0`,
          `Component 0`,
            `SU 0`,
            `SU 1`,
          `Component 1`,
            `SU 2`,
            `SU 3`,
        `Container 1`,
          `Component 2`,
            `SU 4`,
          `Component 3`,
            `SU 5`,
            `SU 6`
    ];

    listWithoutIcons = element.all(by.css(`md-sidenav app-buses-menu`)).get(0)
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    expect(listWithoutIcons).toEqual(availableBusesFiltered);
  });
});
