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

/*  it('should be redirected to login if a user is trying to access a protected route without being logged', () => {
    p.navigateTo('/cockpit');

    expect(browser.getCurrentUrl()).toMatch('/login');
    browser.debugger();
  });

  it('should not login if user/pwd not match', () => {
    p.navigateTo('/login');

    expect(p.getText('.page-login button')).toMatch('Log in');

    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'randomPasswordNotWorking');

    p.click('.page-login button');

    expect(browser.getCurrentUrl()).toMatch('/login');
    browser.debugger();
  });

  it('should login if user/pwd match', () => {
    p.navigateTo('/login');

    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'admin');

    p.click('.page-login button');

    expect(browser.getCurrentUrl()).toMatch('/cockpit/workspaces');
    browser.debugger();
  });*/

  // Navigate in the cockpit (Petals, Service, Api, Overview, Config ..)
  // Select Bus, Container, Component, Su
  // Search Bar
  // Import Bus
  // Change Workspace
  // Change Language
  // Change Theme
/*
  it('should navigate in the cockpit', () => {

    p.navigateTo('/cockpit');

    p.click('.page-workspaces md-list-item');

    p.click('.select-bus .bus');

    p.click('.select-component:nth-child(1) > md-nav-list:nth-child(2) > a .md-list-item:nth-child(1)');

    p.click('.select-su:nth-child(1) > md-nav-list:nth-child(2) > a .md-list-item:nth-child(1)');

    p.click('.select-container:nth-child(1) > .containers-menu-component:nth-child(2) > a .md-list-item:nth-child(1)');

    p.click('.select-bus .bus');

    p.click('.select-tab-bus .md-tab-header > div:nth-child(2)');

    p.click('.select-tab-bus .md-tab-header > div:nth-child(1)');

    p.click('.sidenav-menu .change-workspace');

    p.click('.sidenav-menu .settings');

    p.click('.page-settings md-slide-toggle');

    p.click('.page-settings md-slide-toggle');

    p.click('.page-settings .radio-btn-language md-radio-button[value="fr"]');

    p.click('.page-settings .radio-btn-language md-radio-button[value="en"]');

    p.click('.sidenav-menu .change-workspace');

    p.click('.page-workspaces md-list-item');

    p.click('.select-bus .bus');

    p.click('.sidenav-menu .md-tab-header > div:nth-child(2)');

    p.click('.sidenav-menu .md-tab-header > div:nth-child(3)');

    p.click('.sidenav-menu .md-tab-header > div:nth-child(1)');

    p.fillInput('.petals-component .search input', 'compo');

    p.click('.select-component:nth-child(1) > md-nav-list:nth-child(2) > a .md-list-item:nth-child(1)');

    p.fillInput('.petals-component .search input', '3');

    p.click('.select-container:nth-child(1) > .containers-menu-component:nth-child(2) > a .md-list-item:nth-child(1)');

    p.fillInput('.petals-component .search input', '333');

    p.navigateTo('/cockpit');

    p.click('.page-workspaces md-list-item');

    p.click('.petals-component .import-bus');

    p.fillInput('md-input input[name="ip"]', '192.168.1.1');
    p.fillInput('md-input input[name="port"]', '4200');
    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'admin');

    p.click('.page-import-bus .btn-import-bus');

    expect(browser.getCurrentUrl()).toMatch('/cockpit/workspaces');
    browser.debugger();
  });
*/


  it('should import buses if the first import bus failed', () => {
    p.navigateTo('/cockpit');

    p.click('.page-workspaces md-list-item');

    p.click('.petals-component .import-bus');

    p.fillInput('md-input input[name="ip"]', '192.168.1.1');
    p.fillInput('md-input input[name="port"]', '4200');
    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'admin');
    p.fillInput('md-input input[name="passphrase"]', 'iwantimportmynewbus');
    // First import bus failed
    p.click('.page-import-bus .btn-import-bus');

    p.click('.petals-component .import-bus');

    p.fillInput('md-input input[name="ip"]', '192.168.1.2');
    p.fillInput('md-input input[name="port"]', '4200');
    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'admin');
    p.fillInput('md-input input[name="passphrase"]', 'iwantimportmynewbus2');
    // Second import bus success
    p.click('.page-import-bus .btn-import-bus');

    p.click('.petals-component .import-bus');

    p.fillInput('md-input input[name="ip"]', '192.168.1.3');
    p.fillInput('md-input input[name="port"]', '4200');
    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'admin');
    p.fillInput('md-input input[name="passphrase"]', 'iwantimportmynewbus3');
    // Third import bus success
    p.click('.page-import-bus .btn-import-bus');

    expect(browser.getCurrentUrl()).toMatch('/cockpit/workspaces');
    browser.debugger();
  });

});
