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
  browser,
  ExpectedConditions as EC,
  $,
  ElementFinder,
} from 'protractor';

import { urlToMatch } from '../utils';
import { waitTimeout } from '../common';
import { AdminAddEditUserPage } from './admin-add-edit-user.po';

export class AdminPage {
  public static readonly component = $(`app-administration`);

  public readonly component = AdminPage.component;
  public readonly title = this.component.$(`md-toolbar-row .title`);

  public readonly panels = this.component.$(
    `.user-management-page .user-management-panels`
  );
  public readonly panelAddUser = this.panels.$(`.pnl-add-user`);
  public readonly panelListUsers = this.panels.$(`.pnl-list-users`);

  static waitAndGet() {
    browser.wait(urlToMatch(/\/admin/), waitTimeout);
    browser.wait(EC.visibilityOf(AdminPage.component), waitTimeout);
    return new AdminPage();
  }

  private constructor() {}

  openAddUser() {
    return this.openAddEdit(this.panelAddUser.$('.exp-pnl-add-user'));
  }

  openEditUser(username: string) {
    return this.openAddEdit(this.panelListUsers.$('.exp-pnl-user-' + username));
  }

  private openAddEdit(panel: ElementFinder) {
    panel.click();
    return AdminAddEditUserPage.waitAndGet(panel);
  }
}
