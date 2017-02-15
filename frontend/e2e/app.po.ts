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

export class PetalsCockpitPage {
  navigateTo(clearSession = true) {
    if (clearSession) {
       browser.get('/');
      // this command applies only when we are already connected to the host
      // so we needed first to connect with get!
       browser.manage().deleteAllCookies();
    }
    return browser.get('/');
  }

  login(user: string, pass: string) {
    // to login we should be on the correct page
    expect(browser.getCurrentUrl()).toMatch(/\/login$/);

    element(by.css(`app-login input[formcontrolname="username"]`)).sendKeys(user);
    element(by.css(`app-login input[formcontrolname="password"]`)).sendKeys(pass);

    expect(element(by.css(`app-login button`)).isEnabled()).toBe(true);

    element(by.css(`app-login button`)).click();

    // let's be sure angular has finished loading after login!
    browser.waitForAngular();
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
