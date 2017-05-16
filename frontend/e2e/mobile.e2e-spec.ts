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

import { browser } from 'protractor';

import { page } from './common';
import { expectNotFocused, expectNothingFocused } from './utils';

describe(`Mobile`, () => {

  beforeEach(() => {
    browser.manage().window().setSize(412, 732);
  });

  it(`should not select the first input of import bus form on mobile`, () => {
    const workspace = page.goToLogin().loginToWorkspace(`admin`, `admin`);

    const importBus = workspace.openImportBus();

    // sometimes the add button is focused because of our click
    // so we just test that username is not focused
    expectNotFocused(importBus.username);
  });

  it(`should not select the first input of the login form on mobile`, () => {
    page.goToLogin();

    expectNothingFocused();
  });

  describe('Setup', () => {
    it(`should not select the first or second input`, () => {
      page.goToSetup();
      expectNothingFocused();
    });

    it(`should not select the first or second input with a pre-filled token`, () => {
      const tokenTest = 'TOKENTEST';
      const setup = page.goToSetup(tokenTest);

      expect(setup.token.getAttribute('value')).toEqual(tokenTest);

      expectNothingFocused();
    });
  });

});
