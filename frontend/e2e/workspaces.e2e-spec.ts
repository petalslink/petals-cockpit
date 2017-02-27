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

describe(`Workspaces`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
    page.login(`admin`, `admin`);
  });

  it(`should not have any workspace selected`, () => {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces$/);

    // check there's a warning saying that no workspace is selected
    expect(element(by.css(`app-workspaces-dialog .no-workspace-selected`)).getText()).toEqual(`Select the workspace`);

    // even if no selected, check that 2 workspaces are displayed
    expect(element.all(by.css(`app-workspaces-dialog md-card-subtitle`)).count()).toEqual(2);

    // check that no workspace have a green-led yet
    expect(element.all(by.css(`app-workspaces-dialog md-card div.icon-slot span.green-led`)).count()).toEqual(0);

    const availableUsersList = 'Bertrand ESCUDIE, Maxime ROBERT, Christophe CHEVALIER, Victor NOEL';

    // check the current list content
    browser.actions().mouseMove(element(by.css('app-workspaces-dialog md-card span.dotted'))).perform();
    expect(element(by.css('md-tooltip-component')).getText()).toEqual(availableUsersList);

    // the element() cannot be directly resolved with then()
    const cardsText = element.all(by.css(`app-workspaces-dialog md-card`)).getText();

    const workspacesAndOwners = [
      `Workspace 0\nYou are the only one using this workspace.`,
      `Workspace 1\nShared with you and 4 others.`
    ];

    expect(cardsText).toEqual(workspacesAndOwners);
  });

  it(`should have a workspace selected`, () => {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces$/);

    // select the first workspace
    element.all(by.css(`app-workspaces-dialog md-card`)).first().click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    // check the page content
    expect(element.all(by.css(`app-workspace > p`)).first().getText()).toEqual(`Selected workspace !`);

    const wsButton = element(by.css(`app-cockpit md-sidenav .workspace-name`));

    // does the button to show current workspace have the name of current workspace
    browser.wait(EC.elementToBeClickable(wsButton), 5000);
    expect(wsButton.getText()).toEqual(`Workspace 0`);

    // check that he now have a green led into the workspaces list
    expect(element(by.css(`app-cockpit md-sidenav .change-workspace`)).click());
    expect(element.all(by.css(`app-workspaces-dialog md-card div.icon-slot span.green-led`)).count()).toEqual(1);
  });

  it(`should contain the correct buses`, () => {
    // select the first workspace
    element.all(by.css(`app-workspaces-dialog md-card`)).first().click();
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);

    // check that buses/container/component/su are available
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
  });

  it(`should contain the correct buses in progress`, () => {
    // select the first workspace
    element.all(by.css(`app-workspaces-dialog md-card`)).first().click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    const importBusesText = page.getBusesInProgress();

    // check that 2 bus in progress are displayed
    expect(importBusesText.then(e => e.length)).toEqual(2);

    // check that buses/container/component/su are available
    const availableBusesInProgress = [
      `192.168.0.1:7700`,
      `192.168.0.2:7700`
    ];

    expect(importBusesText).toEqual(availableBusesInProgress);
  });

  it(`should create a new workspace`, () => {
    element(by.css(`app-workspaces-dialog form input`)).sendKeys(`New workspace`);
    element(by.css(`app-workspaces-dialog form button`)).click();

    expect(element.all(by.css(`app-workspaces-dialog div md-card-subtitle`)).count()).toEqual(3);

    const workspacesAndOwners = [
      `Workspace 0\nYou are the only one using this workspace.`,
      `Workspace 1\nShared with you and 4 others.`,
      `New workspace\nYou are the only one using this workspace.`
    ];

    const cardsText = element.all(by.css(`app-workspaces-dialog md-card`)).getText();

    expect(cardsText).toEqual(workspacesAndOwners);
  });
});
