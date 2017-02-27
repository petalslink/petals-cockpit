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

import { browser, element, by, ExpectedConditions as EC } from 'protractor';

import { PetalsCockpitPage } from './app.po';

describe(`Import Bus`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
    page.login(`admin`, `admin`);
    element.all(by.css(`app-workspaces-dialog md-card`)).first().click();
    const addBtn = element(by.css(`app-cockpit md-sidenav a.btn-add-bus`));
    browser.wait(EC.elementToBeClickable(addBtn), 5000);
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);
    addBtn.click();
    // We close manually the sidenav
    // TODO : We need to found a solution for resolve this error : "Failed : element not visible"
    page.toggleSidenav();
  });

  it(`should be cleared when clicking on the clear button`, () => {

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/buses-in-progress$/);

    const inputIp = element(by.css(`input[formControlName="ip"]`));
    const inputPort = element(by.css(`input[formControlName="port"]`));
    const inputUsername = element(by.css(`input[formControlName="username"]`));
    const inputPassword = element(by.css(`input[formControlName="password"]`));
    const inputPassphrase = element(by.css(`input[formControlName="passphrase"]`));
    const importBtn = element(by.css(`app-petals-bus-in-progress-view form .btn-import-form`));
    const clearBtn = element(by.css(`app-petals-bus-in-progress-view form .btn-clear-form`));

    // check if the input form is empty
    expect(inputIp.getText()).toEqual(``);
    expect(inputPort.getText()).toEqual(``);
    expect(inputUsername.getText()).toEqual(``);
    expect(inputPassword.getText()).toEqual(``);
    expect(inputPassphrase.getText()).toEqual(``);

    // check if import button is always disable when inputs form are empty
    expect(importBtn.getText()).toMatch(`Import`);
    expect(importBtn.isEnabled()).toBe(false);

    // check if clear button is always enable
    expect(clearBtn.getText()).toMatch(`Clear`);
    expect(clearBtn.isEnabled()).toBe(true);

    inputIp.sendKeys(`hostname`);
    inputPort.sendKeys(`5000`);
    inputUsername.sendKeys(`admin`);
    inputPassword.sendKeys(`password`);
    inputPassphrase.sendKeys(`passphrase`);

    clearBtn.click();

    // check if the input form is cleared
    expect(inputIp.getText()).toEqual(``);
    expect(inputPort.getText()).toEqual(``);
    expect(inputUsername.getText()).toEqual(``);
    expect(inputPassword.getText()).toEqual(``);
    expect(inputPassphrase.getText()).toEqual(``);

    // We open manually the sidenav
    // TODO : We need to found a solution for resolve this error : "Failed : element not visible"
    page.toggleSidenav();

    element.all(by.css(`app-cockpit md-sidenav app-buses-in-progress md-nav-list div.mat-list-item-content`)).first().click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/buses-in-progress\/\w+$/);

    page.toggleSidenav();

    // check if clear button is not present
    expect(clearBtn.isPresent()).toBe(false);
  });
});
