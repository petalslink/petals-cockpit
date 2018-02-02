/**
 * Copyright (C) 2017-2018 Linagora
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

import { waitTimeout } from '../common';
import { urlToMatch, waitAndClick } from '../utils';
import { AdminAddEditUserPage } from './admin-add-edit-user.po';
import { MessageComponentPage } from './message-component.po';

export class AdminPage {
  public static readonly component = $(`app-administration`);

  public readonly component = AdminPage.component;
  public readonly title = this.component.$(`mat-toolbar .title`);

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

  getInfoUserManagementMessage() {
    return MessageComponentPage.waitAndGet(
      this.component,
      `info-user-management`
    );
  }

  getNotAdminMessage() {
    return MessageComponentPage.waitAndGet(this.component, `warning-not-admin`);
  }

  openAddUser() {
    return this.openAddEdit(this.panelAddUser.$('.exp-pnl-add-user'));
  }

  openEditUser(username: string) {
    return this.openAddEdit(this.panelListUsers.$('.exp-pnl-user-' + username));
  }

  private openAddEdit(panel: ElementFinder) {
    waitAndClick(panel);
    return AdminAddEditUserPage.waitAndGet(panel);
  }
}
