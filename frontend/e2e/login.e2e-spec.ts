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

import { page, expectFocused } from './common';

describe(`Login`, () => {
  beforeEach(() => {
    page.navigateTo();
  });

  it(`should be redirected to login if a user is trying to access a protected route without being logged`, () => {
    expect(browser.getCurrentUrl()).toMatch(/\/login$/);
    expect(element(by.css(`app-login button`)).getText()).toMatch(`Log in`);
    expect(element(by.css(`app-login button`)).isEnabled()).toBe(false);
  });

  it(`should not login if user/pwd do not match`, () => {
    page.login(`admin`, `randomPasswordNotWorking`, false);

    expect(browser.getCurrentUrl()).toMatch(/\/login$/);
    expect(element(by.css(`.form-error`)).isDisplayed()).toBe(true);
  });

  it(`should redirect to last workspace if login/pw match`, () => {
    page.login(`admin`, `admin`);

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);
  });

  it(`should redirect to original url after login`, () => {
    page.login(`admin`, `admin`);

    // let's go to the import bus page
    page.openImportBus();

    // delete session and refresh to retrigger login
    browser.manage().deleteAllCookies();
    browser.refresh();

    // we should be redirected to login
    expect(browser.getCurrentUrl()).toMatch(/\/login\?previousUrl=/);

    page.login(`admin`, `admin`, false);

    // we should have been redirected to the previous url!
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/buses-in-progress$/);
  });

  it(`should logout after logging in`, () => {
    const workspacesDialog = element(by.css(`app-workspaces-dialog`));

    page.login(`admin`, `admin`);

    page.logout();

    expect(browser.getCurrentUrl()).toMatch(/\/login$/);

    // now let's see if we can relogin with another user and disconnect again
    page.login(`vnoel`, `vnoel`, true, false);

    expect(workspacesDialog.isDisplayed()).toBe(true);

    // we can logout even if there is the workspaces dialog
    page.logout();

    // ensure dialogs are properly cleaned on component change (material attaches them to the root of the DOM)
    browser.wait(EC.stalenessOf(workspacesDialog), 5000);
    expect(workspacesDialog.isPresent()).toBe(false);
  });

  it(`should display the current username`, () => {
    page.login(`admin`, `admin`);

    // let's open the workspace list and ensure we can still click on the logout button
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();

    // the logout button should be visible
    expect(element(by.css(`app-cockpit .menu-icon`)).isEnabled()).toBe(true);

    // check the name of current user logged
    browser.actions().mouseMove(element(by.css('app-generate-icon.btn-avatar-user'))).perform();
    expect(element(by.css('md-tooltip-component')).getText()).toEqual('Administrator');
  });

  it(`should select the first input of the login form on desktop`, () => {
    expectFocused(element(by.css(`app-login input[formcontrolname="username"]`)));
  });
});
