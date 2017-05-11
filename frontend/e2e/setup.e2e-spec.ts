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

import { browser, element, by, Key } from 'protractor';

import { page, expectFocused } from './common';

import { CORRECT_SETUP_TOKEN, GONE_SETUP_TOKEN } from '../src/mocks/backend-mock';

describe(`Setup`, () => {

  const card = element(by.css('app-setup'));
  const tokenField = card.element(by.css(`input[formControlName="token"]`));
  const usernameField = card.element(by.css(`input[formControlName="username"]`));
  const passwordField = card.element(by.css(`input[formControlName="password"]`));
  const nameField = card.element(by.css(`input[formControlName="name"]`));
  const button = card.element(by.css(`button`));
  const error = card.element(by.css(`div.form-error`));

  function goTo(token?: string) {
    if (token) {
      page.navigateTo(false, `/setup?token=${token}`);
    } else {
      page.navigateTo(false, '/setup');
    }
    expect(browser.getCurrentUrl()).toMatch(/\/setup/);

    expect(card.isDisplayed()).toBe(true);
  }

  function expectDefaultButton(enabled = false, hasError = false) {
    expect(button.isEnabled()).toBe(enabled);
    expect(button.getText()).toEqual('Add');
    if (hasError) {
      expect(error.isDisplayed()).toBe(true);
    } else {
      expect(error.isPresent()).toBe(false);
    }
  }

  function expectDefaultFields(token = '') {
    expect(tokenField.getAttribute('value')).toEqual(token);
    expect(usernameField.getAttribute('value')).toEqual('');
    expect(passwordField.getAttribute('value')).toEqual('');
    expect(nameField.getAttribute('value')).toEqual('');
  }

  function putValues(token: string) {
    tokenField.sendKeys(token);
    usernameField.sendKeys('u');
    passwordField.sendKeys('p');
    nameField.sendKeys('n');
  }

  it('should not allow to click if info is missing', () => {
    goTo();

    expectDefaultButton();

    expectDefaultFields();

    tokenField.sendKeys('token');

    expectDefaultButton();

    usernameField.sendKeys('u');

    expectDefaultButton();

    passwordField.sendKeys('p');

    expectDefaultButton();

    nameField.sendKeys('n');
    usernameField.sendKeys(Key.BACK_SPACE);

    expectDefaultButton();

    usernameField.sendKeys('u');

    expectDefaultButton(true);
  });

  it('should change button with the correct token', () => {
    goTo();

    putValues(CORRECT_SETUP_TOKEN);

    button.click();
    expect(error.isPresent()).toBe(false);
    expect(button.isEnabled()).toBe(true);
    expect(button.getText()).toEqual('User added: click to login!');

    button.click();
    expect(browser.getCurrentUrl()).toMatch(/\/login/);
  });

  it('should be forbidden with the wrong token', () => {
    goTo();

    putValues('WRONG');

    button.click();
    expect(error.isDisplayed()).toBe(true);
    expect(error.element(by.css('p')).getText()).toEqual('Invalid token');

    expectDefaultButton(true, true);
  });

  it('should be gone once it has been setup', () => {
    goTo();

    putValues(GONE_SETUP_TOKEN);

    button.click();
    expect(error.isDisplayed()).toBe(true);
    expect(error.element(by.css('p')).getText()).toEqual('Petals Cockpit is already setup');
  });

  it('should pre-fill the token field', () => {
    const tokenTest = 'TOKENTEST';
    goTo(tokenTest);

    expectDefaultFields(tokenTest);
  });

  it('should select username with pre-filled token field', () => {
    const tokenTest = 'TOKENTEST';
    goTo(tokenTest);

    expectFocused(usernameField);
  });

  it('should select token', () => {
    goTo();

    expectFocused(tokenField);
  });
});
