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

import { $, browser } from 'protractor';

import { page } from './common';
import { waitAndCheck } from './utils';

describe(`Login`, () => {
  it(`should display the current username`, () => {
    page.goToLogin().loginToWorkspace(`admin`, `admin`);

    // check the name of current user logged
    browser
      .actions()
      .mouseMove($('app-generate-icon.btn-avatar-user'))
      .perform();

    waitAndCheck($(`mat-tooltip-component`), 'Administrator');
  });
});
