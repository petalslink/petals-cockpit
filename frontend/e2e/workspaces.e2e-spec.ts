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

import { browser, element, by } from 'protractor';

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
    let workspacesAndOwners = [
      `Workspace idWks0`,
      `You're the only one to use this workspace`,
      `Workspace idWks1`,
      `You're the only one to use this workspace`
    ];

    // the element() cannot be directly resolved with then()
    let cardsText = element.all(by.css(`app-workspaces-dialog md-card`))
      .getText()
      .then((txt: any) => txt.join('\n'));
    expect(cardsText).toEqual(workspacesAndOwners.join(`\n`));

    // select the first workspace
    element.all(by.css(`app-workspaces-dialog md-card`)).first().click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w*$/);
  });

  it(`should select a workspace when clicking on his card`, () => {
    // select the first workspace
    element.all(by.css(`app-workspaces-dialog md-card`)).first().click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w*$/);

    // check that the page displayed the message selected workspace
    expect(element.all(by.css(`app-workspace > p`)).first().getText()).toEqual(`Selected workspace !`);

    // check that the buttons showing :
    // - the current workspace
    // - the button to choose a workspace
    // are shown
    expect(element(by.css(`app-cockpit md-sidenav .workspace-name`)).isPresent()).toEqual(true);
    expect(element(by.css(`app-cockpit md-sidenav .change-workspace`)).isPresent()).toEqual(true);

    // check that the page displayed has a title with the workspace name
    expect(element.all(by.css(`app-cockpit .md-button-wrapper`)).get(1).getText()).toEqual(`Workspace 0`);

    /// and that the first bus has the 'highlight' class to highlight it
    let itemWithoutIcons = element.all(by.css(`app-cockpit md-sidenav app-material-tree md-nav-list .md-list-item > span[classtoapply="highlight"]`))
      .first()
      .getText()
      .then((txt: any) => txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down')
          .join());
    expect(itemWithoutIcons).toEqual(`Bus 0`);

    // there shouldn't be a title 'buses in progress'
    expect(element(by.css(`.buses-in-progress h3`)).isPresent()).toBe(false);

    // check that buses/container/component/su are available
    let availableBuses = [
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
    // angular-material icon's name are displayed
    let listWithoutIcons = element.all(by.css(`app-cockpit md-sidenav app-material-tree`))
      .first()
      .getText()
      .then((txt: any) => txt
          .split(`\n`)
          .filter((t: string) => t !== 'arrow_drop_down'));
    expect(listWithoutIcons).toEqual(availableBuses);
  });

  // TODO : Make a test when the feature for add a new workspace will be available
  xit(`should create a new workspace and this workspace shouldn't have any bus`, () => {
    element(by.css(`button.change-workspace`)).click();
  });

});
