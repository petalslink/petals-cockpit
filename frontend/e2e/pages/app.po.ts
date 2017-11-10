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

import {
  $,
  browser,
  ElementFinder,
  ExpectedConditions as EC,
} from 'protractor';

import { Matcher, textToMatchInElement, waitAndClick } from '../utils';

import { AdminPage } from './administration.po';
import { LoginPage } from './login.po';
import { SetupPage } from './setup.po';
import { WorkspacePage } from './workspace.po';
import { WorkspacesPage } from './workspaces.po';

export class PetalsCockpitPage {
  public readonly header = $('app-header');
  public readonly adminButton = this.header.$('.btn-usr-admin');
  public readonly avatarButton = this.header.$('.btn-avatar-user');
  public readonly logoutButton = this.header.$('.btn-logout-user');
  public readonly logoButton = this.header.$('.toolbar-logo');
  public readonly toggleSidenavButton = this.header.$('.sidenav-toggle');

  goTo(to = '/') {
    return browser.get(to);
  }

  goToSetup(token?: string): SetupPage {
    if (!token) {
      this.goTo('/setup');
    } else {
      this.goTo(`/setup?token=${token}`);
    }
    return SetupPage.waitAndGet();
  }

  goToViaLogin(to = '/'): LoginPage {
    this.goTo(to);
    return LoginPage.waitAndGet();
  }

  goToLogin(): LoginPage {
    return this.goToViaLogin('/login');
  }

  goToWorkspacesViaLogin(): LoginPage {
    return this.goToViaLogin('/workspaces');
  }

  logout() {
    // open the user menu
    waitAndClick(this.avatarButton);

    // and logout
    waitAndClick(this.logoutButton);

    return LoginPage.waitAndGet();
  }

  expectNotification(title?: Matcher, content?: Matcher) {
    const simpleNotification = $(`simple-notification`);

    let test = EC.visibilityOf(simpleNotification);

    if (title) {
      const titleE = simpleNotification.$(`.sn-title`);
      test = EC.and(test, textToMatchInElement(titleE, title));
    }

    if (content) {
      const contentE = simpleNotification.$(`.sn-content`);
      test = EC.and(test, textToMatchInElement(contentE, content));
    }

    browser.ignoreSynchronization = true;
    return browser
      .wait(test, 20000)
      .then(() => {
        browser.ignoreSynchronization = false;
        return browser.wait(EC.invisibilityOf(simpleNotification), 20000);
      })
      .catch(() => {
        browser.ignoreSynchronization = false;
      });
  }

  clickAndExpectNotification(
    el: ElementFinder,
    title?: Matcher,
    content?: Matcher
  ) {
    waitAndClick(el);

    this.expectNotification(title, content);
  }

  openSidenav() {
    return WorkspacePage.sidenav.isDisplayed().then(displayed => {
      if (!displayed) {
        return this.toggleSidenavButton.click();
      }
    });
  }

  closeSidenav() {
    return WorkspacePage.sidenav.isDisplayed().then(displayed => {
      if (displayed) {
        return this.toggleSidenavButton.click();
      }
    });
  }

  openAdmin() {
    waitAndClick(this.adminButton);

    return AdminPage.waitAndGet();
  }

  openWorkspaces() {
    waitAndClick(this.logoButton);

    return WorkspacesPage.waitAndGet();
  }
}
