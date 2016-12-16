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

describe(`Workspace that Needs Petals`, () => {
  it(`should select a bus and display a content page with the bus name as title + 2 tabs`, () => {

    element(by.css(`button.change-workspace`)).click();

    // select the first workspace
    element.all(by.css(`.page-workspaces div.md-list-item`)).get(0).click();

    // check the title
    element.all(by.css(`app-buses-menu md-nav-list .md-list-item`)).get(0).click();

    let title = element.all(by.css(`.md-sidenav-content md-toolbar md-toolbar-row > span`)).get(1).getText();

    expect(title).toEqual(`Bus 0`);

    // TODO: Check view content once we decide what goes here exactly
  });

  it(`should select a container and display a content page with the container name as title`, () => {
    // select the first container
    element.all(by.css(`app-containers-menu a.container .md-list-item`)).get(0).click();

    let title = element.all(by.css(`.md-sidenav-content md-toolbar md-toolbar-row > span`)).get(1).getText();

    expect(title).toEqual(`Container 0`);

    // select the second container
    element.all(by.css(`app-containers-menu a.container .md-list-item`)).get(1).click();

    title = element.all(by.css(`.md-sidenav-content md-toolbar md-toolbar-row > span`)).get(1).getText();

    expect(title).toEqual(`Container 1`);

    // TODO: Check view content once we decide what goes here exactly
  });

  it(`should select a component and display a content page with the component name as title`, () => {
    // select the first container
    element.all(by.css(`app-components-menu a.component .md-list-item`)).get(0).click();

    let title = element.all(by.css(`.md-sidenav-content md-toolbar md-toolbar-row > span`)).get(1).getText();

    expect(title).toEqual(`Component 0`);

    // select the second container
    element.all(by.css(`app-components-menu a.component .md-list-item`)).get(1).click();

    title = element.all(by.css(`.md-sidenav-content md-toolbar md-toolbar-row > span`)).get(1).getText();

    expect(title).toEqual(`Component 1`);

    // TODO: Check view content once we decide what goes here exactly
  });

  it(`should select a service unit and display a content page with the service unit name as title`, () => {
    // select the first service unit
    element.all(by.css(`app-service-units-menu a.service-unit .md-list-item`)).get(0).click();

    let title = element.all(by.css(`.md-sidenav-content md-toolbar md-toolbar-row > span`)).get(1).getText();

    expect(title).toEqual(`SU 0`);

    // select the second container
    element.all(by.css(`app-service-units-menu a.service-unit .md-list-item`)).get(1).click();

    title = element.all(by.css(`.md-sidenav-content md-toolbar md-toolbar-row > span`)).get(1).getText();

    expect(title).toEqual(`SU 1`);

    // TODO: Check view content once we decide what goes here exactly
  });

  it(`should change a service unit state from started to stopped`, () => {
    // select the first service unit
    element.all(by.css(`app-service-units-menu a.service-unit .md-list-item`)).get(0).click();

    let state = element(by.css(`.md-sidenav-content .state .current-state`)).getText();

    expect(state).toEqual(`Started`);
    expect(element(by.css(`.md-sidenav-content .state .stop`)).isPresent()).toBe(true);
    expect(element(by.css(`.md-sidenav-content .state .start`)).isPresent()).toBe(false);
    expect(element(by.css(`.md-sidenav-content .state .unload`)).isPresent()).toBe(false);

    // stop it
    element.all(by.css(`.md-sidenav-content .state .stop`)).get(0).click();

    state = element(by.css(`.md-sidenav-content .state .current-state`)).getText();

    expect(state).toEqual(`Stopped`);
    expect(element(by.css(`.md-sidenav-content .state .stop`)).isPresent()).toBe(false);
    expect(element(by.css(`.md-sidenav-content .state .start`)).isPresent()).toBe(true);
    expect(element(by.css(`.md-sidenav-content .state .unload`)).isPresent()).toBe(true);
  });

  it(`should change a service unit state from stopped to unload`, () => {
    element.all(by.css(`.md-sidenav-content .state .unload`)).get(0).click();

    // as the SU should be removed, check that we're redirected to workspaces/idCurrentWorkspace
    expect(browser.getCurrentUrl()).toMatch(new RegExp(`/cockpit/workspaces/${reId}$`));

    // check that the page displayed has a title with the workspace name
    expect(element.all(by.css(`app-workspace md-toolbar md-toolbar-row > span`)).get(1).getText()).toEqual(`Workspace 0`);

    // the SU shouldn't be in left menu anymore
    let firstSuName = element.all(by.css(`app-service-units-menu a.service-unit .md-list-item > span`)).get(0).getText();

    expect(firstSuName).toEqual('SU 1');
  });
});
