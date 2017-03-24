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

  login(user: string, pass: string, checkRedirect = true, hasLastWorkspace = true) {
    // to login we should be on the correct page
    expect(browser.getCurrentUrl()).toMatch(/\/login/);

    element(by.css(`app-login input[formcontrolname="username"]`)).sendKeys(user);
    element(by.css(`app-login input[formcontrolname="password"]`)).sendKeys(pass);

    expect(element(by.css(`app-login button`)).isEnabled()).toBe(true);

    element(by.css(`app-login button`)).click();

    if (checkRedirect) {
      // let's be sure angular has finished loading after login!
      browser.wait(EC.urlContains('/workspaces'), 3000);

      if (hasLastWorkspace) {
        expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);
        return browser.wait(EC.visibilityOf(element(by.css(`app-cockpit md-sidenav.mat-sidenav-opened`))), 2000);
      } else {
        expect(browser.getCurrentUrl()).toMatch(/\/workspaces$/);
        // the sidenav is visible in HTML terms, but not really visible in practice
        return browser.wait(EC.presenceOf(element(by.css(`app-cockpit md-sidenav.mat-sidenav-closed`))), 2000);
      }
    } else {
      // let's be sure angular has finished loading after login!
      // but let's not fail if it is not the right url (because we also test failing login!)
      // TODO we should improve that but the problem is protractor not being able to wait enough...
      return browser.wait(EC.urlContains('/workspaces'), 3000).catch(_ => { });
    }
  }

  search(search: string) {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    const input = element(by.css(`input.search`));
    input.clear();
    input.sendKeys(search);
  }

  getWorkspaceTree() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);
    return element.all(by.css(`app-cockpit md-sidenav app-material-tree div.mat-list-item-content > span`))
      .getText();
  }

  /**
   * getWorkspaceTreeByName
   *
   * @param {string} name : The [bus|container|component|servuce-unit]'s name to find in the tree
   * @returns the element found
   */
  getWorkspaceTreeByName(name: string) {
    return element.all(by.cssContainingText(`app-cockpit md-sidenav app-material-tree div.mat-list-item-content > span`, name));
  }

  getBusesInProgress() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    return element.all(by.css(`app-cockpit md-sidenav app-buses-in-progress a.buses-in-progress div.mat-list-item-content > span`))
      .getText();
  }

  getHighlightedElement() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    return element.all(by.css(`app-cockpit md-sidenav app-material-tree div.mat-list-item-content .highlight`))
      .getText()
      // getText on element.all is wrongly type, it should be a string[]
      .then((elements: any) => elements as string[]);
  }

  getWorkspaceTreeFolder(level: number, index = 0) {
    expect(level).toBeGreaterThanOrEqual(1);
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    return element
      .all(by.css(`app-cockpit md-sidenav ${(`app-material-tree ` as any).repeat(level)}md-icon[aria-label="arrow_drop_down"]`))
      .get(index);
  }

  openSidenav() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    return element(by.css(`app-cockpit md-sidenav.mat-sidenav-closed`)).isPresent().then(present => {
      if (present) {
        return element(by.css(`app-cockpit md-toolbar-row button`)).click();
      }
    });
  }

  closeSidenav() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    return element(by.css(`app-cockpit md-sidenav.mat-sidenav-opened`)).isPresent().then(present => {
      if (present) {
        return element(by.css(`app-cockpit md-toolbar-row button`)).click();
      }
    });
  }

  addBus() {
    const addBtn = element(by.css(`app-cockpit md-sidenav a.btn-add-bus`));
    browser.wait(EC.elementToBeClickable(addBtn), 5000);
    return addBtn.click();
  }
}
