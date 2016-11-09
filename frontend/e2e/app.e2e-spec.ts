/**
 * Copyright (C) 2016 Linagora
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

import { PetalsCockpitPage } from './app.po';
import { browser } from 'protractor';

describe('petals-cockpit App', function() {
  let p: PetalsCockpitPage;

  beforeEach(() => {
    p = new PetalsCockpitPage();
  });

  it('should be redirected to login if a user is trying to access a protected route without being logged', () => {
    p.navigateTo('/cockpit');

    expect(browser.getCurrentUrl()).toMatch('/login');
  });

  it('should not login if user/pwd not match', () => {
    p.navigateTo('/login');

    expect(p.getText('.page-login button')).toMatch('Log in');

    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'randomPasswordNotWorking');

    p.click('.page-login button');

    expect(browser.getCurrentUrl()).toMatch('/login');
  });

  it('should login if user/pwd match', () => {
    p.navigateTo('/login');

    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'admin');

    p.click('.page-login button');

    expect(browser.getCurrentUrl()).toMatch('/cockpit/workspaces');
  });
});
