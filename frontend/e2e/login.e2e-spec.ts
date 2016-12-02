/**
 * Copyright (C) 2016 Linagora
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

describe(`Login`, () => {
  it(`should be redirected to login if a user is trying to access a protected route without being logged`, () => {
    browser.get(`/#/cockpit`);

    expect(browser.getCurrentUrl()).toMatch(/login$/);
  });

  it(`should not login if user/pwd not match`, () => {
    expect(element(by.css(`.page-login button`)).getText()).toMatch(`Log in`);

    element(by.css(`md-input input[name="username"]`)).sendKeys(`admin`);
    element(by.css(`md-input input[name="password"]`)).sendKeys(`randomPasswordNotWorking`);

    expect(element(by.css(`.page-login button`)).isEnabled()).toBe(true);

    element(by.css(`.page-login button`)).click();

    expect(browser.getCurrentUrl()).toMatch(/login$/);
  });

  it(`should login if user/pwd match`, () => {
    element(by.css(`md-input input[name="username"]`)).clear();
    element(by.css(`md-input input[name="username"]`)).sendKeys(`admin`);
    element(by.css(`md-input input[name="password"]`)).clear();
    element(by.css(`md-input input[name="password"]`)).sendKeys(`admin`);

    element(by.css(`.page-login button`)).click();

    expect(browser.getCurrentUrl()).toMatch(/cockpit\/workspaces$/);
  });
});
