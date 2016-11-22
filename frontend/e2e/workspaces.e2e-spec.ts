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

describe(`Workspaces`, () => {
  it(`should not have any workspace selected`, () => {
    // check there's a warning saying no workspace selected
    expect(element(by.css(`md-sidenav .info.no-workspace-selected`)).getText()).toEqual(`No workspace selected\nPlease select one`);

    // even if no selected, check that 2 workspaces are displayed
    expect(element.all(by.css(`.page-workspaces .md-list-item`)).count()).toEqual(2);
    let workspacesAndOwners = [
      `Workspace 0`,
        `You're the only one to use this workspace`,
      `Workspace 1`,
        `Workspace also used by Victor NOEL, Christophe CHEVALIER and Maxime ROBERT`
    ];
    expect(element(by.css(`.page-workspaces md-nav-list`)).getText()).toEqual(workspacesAndOwners.join(`\n`));

    // among those 2 workspaces, check that none is selected (have a particular class)
    expect(element.all(by.css(`.page-workspaces .md-list-item .color-primary-bold`)).count()).toEqual(0);
  });

  it(`should select a workspace when clicking on his line`, () => {
    // select the first workspace
    element.all(by.css(`.page-workspaces .md-list-item`)).get(0).click();

    // check there's no warning saying no bus
    expect(element(by.css(`md-sidenav .info.no-bus`)).isPresent()).toBe(false);

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

    expect(element(by.css(`md-sidenav app-buses-menu`)).getText()).toEqual(availableBuses.join(`\n`));
  });

  it(`should create a new workspace and this workspace shouldn't have any bus`, () => {
    // reveal the part to add a workspace
    element(by.css(`button.btn-show-panel-add-workspace`)).click();

    // create 'Test' workspace
    element(by.css(`md-input.new-workspace-name input`)).sendKeys(`Test`);
    element(by.css(`.btn-add-workspace`)).click();

    // check that 3 workspaces are listed
    expect(element.all(by.css(`.page-workspaces .md-list-item`)).count()).toEqual(3);
    let workspacesAndOwners = [
      `Workspace 0`,
        `You're the only one to use this workspace`,
      `Workspace 1`,
        `Workspace also used by Victor NOEL, Christophe CHEVALIER and Maxime ROBERT`,
      `Test`,
        `You're the only one to use this workspace`
    ];
    expect(element(by.css(`.page-workspaces md-nav-list`)).getText()).toEqual(workspacesAndOwners.join(`\n`));

    // select the new workspace
    element.all(by.css(`.page-workspaces .md-list-item`)).get(2).click();

    // check there's a warning saying no buses available
    expect(element(by.css(`md-sidenav .info.no-bus`)).getText())
    .toEqual(`The workspace "Test" doesn't have any bus or bus in progress. You may want to import one.`);
  });
});
