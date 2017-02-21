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

  search(search: string) {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces/);

    const input = element(by.css(`input.search`));
    input.clear();
    input.sendKeys(search);
  }

  getWorkspaceTree() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces/);
    return element.all(by.css(`app-cockpit md-sidenav app-material-tree div.mat-list-item-content > span`))
      .getText();
  }

  getBusesInProgress() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces/);

    return element.all(by.css(`app-cockpit md-sidenav app-buses-in-progress a.buses-in-progress div.mat-list-item-content`))
      .getText();
  }

  getHighlightedElement() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces/);

    return element.all(by.css(`app-cockpit md-sidenav app-material-tree div.mat-list-item-content .highlight`))
      .getText()
      // getText on element.all is wrongly type, it should be a string[]
      .then((elements: any) => elements as string[]);
  }

  getWorkspaceTreeFolder(level: number, index = 0) {
    expect(level).toBeGreaterThanOrEqual(1);
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces/);

    return element
      .all(by.css(`app-cockpit md-sidenav ${(`app-material-tree ` as any).repeat(level)}md-icon[aria-label="arrow_drop_down"]`))
      .get(index);
  }
}
