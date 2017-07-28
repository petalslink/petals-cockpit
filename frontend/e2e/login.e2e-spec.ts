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

import { $, browser } from 'protractor';

import { page } from './common';
import { ImportBusPage } from './pages/import-bus.po';
import { LoginPage } from './pages/login.po';
import { expectFocused } from './utils';

describe(`Login`, () => {
  it(`should be redirected to login if a user is trying to access a protected route without being logged`, () => {
    page.goTo();

    LoginPage.waitAndGet();
  });

  it(`should not login if user/pwd do not match`, () => {
    page.goToLogin().loginFail(`admin`, `randomPasswordNotWorking`);

    expect($(`.form-error`).isDisplayed()).toBe(true);
  });

  it(`should redirect to last workspace if login/pw match`, () => {
    page.goToLogin().loginToWorkspace(`admin`, `admin`);
  });

  it(`should redirect to original url after login`, () => {
    page.goToLogin().loginToWorkspace(`admin`, `admin`).openImportBus();

    // delete session and refresh to retrigger login
    browser.manage().deleteAllCookies();
    browser.refresh();

    const login = LoginPage.waitAndGet();

    // we should be redirected to login
    expect(browser.getCurrentUrl()).toMatch(/\/login\?previousUrl=/);

    login.loginNoCheck(`admin`, `admin`);

    // we should have been redirected to the previous url!
    ImportBusPage.waitAndGet();
  });

  it(`should logout after logging in`, () => {
    page.goToLogin().loginToWorkspace(`admin`, `admin`);

    const login = page.logout();

    expect(browser.getCurrentUrl()).toMatch(/\/login$/);

    // now let's see if we can relogin with another user and disconnect again
    login.loginToWorkspaces(`vnoel`, `vnoel`);

    // we can logout even if there is the workspaces dialog
    page.logout();
  });

  it(`should display the current username`, () => {
    page.goToLogin().loginToWorkspace(`admin`, `admin`);

    // check the name of current user logged
    browser
      .actions()
      .mouseMove($('app-generate-icon.btn-avatar-user'))
      .perform();
    expect($('md-tooltip-component').getText()).toEqual('Administrator');
  });

  it(`should select the first input of the login form on desktop`, () => {
    const login = page.goToLogin();

    expectFocused(login.username);
  });
});
