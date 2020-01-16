/**
 * Copyright (C) 2017-2020 Linagora
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

import { browser, by } from 'protractor';

import {
  errorActualBackendLongText,
  IMPORT_HTTP_ERROR_IP_LONG_TEXT,
} from '../../src/mocks/backend-mock';
import { page } from './../common';
// import { NotFoundPage } from './../pages/not-found';
import { WorkspacePage } from './../pages/workspace.po';
import { waitAndClick } from './../utils';

// FIXME: I don't get it
// describe(`Import Bus`, () => {
//   it(`should open the 404 page if the bus in progress doesn't exists`, () => {
//     page
//       .goToViaLogin('/workspaces/idWks0/petals/buses-in-progress/unknownIdBip')
//       .loginNoCheck('admin', 'admin');

//     NotFoundPage.waitAndGet();
//   });
// });

describe(`Import Bus`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace(`admin`, `admin`);
  });

  // FIXME: JMX not accessible for now outside docker container
  // it(`should import a bus`, () => {
  //   const importBus = workspace.openImportBus();

  //   expect(
  //     $$(
  //       `app-petals-menu-view app-material-tree mat-nav-list a.workspace-element-type-bus`
  //     ).count()
  //   ).toEqual(0);

  //   importBus.ip.sendKeys(`petals`);
  //   importBus.port.sendKeys(`7700`);
  //   importBus.username.sendKeys(`petals`);
  //   importBus.password.sendKeys(`petals`);
  //   importBus.passphrase.sendKeys(`petals`);

  //   page.clickAndExpectNotification(
  //     importBus.importButton,
  //     'Bus import success',
  //     /^The import of the bus .* succeeded$/
  //   );

  //   console.log(
  //     $$(
  //       `app-petals-menu-view app-material-tree mat-nav-list a.workspace-element-type-bus`
  //     ).count() + 'Bus imported '
  //   );
  //   console.log(workspace.busesInProgress.count() + 'Bus in progress ');

  //   expect(
  //     $$(
  //       `app-petals-menu-view app-material-tree .mat-nav-list a.workspace-element-type-bus`
  //     ).count()
  //   ).toEqual(1);
  // });

  it('should have empty fields by default', () => {
    const importBus = workspace.openImportBus();

    // 0 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(0);

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

    // still 0 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(0);
  });

  it(`should be cleared when clicking on the clear button`, () => {
    const importBus = workspace.openImportBus();

    //  0 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(0);

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

    // still 0 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(0);
  });

  it('should show the backend HTTP error', () => {
    const importBus = workspace.openImportBus();

    // no buses in progress
    expect(workspace.busesInProgress.count()).toEqual(0);

    importBus.ip.sendKeys(IMPORT_HTTP_ERROR_IP_LONG_TEXT);
    importBus.port.sendKeys(`7700`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    const error = importBus.getErrorImportDetailsMessage();

    error.expectHidden();

    // try to import a new one
    importBus.importButton.click();

    // FIXME: error not long enough with a real backend, no button to view more
    // testing this in UI test should be enough
    error.expectToBeWaitTimeout('error', errorActualBackendLongText);
    // error.openAndCheckDialog(errorActualBackendLongText);

    // clear the form and the error
    waitAndClick(importBus.discardButton);

    // still 0 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(0);
  });

  it('should be able to discard and retry after a failed import', () => {
    const importBus = workspace.openImportBus();

    // 0 buses in progress
    expect(workspace.busesInProgress.count()).toEqual(0);

    importBus.ip.sendKeys(IMPORT_HTTP_ERROR_IP_LONG_TEXT);
    importBus.port.sendKeys(`7700`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    page.clickAndExpectNotification(
      importBus.importButton,
      'Bus import error',
      /^The import of the bus .* failed$/
    );

    // 1 bus in error
    expect(workspace.busesInProgress.count()).toEqual(1);

    // clear the form, the error and retry the import
    page.clickAndExpectNotification(
      importBus.discardAndRetryButton,
      IMPORT_HTTP_ERROR_IP_LONG_TEXT + ':7700',
      'Bus deleted by admin'
    );

    // Retrying: no bus in error
    expect(workspace.busesInProgress.count()).toEqual(0);

    expect(browser.getCurrentUrl()).toMatch(
      /\/workspaces\/\w+\/petals\/buses-in-progress$/
    );

    expect(importBus.ip.getAttribute('value')).toBe(
      IMPORT_HTTP_ERROR_IP_LONG_TEXT
    );
    expect(importBus.port.getAttribute('value')).toBe('7700');
    expect(importBus.username.getAttribute('value')).toBe('admin');
    expect(importBus.password.getAttribute('value')).toBe('');
    expect(importBus.passphrase.getAttribute('value')).toBe('');
  });

  it(`should show the import error`, () => {
    const importBus = workspace.openImportBus();

    expect(workspace.busesInProgress.count()).toEqual(0);

    importBus.ip.sendKeys(`hostname`);
    importBus.port.sendKeys(`7700`);
    importBus.username.sendKeys(`admin`);
    importBus.password.sendKeys(`password`);
    importBus.passphrase.sendKeys(`passphrase`);

    const error = importBus.getErrorImportDetailsMessage();

    error.expectHidden();

    // try to import
    importBus.importButton.click();

    error.expectToBeWaitTimeout(
      'error',
      `org.ow2.petals.jmx.api.api.exception.ConnectionErrorException: java.net.UnknownHostException: hostname: Name or service not known`
    );

    expect(workspace.busesInProgress.count()).toEqual(1);
    expect(
      workspace.busesInProgress
        .get(0)
        .$(`.ip-port`)
        .getText()
    ).toEqual('hostname:7700');
    expect(
      workspace.busesInProgress
        .get(0)
        .element(by.cssContainingText(`mat-icon`, `warning`))
        .isDisplayed()
    ).toEqual(true);

    expect(importBus.discardName.getText()).toEqual(`DISCARD`);
    expect(importBus.discardButton.isEnabled()).toBe(true);

    // clear the form and the error
    waitAndClick(importBus.discardButton);

    expect(workspace.busesInProgress.count()).toEqual(0);
  });
});
