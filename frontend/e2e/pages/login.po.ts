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

import { browser, ExpectedConditions as EC, $ } from 'protractor';

import { urlToMatch } from '../utils';
import { waitTimeout } from '../common';
import { WorkspaceOverviewPage } from './workspace.po';
import { WorkspacesPage } from './workspaces.po';

export class LoginPage {
  public static readonly component = $(`app-login`);

  public readonly component = LoginPage.component;
  public readonly username = this.component.$(
    `input[formcontrolname="username"]`
  );
  public readonly password = this.component.$(
    `input[formcontrolname="password"]`
  );
  public readonly button = this.component.$(`button`);

  static waitAndGet() {
    browser.wait(urlToMatch(/\/login/), waitTimeout);
    browser.wait(EC.visibilityOf(LoginPage.component), waitTimeout);
    return new LoginPage();
  }

  private constructor() {}

  loginToWorkspace(user: string, pass: string): WorkspaceOverviewPage {
    this.loginNoCheck(user, pass);
    return WorkspaceOverviewPage.waitAndGet();
  }

  loginToWorkspaces(user: string, pass: string): WorkspacesPage {
    this.loginNoCheck(user, pass);
    return WorkspacesPage.waitAndGet();
  }

  loginFail(user: string, pass: string): LoginPage {
    this.loginNoCheck(user, pass);
    return LoginPage.waitAndGet();
  }

  loginNoCheck(user: string, pass: string) {
    this.username.sendKeys(user);
    this.password.sendKeys(pass);
    $(`app-login button`).click();
  }
}
