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
  ElementFinder,
  by,
} from 'protractor';
import { waitTimeout } from '../common';

export class AdminAddEditUserPage {
  public readonly usernameInput = this.component.$(
    'input[formcontrolname="username"]'
  );
  public readonly nameInput = this.component.$('input[formcontrolname="name"]');
  public readonly passwordInput = this.component.$(
    'input[formcontrolname="password"]'
  );

  public readonly actions = this.component.$(
    `.user-form .pnl-actions-user-management`
  );
  public readonly cancelButton = this.actions.element(
    by.cssContainingText(`button`, `Cancel`)
  );
  public readonly deleteButton = this.actions.element(
    by.cssContainingText(`button`, `Delete`)
  );
  public readonly saveButton = this.actions.element(
    by.cssContainingText(`button`, `Save`)
  );
  public readonly addButton = this.actions.element(
    by.cssContainingText(`button`, `Add`)
  );
  public readonly cancelName = this.cancelButton.$(`span.cancel-name`);
  public readonly deleteName = this.deleteButton.$(`span.delete-name`);
  public readonly saveName = this.saveButton.$(`span.save-name`);

  static waitAndGet(parent: ElementFinder) {
    const component = parent.$(`app-add-edit-user`);
    browser.wait(EC.visibilityOf(component), waitTimeout);
    return new AdminAddEditUserPage(component);
  }

  private constructor(public readonly component: ElementFinder) {}
}
