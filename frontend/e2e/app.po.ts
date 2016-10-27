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

export class PetalsCockpitPage {
  navigateTo(url: string = '/') {
    browser.sleep(800);
    return browser.get(url);
  }

  getText(cssSelector: string) {
    browser.sleep(800);
    return element(by.css(cssSelector)).getText();
  }

  click(cssSelector: string, index = -1) {
    if(index === -1) {
      browser.sleep(800);
      element(by.css(cssSelector)).click();
    } else {
      browser.sleep(800);
      element.all(by.css(cssSelector)).click();
    }
  }

  fillInput(cssSelector: string, text: string) {
    browser.sleep(800);
    element(by.css(cssSelector)).clear();
    element(by.css(cssSelector)).sendKeys(text);
  }
}
