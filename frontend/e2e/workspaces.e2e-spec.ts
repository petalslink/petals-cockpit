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

import { browser, ExpectedConditions as EC, $ } from 'protractor';

import { page, waitTimeout } from './common';
import { WorkspacesPage } from './pages/workspaces.po';

describe(`Workspaces`, () => {
  it('should clear the dialog upon logout', () => {
    const workspaces = page
      .goToWorkspacesViaLogin()
      .loginToWorkspaces('admin', 'admin');

    page.logout();

    // ensure dialogs are properly cleaned on component change (material attaches them to the root of the DOM)
    browser.wait(EC.stalenessOf(workspaces.component), waitTimeout);
  });

  it(`should not have any workspace selected`, () => {
    // vnoel has no lastWorkspace, so it will be redirected to /workspaces with no workspace selected
    const workspaces = page
      .goToWorkspacesViaLogin()
      .loginToWorkspaces(`vnoel`, `vnoel`);

    // the sidebar button should not be visible
    expect($(`app-header .sidenav-toggle`).isPresent()).toBe(false);

    // check that 1 workspace is displayed
    expect(workspaces.workspacesCards.count()).toEqual(1);

    const availableUsersList =
      'Administrator, Bertrand ESCUDIE, Maxime ROBERT, Christophe CHEVALIER';

    // check the current list content
    browser
      .actions()
      .mouseMove(workspaces.component.$('md-card-subtitle span.dotted'))
      .perform();
    expect($('md-tooltip-component').getText()).toEqual(availableUsersList);

    // check that no cards have a green background color
    expect(
      workspaces.workspacesCard
        .$$(`div.background-color-light-green-x2`)
        .count()
    ).toEqual(0);
    expect(
      workspaces.workspacesCard
        .$$(`div.background-color-light-green-x2 md-icon`)
        .count()
    ).toEqual(0);

    const workspacesAndOwners = [`Workspace 1\nShared with you and 4 others.`];

    expect(workspaces.workspacesCards.getText()).toEqual(workspacesAndOwners);
  });

  it(`should always keep the header above any modal`, () => {
    page.goToLogin().loginToWorkspace(`admin`, `admin`).openWorkspacesDialog();

    // the workspace dialog hides stuffs so we must check if

    // 1) the logout button should be visible
    expect($(`app-header .sidenav-toggle`).isEnabled()).toBe(true);
    // 2) we can still click on the sidenav button
    page.closeSidenav();
  });

  it(`should have a workspace selected`, () => {
    // open the workspace dialog from a workspace
    const workspaces = page
      .goToLogin()
      .loginToWorkspace(`admin`, `admin`)
      .openWorkspacesDialog();

    // check if the card selected has a green background color
    expect(
      workspaces.workspacesCard
        .$$(`div.background-color-light-green-x2`)
        .count()
    ).toEqual(1);
    // check that workspace selected has icon
    expect(
      workspaces.workspacesCard
        .$$(`div.background-color-light-green-x2 md-icon`)
        .count()
    ).toEqual(1);
  });

  it(`should create a new workspace and then delete it`, () => {
    let workspaces = page
      .goToWorkspacesViaLogin()
      .loginToWorkspaces(`mrobert`, `mrobert`);

    // check if the input form is empty
    expect(workspaces.inputName.getText()).toEqual(``);

    // check if add new workspace button is always disabled when input form is empty
    expect(workspaces.addButton.isEnabled()).toBe(false);

    workspaces.inputName.sendKeys(`New workspace`);

    // check if add new workspace button is enabled
    expect(workspaces.addButton.isEnabled()).toBe(true);

    workspaces.addButton.click();

    expect(workspaces.workspacesCards.count()).toEqual(2);

    // check if the input is cleared
    expect(workspaces.inputName.getText()).toEqual(``);

    const workspacesAndOwners = [
      `Workspace 1\nShared with you and 4 others.`,
      `New workspace\nYou are the only one using this workspace.`,
    ];

    expect(workspaces.workspacesCards.getText()).toEqual(workspacesAndOwners);

    ///// DELETION
    const workspace = workspaces.selectWorkspace(1, `New workspace`);

    // let's delete the workspace
    workspace.deleteButton.click();

    // a dialog is shown
    expect(
      $(`app-workspace-deletion-dialog .mat-dialog-content`).getText()
    ).toEqual(
      `Everything in the workspace will be deleted! Please, be certain.\nAre you sure you want to delete New workspace?`
    );

    // let's confirm the deletion
    $(`app-workspace-deletion-dialog .btn-confirm-delete-wks`).click();

    // the button should be disabled once we confirmed deletion
    // and shouldn't be clickable anymore (except in case of HTTP error)
    expect(workspace.deleteButton.isEnabled()).toBe(false);

    // now we get a notification saying the workspace is deleted
    const confirm = $(`app-workspace-deleted-dialog .mat-dialog-content`);
    browser.wait(EC.visibilityOf(confirm), waitTimeout);
    expect(confirm.getText()).toEqual(
      `This workspace was deleted, click on OK to go back to the workspaces list.`
    );

    // ensure we are stil on the same workspace until we click
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    // let's get redirected
    $(`app-workspace-deleted-dialog button`).click();

    workspaces = WorkspacesPage.waitAndGet();

    // ensure the sidebar is closed as expected
    browser.wait(EC.invisibilityOf($(`app-cockpit md-sidenav`)), waitTimeout);

    // now that the previous workspace is deleted, check that only 1 workspace is displayed
    expect(workspaces.workspacesCards.count()).toEqual(1);
  });

  it(`should open the administration page and ensure that the workspaces list is closed`, () => {
    let workspaces = page
      .goToWorkspacesViaLogin()
      .loginToWorkspaces(`admin`, `admin`);

    let admin = page.openAdmin();
    browser.wait(EC.stalenessOf(workspaces.component), waitTimeout);

    const workspace = page.openWorkspaces().selectWorkspace(0);
    workspaces = workspace.openWorkspacesDialog();

    admin = page.openAdmin();
    browser.wait(EC.stalenessOf(workspaces.component), waitTimeout);
  });

  it(`should not reopen the workspace list after logout and re-login`, () => {
    const workspaces = page
      .goToLogin()
      .loginToWorkspace('admin', 'admin')
      .openWorkspacesDialog();

    const login = page.logout();
    browser.wait(EC.stalenessOf(workspaces.component), waitTimeout);

    login.loginToWorkspace('admin', 'admin');
    browser.wait(EC.stalenessOf(workspaces.component), waitTimeout);
  });
});
