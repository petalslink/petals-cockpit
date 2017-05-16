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

import { browser, Key } from 'protractor';

import { CORRECT_SETUP_TOKEN, GONE_SETUP_TOKEN } from '../src/mocks/backend-mock';
import { page } from './common';
import { expectFocused } from './utils';
import { SetupPage } from './pages/setup.po';

describe(`Setup`, () => {
  describe('No token', () => {
    let setup: SetupPage;

    beforeEach(() => {
      setup = page.goToSetup();
    });

    it('should not allow to click if info is missing', () => {
      setup.expectDefaultButton();

      setup.expectDefaultFields();

      setup.token.sendKeys('token');

      setup.expectDefaultButton();

      setup.username.sendKeys('u');

      setup.expectDefaultButton();

      setup.password.sendKeys('p');

      setup.expectDefaultButton();

      setup.name.sendKeys('n');
      setup.username.sendKeys(Key.BACK_SPACE);

      setup.expectDefaultButton();

      setup.username.sendKeys('u');

      setup.expectDefaultButton(true);
    });

    it('should change button with the correct token', () => {
      setup.putValues(CORRECT_SETUP_TOKEN);

      setup.button.click();
      expect(setup.error.isPresent()).toBe(false);
      expect(setup.button.isEnabled()).toBe(true);
      expect(setup.button.getText()).toEqual('User added: click to login!');

      setup.button.click();
      expect(browser.getCurrentUrl()).toMatch(/\/login/);
    });

    it('should be forbidden with the wrong token', () => {
      setup.putValues('WRONG');

      setup.button.click();
      expect(setup.error.isDisplayed()).toBe(true);
      expect(setup.error.$('p').getText()).toEqual('Invalid token');

      setup.expectDefaultButton(true, true);
    });

    it('should be gone once it has been setup', () => {
      setup.putValues(GONE_SETUP_TOKEN);

      setup.button.click();
      expect(setup.error.isDisplayed()).toBe(true);
      expect(setup.error.$('p').getText()).toEqual('Petals Cockpit is already setup');
    });

    it('should select token', () => {
      expectFocused(setup.token);
    });
  });

  it('should pre-fill the token field', () => {
    const tokenTest = 'TOKENTEST';
    const setup = page.goToSetup(tokenTest);

    setup.expectDefaultFields(tokenTest);
  });

  it('should select username with pre-filled token field', () => {
    const setup = page.goToSetup('TOKENTEST');

    expectFocused(setup.username);
  });
});
