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

import { $, browser, ExpectedConditions as EC, Key } from 'protractor';

import { page, waitTimeout } from './common';
import { WorkspaceOverviewPage } from './pages/workspace.po';
import { waitAndClick } from './utils';

describe(`Workspace Overview`, () => {
  it(`should have the workspace information in overview`, () => {
    const workspace = page.goToLogin().loginToWorkspace('admin', 'admin');

    // check the page content
    expect(workspace.title.getText()).toEqual(`Workspace 0`);

    expect(workspace.description.getText()).toEqual(
      `You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`
    );
    expect(workspace.descriptionArea.isPresent()).toBe(false);

    expect(workspace.users.$(`.users-in-workspace`).getText()).toEqual(
      `You are the only one using this workspace.`
    );

    expect(
      workspace.users.$$(`md-list-item .mat-list-text`).getText()
    ).toEqual(['admin\nAdministrator']);
  });

  it(`should reset workspace overview when changing workspaces`, () => {
    const workspace = page.goToLogin().loginToWorkspace('admin', 'admin');

    // let's click on the edit button before switching workspace to ensure everything is reset
    workspace.editButton.click();

    // let's check another workspace
    const ws2 = workspace
      .openWorkspacesDialog()
      .selectWorkspace(1, `Workspace 1`);

    expect(ws2.title.getText()).toEqual(`Workspace 1`);

    expect(workspace.description.getText()).toEqual(
      `Put some description in markdown for the workspace here.`
    );
    expect(workspace.descriptionArea.isPresent()).toBe(false);

    expect(workspace.users.$(`.users-in-workspace`).getText()).toEqual(
      `5 people are using this workspace.`
    );

    expect(
      workspace.users.$$(`md-list-item .mat-list-text`).getText()
    ).toEqual([
      'admin\nAdministrator',
      'bescudie\nBertrand ESCUDIE',
      'mrobert\nMaxime ROBERT',
      'cchevalier\nChristophe CHEVALIER',
      'vnoel\nVictor NOEL',
    ]);

    // and go back to the first one (for last workspace to be valid in other tests...)
    workspace.openWorkspacesDialog().selectWorkspace(0, `Workspace 0`);
  });

  it(`should have live markdown rendering of the description while edit`, () => {
    const workspace = page.goToLogin().loginToWorkspace('admin', 'admin');

    // let's check another workspace
    workspace.openWorkspacesDialog().selectWorkspace(1, `Workspace 1`);

    expect(workspace.description.getText()).toEqual(
      `Put some description in markdown for the workspace here.`
    );

    // the description should be rendered via markdown
    expect(workspace.description.$(`strong`).getText()).toEqual(`markdown`);

    // edition
    workspace.editButton.click();

    expect(workspace.descriptionPreview.getText()).toEqual(
      `Put some description in markdown for the workspace here.`
    );

    // write a few words
    workspace.descriptionArea.sendKeys(' And some ~~more~~.');

    expect(workspace.descriptionPreview.getText()).toEqual(
      `Put some description in markdown for the workspace here. And some more.`
    );

    expect(workspace.descriptionPreview.$(`strong`).getText()).toEqual(
      `markdown`
    );
    expect(workspace.descriptionPreview.$(`del`).getText()).toEqual(`more`);

    // and go back to the first one (for last workspace to be valid in other tests...)
    workspace.openWorkspacesDialog().selectWorkspace(0, `Workspace 0`);
  });

  it(`should edit the workspace description in overview`, () => {
    const workspaces = page
      .goToWorkspacesViaLogin()
      .loginToWorkspaces('bescudie', 'bescudie');

    workspaces.inputName
      .sendKeys(`New workspace`)
      .then(() => workspaces.addButton.click());
    const workspace = workspaces.selectWorkspace(1, `New workspace`);

    expect(workspace.title.getText()).toEqual(`New workspace`);

    expect(workspace.description.getText()).toEqual(
      `Put some description in markdown for the workspace here.`
    );

    workspace.editButton.click();

    // cancel
    workspace.descriptionArea.sendKeys(' Will disappear.');
    expect(workspace.descriptionPreview.getText()).toEqual(
      `Put some description in markdown for the workspace here. Will disappear.`
    );

    workspace.descriptionCancel.click();

    expect(workspace.description.getText()).toEqual(
      `Put some description in markdown for the workspace here.`
    );

    // edit again

    workspace.editButton.click();

    workspace.descriptionArea.sendKeys(' And some more.');

    workspace.descriptionSubmit.click();

    browser.wait(EC.visibilityOf(workspace.description), waitTimeout);

    expect(workspace.description.getText()).toEqual(
      `Put some description in markdown for the workspace here. And some more.`
    );

    // let's check it is not modified in other...
    workspace.openWorkspacesDialog().selectWorkspace(0, `Workspace 1`);

    expect(workspace.description.getText()).toEqual(
      `Put some description in markdown for the workspace here.`
    );

    // but correct in modified
    workspace.openWorkspacesDialog().selectWorkspace(1, `New workspace`);

    expect(workspace.description.getText()).toEqual(
      `Put some description in markdown for the workspace here. And some more.`
    );
  });

  describe(`Users`, () => {
    let workspace: WorkspaceOverviewPage;

    beforeEach(() => {
      const workspaces = page
        .goToWorkspacesViaLogin()
        .loginToWorkspaces('admin', 'admin');
      workspaces.inputName
        .sendKeys('Test Users')
        .then(() => workspaces.addButton.click());
      workspace = workspaces.selectWorkspace(2);
    });

    afterEach(() => {
      // clean for backend
      workspace.workspaceButton.click();
      workspace.deleteButton.click();
      waitAndClick($(`app-workspace-deletion-dialog .btn-confirm-delete-wks`));
      waitAndClick($(`app-workspace-deleted-dialog button`));
    });

    it(`should check users of the workspace`, () => {
      expect(workspace.getUsers()).toEqual([['admin', 'Administrator']]);
    });

    it(`should add a user into the workspace only if his name is correct`, () => {
      workspace.addUser('bescudie');

      expect(workspace.getUsers()).toEqual([
        ['admin', 'Administrator'],
        ['bescudie', 'Bertrand ESCUDIE'],
      ]);

      // if we try with an incomplete name, the button should be disabled
      // but the list should be filtered
      workspace.usersAutocompleteInput.sendKeys('o');
      expect(workspace.getUsersAutocomplete()).toEqual(['mrobert', 'vnoel']);
      expect(workspace.btnAddUserToWks.isEnabled()).toBe(false);
      workspace.usersAutocompleteInput.sendKeys(Key.BACK_SPACE, 'vnoe');
      expect(workspace.getUsersAutocomplete()).toEqual(['vnoel']);
      expect(workspace.btnAddUserToWks.isEnabled()).toBe(false);
      workspace.usersAutocompleteInput.sendKeys('l');
      expect(workspace.btnAddUserToWks.isEnabled()).toBe(true);
    });

    it(`should display in autocomplete only users not into the workspace`, () => {
      workspace.addUser('bescudie');
      workspace.addUser('vnoel');

      expect(workspace.getUsersAutocomplete()).toEqual([
        'cchevalier',
        'cdeneux',
        'mrobert',
      ]);

      expect(workspace.getUsers()).toEqual([
        ['admin', 'Administrator'],
        ['bescudie', 'Bertrand ESCUDIE'],
        ['vnoel', 'Victor NOEL'],
      ]);
    });

    it(`should remove a user from the workspace (if != than current user)`, () => {
      workspace.addUser('bescudie');
      workspace.addUser('vnoel');

      const usersList = workspace.usersList.$$('md-list-item');

      expect(usersList.getText()).toEqual([
        // admin shouldn't be able to delete himself
        'admin\nAdministrator',
        'bescudie\nBertrand ESCUDIE\ndelete',
        'vnoel\nVictor NOEL\ndelete',
      ]);

      const bescudie = usersList.get(1);
      expect(bescudie.$('.user-id').getText()).toEqual('bescudie');
      // remove bescudie from current workspace
      bescudie.$('button.delete').click();

      expect(workspace.getUsersAutocomplete()).toEqual([
        'bescudie',
        'cchevalier',
        'cdeneux',
        'mrobert',
      ]);

      expect(workspace.getUsers()).toEqual([
        ['admin', 'Administrator'],
        ['vnoel', 'Victor NOEL'],
      ]);
    });
  });
});
