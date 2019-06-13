/**
 * Copyright (C) 2017-2019 Linagora
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

// import { page } from './common';

// TODO: test need refactor
// describe(`Workspace Overview`, () => {
// describe(`Users`, () => {
//   let workspace: WorkspaceOverviewPage;

//   beforeEach(() => {
//     const workspaces = page
//       .goToWorkspacesViaLogin()
//       .loginToWorkspaces('admin', 'admin');

//     workspaces.addWorkspace('Test Users', 'Test Short Description');

//     workspace = workspaces.selectWorkspace(2);
//   });

//   afterEach(() => {
//     workspace.openWorkspaces();
//     // clean for backend
//     workspace.workspaceButton.click();
//     workspace.deleteButton.click();
//     waitAndClick($(`app-workspace-deletion-dialog .btn-confirm-delete-wks`));
//     waitAndClick($(`app-workspace-deleted-dialog button`));
//   });

//   it(`should check users of the workspace`, () => {
//     expect(workspace.getUsers()).toEqual([['admin', 'Administrator']]);
//   });

//   it(`should add a user into the workspace only if his name is correct`, () => {
//     workspace.addUser('bescudie');

//     expect(workspace.getUsers()).toEqual([
//       ['admin', 'Administrator'],
//       ['bescudie', 'Bertrand ESCUDIE'],
//     ]);

//     // if we try with an incomplete name, the button should be disabled
//     // but the list should be filtered
//     workspace.usersAutocompleteInput.sendKeys('o');
//     expect(workspace.getUsersAutocomplete()).toEqual(['mrobert', 'vnoel']);
//     expect(workspace.btnAddUserToWks.isEnabled()).toBe(false);
//     workspace.usersAutocompleteInput.sendKeys(Key.BACK_SPACE, 'vnoe');
//     expect(workspace.getUsersAutocomplete()).toEqual(['vnoel']);
//     expect(workspace.btnAddUserToWks.isEnabled()).toBe(false);
//     workspace.usersAutocompleteInput.sendKeys('l');
//     expect(workspace.btnAddUserToWks.isEnabled()).toBe(true);
//   });

//   it(`should display in autocomplete only users not into the workspace`, () => {
//     workspace.addUser('bescudie');
//     workspace.addUser('vnoel');

//     expect(workspace.getUsersAutocomplete()).toEqual([
//       'adminldap',
//       'cchevalier',
//       'cdeneux',
//       'mrobert',
//     ]);

//     expect(workspace.getUsers()).toEqual([
//       ['admin', 'Administrator'],
//       ['bescudie', 'Bertrand ESCUDIE'],
//       ['vnoel', 'Victor NOEL'],
//     ]);
//   });

//   it(`should remove a user from the workspace (if != than current user)`, () => {
//     workspace.addUser('bescudie');
//     workspace.addUser('vnoel');

//     const usersList = workspace.usersList.$$('mat-list-item');

//     expect(usersList.getText()).toEqual([
//       // admin shouldn't be able to delete himself
//       'admin\nAdministrator',
//       'bescudie\nBertrand ESCUDIE\ndelete',
//       'vnoel\nVictor NOEL\ndelete',
//     ]);

//     const bescudie = usersList.get(1);
//     expect(bescudie.$('.user-id').getText()).toEqual('bescudie');
//     // remove bescudie from current workspace
//     bescudie.$('button.delete').click();

//     expect(workspace.getUsersAutocomplete()).toEqual([
//       'adminldap',
//       'bescudie',
//       'cchevalier',
//       'cdeneux',
//       'mrobert',
//     ]);

//     expect(workspace.getUsers()).toEqual([
//       ['admin', 'Administrator'],
//       ['vnoel', 'Victor NOEL'],
//     ]);
//   });
// });
// });
