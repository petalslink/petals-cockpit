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
    page.setDesktopSize();
    page.navigateTo();
  });

  it(`should always keep the header above any modal`, () => {
    page.login(`admin`, `admin`);

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    // let's open the workspace list and ensure we can still click on the sidenav button
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();

    page.closeSidenav();
  });

  it(`should not have any workspace selected`, () => {
    // vnoel has no lastWorkspace, so it will be redirected to /workspaces with no workspace selected
    page.login(`vnoel`, `vnoel`, true, false);

    // the sidebar button should not be visible
    expect(element(by.css(`app-cockpit .menu-icon`)).isPresent()).toBe(false);

    // check that 1 workspace is displayed
    expect(element.all(by.css(`app-workspaces-dialog md-card-subtitle`)).count()).toEqual(1);

    const availableUsersList = 'Administrator, Bertrand ESCUDIE, Maxime ROBERT, Christophe CHEVALIER';

    // check the current list content
    browser.actions().mouseMove(element(by.css('app-workspaces-dialog md-card-title-group span.dotted'))).perform();
    expect(element(by.css('md-tooltip-component')).getText()).toEqual(availableUsersList);

    // check if no cards have a green background color
    expect(element.all(by.css(`app-workspaces-dialog md-card div.background-color-light-green-x2`)).count()).toEqual(0);

    // the element() cannot be directly resolved with then()
    const cardsText = element.all(by.css(`app-workspaces-dialog div md-card-title-group`)).getText();

    const workspacesAndOwners = [
      `Workspace 1\nShared with you and 4 others.`
    ];

    expect(cardsText).toEqual(workspacesAndOwners);
  });

  it(`should have a workspace selected`, () => {
    page.login(`admin`, `admin`);

    const change = element(by.css(`app-cockpit md-sidenav .change-workspace`));
    browser.wait(EC.elementToBeClickable(change), 5000);
    change.click();

    // check if the card selected has a green background color
    expect(element.all(by.css(`app-workspaces-dialog md-card div.background-color-light-green-x2`)).count()).toEqual(1);
    // check that workspace selected has icon
    expect(element.all(by.css(`app-workspaces-dialog md-card div.background-color-light-green-x2 md-icon`)).count()).toEqual(1);
  });

  it(`should create a new workspace and then delete it`, () => {
    page.login(`mrobert`, `mrobert`, true, false);

    const inputName = element(by.css(`input[formControlName="name"]`));
    const addNewWorkspace = element(by.css(`app-workspaces-dialog .btn-add-workspace`));

    // check if the input form is empty
    expect(inputName.getText()).toEqual(``);

    // check if add new workspace button is always disabled when input form is empty
    expect(addNewWorkspace.isEnabled()).toBe(false);

    inputName.sendKeys(`New workspace`);

    // check if add new workspace button is enabled
    expect(addNewWorkspace.isEnabled()).toBe(true);

    addNewWorkspace.click();

    const cards = element.all(by.css(`app-workspaces-dialog div md-card-title-group`));

    expect(cards.count()).toEqual(2);

    // check if the input is cleared
    expect(inputName.getText()).toEqual(``);

    const workspacesAndOwners = [
      `Workspace 1\nShared with you and 4 others.`,
      `New workspace\nYou are the only one using this workspace.`
    ];

    const cardsText = cards.getText();

    expect(cardsText).toEqual(workspacesAndOwners);

    ///// DELETION

    page.selectWorkspace(1, `New workspace`);

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    expect(element(by.css(`app-workspace md-toolbar span.title`)).getText()).toEqual(`New workspace`);

    const btnDeleteWks = element(by.css(`app-workspace .btn-delete-wks`));

    // let's delete the workspace
    btnDeleteWks.click();

    // a dialog is shown
    expect(element(by.css(`app-workspace-deletion-dialog .mat-dialog-content`)).getText())
      .toEqual(`Everything in the workspace will be deleted! Please, be certain.\nAre you sure you want to delete New workspace?`);

    // let's confirm the deletion
    element(by.css(`app-workspace-deletion-dialog .btn-confirm-delete-wks`)).click();

    // the button should be disabled once we confirmed deletion
    // and shouldn't be clickable anymore (except in case of HTTP error)
    expect(btnDeleteWks.isEnabled()).toBe(false);

    // now we get a notification saying the workspace is deleted
    expect(element(by.css(`app-workspace-deleted-dialog .mat-dialog-content`)).getText())
      .toEqual(`This workspace was deleted, click on OK to go back to the workspaces list.`);

    // ensure we are stil on the same workspace until we click
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    // let's get redirected
    element(by.css(`app-workspace-deleted-dialog button`)).click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces$/);
    browser.wait(EC.invisibilityOf(element(by.css(`app-cockpit md-sidenav`))), 5000);

    // now that the previous workspace is deleted, check that only 1 workspace is displayed
    expect(element.all(by.css(`app-workspaces-dialog md-card-subtitle`)).count()).toEqual(1);
  });
});
