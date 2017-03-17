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

import { PetalsCockpitPage } from './app.po';

describe(`Login`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
  });

  it(`should be redirected to login if a user is trying to access a protected route without being logged`, () => {
    expect(browser.getCurrentUrl()).toMatch(/\/login$/);
    expect(element(by.css(`app-login button`)).getText()).toMatch(`Log in`);
    expect(element(by.css(`app-login button`)).isEnabled()).toBe(false);
  });

  it(`should not login if user/pwd do not match`, () => {
    page.login(`admin`, `randomPasswordNotWorking`);

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
    page.addBus();

    // delete session and refresh to retrigger login
    browser.manage().deleteAllCookies();
    browser.refresh();

    // we should be redirected to login
    expect(browser.getCurrentUrl()).toMatch(/\/login\?previousUrl=/);

    page.login(`admin`, `admin`);

    // we should have been redirected to the previous url!
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/buses-in-progress$/);
  });

  it(`should logout after logging in`, () => {
    page.login(`admin`, `admin`);

    const logout = element(by.css(`app-menu-user-panel .wrapper-disconnect md-icon`));
    browser.wait(EC.elementToBeClickable(logout), 5000);
    logout.click();

    expect(browser.getCurrentUrl()).toMatch(/\/login$/);
  });

  it(`should selected the first input`, () => {
    element(by.css(`app-login input[formcontrolname="username"]`)).isSelected();
  });
});
