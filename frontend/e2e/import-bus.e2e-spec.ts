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

import { $$, browser, by } from 'protractor';

import {
  errorBackendLongText,
  errorBackendTroncateTxt,
  IMPORT_HTTP_ERROR_IP_LONG_TEXT,
} from '../src/mocks/backend-mock';
import { page } from './common';
import { NotFoundPage } from './pages/not-found';
import { WorkspacePage } from './pages/workspace.po';
import { expectFocused, waitAndClick } from './utils';

describe(`Import Bus`, () => {
  it(`should open the 404 page if the bus in progress doesn't exists`, () => {
    page
      .goToViaLogin('/workspaces/idWks0/petals/buses-in-progress/unknownIdBip')
      .loginNoCheck('admin', 'admin');

    NotFoundPage.waitAndGet();
  });
});

describe(`Import Bus`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace(`admin`, `admin`);
  });

  it('should have empty fields by default', () => {
    const importBus = workspace.openImportBus();

    expect(importBus.ip.getAttribute('value')).toEqual(``);
    expect(importBus.port.getAttribute('value')).toEqual(``);
    expect(importBus.username.getAttribute('value')).toEqual(``);
    expect(importBus.password.getAttribute('value')).toEqual(``);
    expect(importBus.passphrase.getAttribute('value')).toEqual(``);

    expect(importBus.importName.getText()).toEqual(`IMPORT`);
    expect(importBus.importButton.isEnabled()).toBe(false);

    expect(importBus.clearName.getText()).toEqual(`CLEAR`);
    expect(importBus.clearButton.isEnabled()).toBe(true);

    expect(importBus.discardButton.isPresent()).toBe(false);
  });

  it(`should be cleared when clicking on the clear button`, () => {
    const importBus = workspace.openImportBus();

    importBus.ip.sendKeys(`hostname`);
    importBus.port.sendKeys(`5000`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    importBus.clearButton.click();

    // check if the input form is cleared
    expect(importBus.ip.getAttribute('value')).toEqual(``);
    expect(importBus.port.getAttribute('value')).toEqual(``);
    expect(importBus.username.getAttribute('value')).toEqual(``);
    expect(importBus.password.getAttribute('value')).toEqual(``);
    expect(importBus.passphrase.getAttribute('value')).toEqual(``);
  });

  it('should not have a clear button on existing bus in import', () => {
    const otherBus = workspace.openBusInProgress(0);

    // check if clear button is not present
    expect(otherBus.clearButton.isPresent()).toBe(false);

    expect(otherBus.cancelName.getText()).toEqual(`CANCEL`);
    expect(otherBus.discardButton.isEnabled()).toBe(true);
  });

  it('should show the backend HTTP error', () => {
    const importBus = workspace.openImportBus();

    // only 2 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(2);

    importBus.ip.sendKeys(IMPORT_HTTP_ERROR_IP_LONG_TEXT);
    importBus.port.sendKeys(`7700`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    const error = importBus.getErrorImportDetailsMessage();

    error.expectHidden();

    // try to import a new one
    importBus.importButton.click();

    error.expectToBe('error', errorBackendTroncateTxt);
    error.openAndCheckDialog(errorBackendLongText);

    // clear the form and the error
    waitAndClick(importBus.clearButton);

    // still 2 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(2);
  });

  it('should be able to discard and retry after a failed import', () => {
    const importBus = workspace.openImportBus();

    importBus.ip.sendKeys('192.168.1.1');
    importBus.port.sendKeys(`7700`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    page.clickAndExpectNotification(
      importBus.importButton,
      'Bus import error',
      /^The import of the bus .* failed$/
    );

    // clear the form, the error and retry the import
    page.clickAndExpectNotification(
      importBus.discardAndRetryButton,
      '192.168.1.1:7700',
      'Bus deleted by admin'
    );

    expect(workspace.busesInProgress.count()).toEqual(2);

    expect(browser.getCurrentUrl()).toMatch(
      /\/workspaces\/\w+\/petals\/buses-in-progress$/
    );

    expect(importBus.ip.getAttribute('value')).toBe('192.168.1.1');
    expect(importBus.port.getAttribute('value')).toBe('7700');
    expect(importBus.username.getAttribute('value')).toBe('admin');
    expect(importBus.password.getAttribute('value')).toBe('');
    expect(importBus.passphrase.getAttribute('value')).toBe('');
  });

  it(`should show the import error`, () => {
    const importBus = workspace.openImportBus();

    // only 2 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(2);

    importBus.ip.sendKeys(`hostname`);
    importBus.port.sendKeys(`7700`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    const error = importBus.getErrorImportDetailsMessage();

    error.expectHidden();

    // try to import
    importBus.importButton.click();

    error.expectToBe('error', `Can't connect to hostname:7700`);

    expect(workspace.busesInProgress.count()).toEqual(3);
    expect(
      workspace.busesInProgress
        .get(2)
        .$(`.ip-port`)
        .getText()
    ).toEqual('hostname:7700');
    expect(
      workspace.busesInProgress
        .get(2)
        .element(by.cssContainingText(`mat-icon`, `warning`))
        .isDisplayed()
    ).toEqual(true);

    expect(importBus.discardName.getText()).toEqual(`DISCARD`);
    expect(importBus.discardButton.isEnabled()).toBe(true);
  });

  it(`should import a bus`, () => {
    const importBus = workspace.openImportBus();

    expect(
      $$(
        `app-petals-menu-view app-material-tree mat-nav-list a.workspace-element-type-bus`
      ).count()
    ).toEqual(1);

    importBus.ip.sendKeys(`192.168.0.1`);
    importBus.port.sendKeys(`7700`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    page.clickAndExpectNotification(
      importBus.importButton,
      'Bus import success',
      /^The import of the bus .* succeeded$/
    );

    expect(
      $$(
        `app-petals-menu-view app-material-tree .mat-nav-list a.workspace-element-type-bus`
      ).count()
    ).toEqual(2);
  });

  it(`should select the first input of import bus form on desktop`, () => {
    const importBus = workspace.openImportBus();

    expectFocused(importBus.ip);
  });
});
