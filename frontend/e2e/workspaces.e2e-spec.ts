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

import { browser, element, by } from 'protractor';

// IDs from mock are of this type 559b4c47-5026-435c-bd6e-a47a903a7ba5
// IDs from server are integer
// create a regex that allows both
let reId = '(([0-9]+)|([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}))';

describe(`Workspaces`, () => {
  it(`should not have any workspace selected`, () => {
    expect(browser.getCurrentUrl()).toMatch(/cockpit\/workspaces$/);

    // check there's a warning saying that no workspace is selected
    expect(element(by.css(`md-sidenav .info.no-workspace-selected`)).getText()).toEqual(`No workspace selected\nPlease select one`);

    // check that the buttons showing :
    // - the current workspace
    // - the button to choose a workspace
    // are not shown
    expect(element(by.css(`md-sidenav .workspace-name`)).isPresent()).toEqual(false);
    expect(element(by.css(`md-sidenav .change-workspace`)).isPresent()).toEqual(false);

    // even if no selected, check that 2 workspaces are displayed
    expect(element.all(by.css(`.page-workspaces div.md-list-item`)).count()).toEqual(2);
    let workspacesAndOwners = [
      `Workspace 0`,
        `You're the only one to use this workspace`,
      `Workspace 1`,
        `Workspace also used by mrobert`
    ];
    expect(element(by.css(`.page-workspaces md-nav-list`)).getText()).toEqual(workspacesAndOwners.join(`\n`));

    // among those 2 workspaces, check that none is selected (have a particular class)
    expect(element.all(by.css(`.page-workspaces div.md-list-item .color-primary-bold`)).count()).toEqual(0);
  });

  it(`should select a workspace when clicking on his line`, () => {
    // select the first workspace
    element.all(by.css(`.page-workspaces div.md-list-item`)).get(0).click();

    // check that url is set to Petals by default
    expect(browser.getCurrentUrl()).toMatch(new RegExp(`/cockpit/workspaces/${reId}/petals$`));

    // check that there's no warning saying no bus ...
    expect(element(by.css(`md-sidenav .info.no-bus`)).isPresent()).toBe(false);

    // check that the buttons showing :
    // - the current workspace
    // - the button to choose a workspace
    // are shown
    expect(element(by.css(`md-sidenav .workspace-name`)).isPresent()).toEqual(true);
    expect(element(by.css(`md-sidenav .change-workspace`)).isPresent()).toEqual(true);

    /// and that the first bus has the 'searched' class to highlight it
    let itemWithoutIcons = element(by.css(`md-sidenav app-buses-menu .md-list-item > span[classtoapply="searched"]`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down')
          .join();
      });
    expect(itemWithoutIcons).toEqual(`Bus 0`);

    // there shouldn't be a title 'buses in progress'
    expect(element(by.css(`.buses-in-progress h3`)).isPresent()).toBe(false);

    // check that buses/container/component/su are available
    let availableBuses = [
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

    // angular-material icon's name are displayed
    // in getText() method, remove them
    let listWithoutIcons = element(by.css(`md-sidenav app-buses-menu`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down')
      });

    expect(listWithoutIcons).toEqual(availableBuses);
  });

  it(`should filter by bus, container, component and su when searching in Petals menu`, () => {
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
          .filter((t: string) => t !== 'arrow_drop_down')
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
    element(by.css(`app-buses-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).click();

    // angular-material icon's name are displayed
    // in getText() method, remove them
    let listWithoutIcons = element(by.css(`md-sidenav app-buses-menu`))
      .getText()
      .then((txt: string) => {
        return txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down')
      });

    // check the list content
    expect(listWithoutIcons).toEqual([`Bus 0`]);

    // 2
    // unfold the bus 0
    element(by.css(`app-buses-menu md-nav-list md-icon[aria-label="arrow_drop_down"]`)).click();

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
          .filter((t: string) => t !== 'arrow_drop_down')
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
          .filter((t: string) => t !== 'arrow_drop_down')
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
          .filter((t: string) => t !== 'arrow_drop_down')
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
          .filter((t: string) => t !== 'arrow_drop_down')
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
          .filter((t: string) => t !== 'arrow_drop_down')
      });

    expect(listWithoutIcons).toEqual(availableBusesFiltered);
  });

  it(`should create a new workspace and this workspace shouldn't have any bus`, () => {
    element(by.css(`button.change-workspace`)).click();

    // reveal the part to add a workspace
    element(by.css(`button.btn-show-panel-add-workspace`)).click();

    // create 'Test' workspace
    element(by.css(`md-input.new-workspace-name input`)).sendKeys(`Test`);
    element(by.css(`.btn-add-workspace`)).click();

    // no need to select the new workspace, it should be auto-selected after being created

    // check that the URL is set to this workspace
    // this is not really accurate as we do not test the ID in particular
    // TODO: find a way to know the IDs on mock and also IDs from real server
    expect(browser.getCurrentUrl())
      .toMatch(new RegExp(`/cockpit/workspaces/${reId}/petals$`));

    // check there's a warning saying no buses available
    expect(element(by.css(`md-sidenav .info.no-bus`)).getText())
      .toEqual(`The workspace "Test" doesn't have any bus or bus in progress. You may want to import one.`);

    // come back on workspace's list
    element(by.css(`md-sidenav button.change-workspace`)).click();

    // check that 3 workspaces are listed
    expect(element.all(by.css(`.page-workspaces div.md-list-item`)).count()).toEqual(3);
    let workspacesAndOwners = [
      `Workspace 0`,
        `You're the only one to use this workspace`,
      `Workspace 1`,
        `Workspace also used by mrobert`,
      `Test`,
        `You're the only one to use this workspace`
    ];
    expect(element(by.css(`.page-workspaces md-nav-list`)).getText()).toEqual(workspacesAndOwners.join(`\n`));
  });
});
