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

import { $ } from 'protractor';

import { page } from './common';
import { AdminPage } from './pages/administration.po';

describe(`Administration`, () => {
  it(`should open the administration page`, () => {
    page.goToLogin().loginToWorkspace('admin', 'admin');

    const admin = page.openAdmin();

    expect(admin.title.getText()).toEqual('Administration');

    expect(admin.users.$$(`md-list-item .mat-list-text`).getText()).toEqual([
      'admin\nAdministrator',
      'bescudie\nBertrand ESCUDIE',
      'mrobert\nMaxime ROBERT',
      'cchevalier\nChristophe CHEVALIER',
      'vnoel\nVictor NOEL',
      'cdeneux\nChristophe DENEUX',
    ]);
  });

  it('should not be visible to non-admin', () => {
    page.goToLogin().loginToWorkspaces('vnoel', 'vnoel');

    expect(page.adminButton.isPresent()).toEqual(false);
  });

  it('should show a warning to non-admin', () => {
    page.goToViaLogin('/admin').loginNoCheck('vnoel', 'vnoel');

    expect($('.warning-not-admin').isPresent()).toEqual(true);
  });
});
