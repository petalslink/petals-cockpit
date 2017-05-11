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

import { page } from './common';

describe(`Mobile`, () => {
  beforeEach(() => {
    page.navigateTo(true);
  });

  it(`should not select the first input of import bus form on mobile`, () => {
    page.login(`admin`, `admin`);

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    page.openImportBus();
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/buses-in-progress$/);

    // the button is focused because of our click: the important is that nothing else is focused instead
    expectFocused(element(by.css('app-cockpit md-sidenav a.btn-add-bus')));
  });

  it(`should not select the first input of the login form on mobile`, () => {
    expect(browser.getCurrentUrl()).toMatch(/\/login/);

    expectNotFocused();

  });
});
