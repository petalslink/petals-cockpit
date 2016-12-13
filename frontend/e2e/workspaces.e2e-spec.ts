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
    expect(browser.getCurrentUrl()).toMatch(new RegExp(`/cockpit/workspaces/${reId}$`));

    // check that the page displayed has a title with the workspace name
    expect(element.all(by.css(`app-workspace md-toolbar md-toolbar-row > span`)).get(0).getText()).toEqual(`Workspace 0`);

    // check that there's no warning saying no bus ...
    expect(element(by.css(`md-sidenav .info.no-bus`)).isPresent()).toBe(false);

    // check that the buttons showing :
    // - the current workspace
    // - the button to choose a workspace
    // are shown
    expect(element(by.css(`md-sidenav .workspace-name`)).isPresent()).toEqual(true);
    expect(element(by.css(`md-sidenav .change-workspace`)).isPresent()).toEqual(true);

    /// and that the first bus has the 'searched' class to highlight it
    let itemWithoutIcons = element.all(by.css(`md-sidenav app-buses-menu .md-list-item > span[classtoapply="searched"]`)).get(0)
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
          .filter((t: string) => t !== 'arrow_drop_down');
      });

    expect(listWithoutIcons).toEqual(availableBuses);
  });
});
