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

import { browser, element, by, ExpectedConditions as EC, ElementFinder } from 'protractor';
import * as util from 'protractor/built/util';

export class PetalsCockpitPage {
  navigateTo(mobile = false, to = '/') {
    if (mobile) {
      browser.manage().window().setSize(412, 732);
    } else {
      browser.manage().window().maximize();
    }
    return browser.get(to);
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
      browser.wait(EC.urlContains('/workspaces'), 6000);

      if (hasLastWorkspace) {
        expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);
        return browser.wait(EC.visibilityOf(element(by.css(`app-cockpit md-sidenav.mat-sidenav-opened`))), 6000);
      } else {
        expect(browser.getCurrentUrl()).toMatch(/\/workspaces$/);
        return browser.wait(EC.visibilityOf(element(by.css(`app-workspaces-dialog`))), 6000);
      }
    } else {
      // let's be sure angular has finished loading after login!
      // but let's not fail if it is not the right url (because we also test failing login!)
      // TODO we should improve that but the problem is protractor not being able to wait enough...
      return browser.wait(EC.urlContains('/workspaces'), 3000).catch(_ => { });
    }
  }

  logout() {
    // open the user menu
    element(by.css(`app-cockpit md-toolbar .btn-avatar-user`)).click();
    // and logout
    const logout = element(by.css(`.btn-logout-user`));
    browser.wait(EC.elementToBeClickable(logout), 1000);
    logout.click();

    return browser.wait(urlToMatch(/\/login$/), 3000);
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
        return element(by.css(`app-cockpit md-toolbar-row button.menu-icon`)).click();
      }
    });
  }

  closeSidenav() {
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    return element(by.css(`app-cockpit md-sidenav.mat-sidenav-opened`)).isPresent().then(present => {
      if (present) {
        return element(by.css(`app-cockpit md-toolbar-row button.menu-icon`)).click();
      }
    });
  }

  openImportBus() {
    const addBtn = element(by.css(`app-cockpit md-sidenav a.btn-add-bus`));
    browser.wait(EC.elementToBeClickable(addBtn), 5000);
    return addBtn.click();
  }

  selectWorkspace(index: number, expectedName?: Matcher) {
    expect(element(by.css(`app-workspaces-dialog`)).isDisplayed()).toBe(true);

    element.all(by.css(`app-workspaces-dialog div md-card-title-group`)).get(index).click();

    const wsButton = element(by.css(`app-cockpit md-sidenav button.workspace-name`));
    let test = EC.elementToBeClickable(wsButton);
    if (expectedName) {
      test = EC.and(test, textToMatchInElement(wsButton, expectedName));
    }

    return browser.wait(test, 10000);
  }

  clickAndExpectNotification(el: ElementFinder, title?: Matcher, content?: Matcher) {
    browser.wait(EC.elementToBeClickable(el), 3000);

    el.click();

    const simpleNotification = element(by.css(`simple-notification`));

    let test = EC.visibilityOf(simpleNotification);

    if (title) {
      const titleE = simpleNotification.element(by.css(`.sn-title`));
      test = EC.and(test, textToMatchInElement(titleE, title));
    }

    if (content) {
      const contentE = simpleNotification.element(by.css(`.sn-content`));
      test = EC.and(test, textToMatchInElement(contentE, content));
    }

    browser.ignoreSynchronization = true;
    return browser.wait(test, 10000)
      .then(() => {
        browser.ignoreSynchronization = false;
        return browser.wait(EC.invisibilityOf(simpleNotification), 10000);
      }).catch(_ => {
        browser.ignoreSynchronization = false;
      });
  }
}

type Matcher = { [Symbol.match](string: string): RegExpMatchArray } | string;

export function match(text: string, matcher: Matcher): boolean {
  if (typeof matcher === 'string') {
    return text === matcher;
  } else {
    // careful, match does not return a boolean!
    return !!text.match(matcher);
  }
}

export function urlToMatch(matcher: Matcher): Function {
  return () => browser.getCurrentUrl().then(url => match(url, matcher));
}

export function textToMatchInElement(elementFinder: ElementFinder, matcher: Matcher): Function {
  return () => elementFinder.getText().then(text => match(text, matcher), util.falseIfMissing);
}
