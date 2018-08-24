/**
 * Copyright (C) 2017-2018 Linagora
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

import { $, browser, ExpectedConditions as EC } from 'protractor';

import { page, waitTimeout } from './common';
import { waitAndCheck } from './utils';

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
    const workspaces = page
      .goToWorkspacesViaLogin()
      .loginToWorkspaces(`vnoel`, `vnoel`);

    // the sidebar button should not be visible
    expect($(`app-header .sidenav-toggle`).isPresent()).toBe(false);

    expect(workspaces.workspacesInfos.count()).toEqual(1);

    // check the current list content
    browser
      .actions()
      .mouseMove(workspaces.component.$('mat-card-subtitle span.dotted'))
      .perform();

    waitAndCheck(
      $(`mat-tooltip-component`),
      'Administrator, Administrator LDAP, Bertrand ESCUDIE, Maxime ROBERT, Christophe CHEVALIER'
    );

    expect(workspaces.workspacesInfos.getText()).toEqual([
      `Workspace 1\nShared with you and 5 others.`,
    ]);
  });

  it(`should always keep the header above any modal`, () => {
    page
      .goToLogin()
      .loginToWorkspace(`admin`, `admin`)
      .openWorkspacesDialog();

    // the workspace dialog hides stuffs so we must check if

    // 1) the logout button should be visible
    expect($(`app-header .sidenav-toggle`).isEnabled()).toBe(true);
    // 2) we can still click on the sidenav button
    page.closeSidenav();
  });

  it(`should open the administration page and ensure that the workspaces list is closed`, () => {
    let workspaces = page
      .goToWorkspacesViaLogin()
      .loginToWorkspaces(`admin`, `admin`);

    page.openAdmin();
    browser.wait(EC.stalenessOf(workspaces.component), waitTimeout);

    const workspace = page.openWorkspaces().selectWorkspace(0);
    workspaces = workspace.openWorkspacesDialog();

    page.openAdmin();
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
