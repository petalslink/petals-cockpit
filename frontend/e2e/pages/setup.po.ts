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

import { $, browser, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { urlToMatch } from '../utils';

export class SetupPage {
  public static readonly component = $('app-setup');

  public readonly component = SetupPage.component;
  public readonly token = this.component.$(`input[formControlName="token"]`);
  public readonly username = this.component.$(
    `input[formControlName="username"]`
  );
  public readonly password = this.component.$(
    `input[formControlName="password"]`
  );
  public readonly name = this.component.$(`input[formControlName="name"]`);
  public readonly button = this.component.$(`button`);
  public readonly error = this.component.$(`div.form-error`);

  static waitAndGet() {
    browser.wait(urlToMatch(/\/setup/), waitTimeout);
    browser.wait(EC.visibilityOf(SetupPage.component), waitTimeout);
    return new SetupPage();
  }

  private constructor() {}

  expectDefaultButton(enabled = false, hasError = false) {
    expect(this.button.isEnabled()).toBe(enabled);
    expect(this.button.getText()).toEqual('Add');
    if (hasError) {
      expect(this.error.isDisplayed()).toBe(true);
    } else {
      expect(this.error.isPresent()).toBe(false);
    }
  }

  expectDefaultFields(token = '') {
    expect(this.token.getAttribute('value')).toEqual(token);
    expect(this.username.getAttribute('value')).toEqual('');
    expect(this.password.getAttribute('value')).toEqual('');
    expect(this.name.getAttribute('value')).toEqual('');
  }

  putValues(token: string) {
    this.token.sendKeys(token);
    this.username.sendKeys('u');
    this.password.sendKeys('p');
    this.name.sendKeys('n');
  }
}
