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
import * as path from 'path';

import { page } from './common';

describe(`Petals component content`, () => {
  beforeEach(() => {
    page.navigateTo();
    page.login(`admin`, `admin`);
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);
  });

  it(`should open the content page`, () => {
    page.getWorkspaceTreeByName('Comp 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/components\/\w+/);

    const pageTitle = element(by.css(`app-petals-component-view md-toolbar-row .title`)).getText();
    expect(pageTitle).toEqual('Comp 0');

    const state = element(by.css(`app-petals-component-overview md-card.state md-card-title`)).getText();
    const type = element(by.css(`app-petals-component-overview md-card.type md-card-title`)).getText();

    expect(state).toEqual('Started');
    expect(type).toEqual('BC');
  });

  it(`should stop/start/stop/unload a component`, () => {
    const stateElem = element(by.css(`app-petals-component-overview md-card.state md-card-title`));
    const btnStop = element(by.cssContainingText(`app-petals-component-overview button`, `Stop`));
    const btnStart = element(by.cssContainingText(`app-petals-component-overview button`, `Start`));
    const btnInstall = element(by.cssContainingText(`app-petals-component-overview button`, `Install`));
    const btnUninstall = element(by.cssContainingText(`app-petals-component-overview button`, `Uninstall`));
    const btnUnload = element(by.cssContainingText(`app-petals-component-overview button`, `Unload`));

    // the component exists and should be present in petals tree
    expect(page.getWorkspaceTreeByName(`Comp 0`).first().isPresent()).toBe(true);

    page.getWorkspaceTreeByName('Comp 0').click();

    btnStop.click();
    expect(stateElem.getText()).toEqual('Stopped');
    expect(btnStop.isPresent()).toBe(false);
    expect(btnStart.isEnabled()).toBe(true);
    expect(btnInstall.isPresent()).toBe(false);
    // as the comp 0 still have 2 SUs (SU 0, SU 1), we can't unload it yet
    expect(btnUninstall.isEnabled()).toBe(false);
    expect(btnUnload.isEnabled()).toBe(false);

    btnStart.click();
    expect(stateElem.getText()).toEqual('Started');
    expect(btnStop.isEnabled()).toBe(true);
    expect(btnStart.isPresent()).toBe(false);
    expect(btnUnload.isPresent()).toBe(false);
    expect(btnInstall.isPresent()).toBe(false);
    expect(btnUninstall.isPresent()).toBe(false);

    btnStop.click();

    // unload the 2 SU
    const suStop = element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`));
    const suUnload = element(by.cssContainingText(`app-petals-service-unit-overview button`, `Unload`));
    page.getWorkspaceTreeByName('SU 0').click();
    suStop.click();

    page.clickAndExpectNotification(suUnload);

    page.getWorkspaceTreeByName('SU 1').click();
    suStop.click();

    page.clickAndExpectNotification(suUnload);

    // we should now be able to unload the comp 0
    page.getWorkspaceTreeByName('Comp 0').click();

    expect(stateElem.getText()).toEqual('Stopped');
    expect(btnStop.isPresent()).toBe(false);
    expect(btnStart.isEnabled()).toBe(true);
    expect(btnInstall.isPresent()).toBe(false);
    expect(btnUninstall.isEnabled()).toBe(true);
    expect(btnUnload.isEnabled()).toBe(true);

    // uninstall
    btnUninstall.click();
    expect(stateElem.getText()).toEqual('Loaded');
    expect(btnStop.isPresent()).toBe(false);
    expect(btnStart.isPresent()).toBe(false);
    expect(btnInstall.isEnabled()).toBe(true);
    expect(btnUninstall.isPresent()).toBe(false);
    expect(btnUnload.isEnabled()).toBe(true);

    // install
    btnInstall.click();
    expect(stateElem.getText()).toEqual('Shutdown');
    expect(btnStop.isPresent()).toBe(false);
    expect(btnStart.isEnabled()).toBe(true);
    expect(btnInstall.isPresent()).toBe(false);
    expect(btnUninstall.isEnabled()).toBe(true);
    expect(btnUnload.isEnabled()).toBe(true);

    btnUninstall.click();

    // once unloaded ...
    page.clickAndExpectNotification(btnUnload);

    // we should be redirected to the workspace page ...
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    // and the component should have been deleted from petals tree
    expect(page.getWorkspaceTreeByName(`Comp 0`).first().isPresent()).toBe(false);
  });

  it(`should show a detailed error if the SU deployment fails`, () => {
    page.getWorkspaceTreeByName('Comp 0').click();

    element(by.cssContainingText(`app-petals-component-view md-tab-header .mat-tab-label`, 'Operations')).click();

    const chooseFileBtn = element(by.css(`app-petals-component-operations .deploy .choose-file`));
    const fileInput = element(by.css(`app-petals-component-operations .deploy input[type="file"]`));
    const selectedFile = element(by.css(`app-petals-component-operations .deploy .selected-file .file-name`));
    const deployBtn = element(by.css(`app-petals-component-operations .deploy form button[type="submit"]`));
    const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
    const errorDetailsTitle = element(by.css(`app-petals-component-operations .deploy .error-deploy .title`));
    const errorDetailsMessage = element(by.css(`app-petals-component-operations .deploy .error-deploy .message`));

    browser.wait(EC.elementToBeClickable(chooseFileBtn), 3000);

    expect(chooseFileBtn.getText()).toEqual(`Choose a file to upload`);
    // simulate the file selection
    fileInput.sendKeys(filePath);

    // once the file is selected, check that the other part of the form is displayed
    expect(selectedFile.isDisplayed()).toBe(true);
    expect(selectedFile.getText()).toEqual(`error-deploy.zip`);
    expect(chooseFileBtn.getText()).toEqual(`Change the file`);

    expect(deployBtn.getText()).toMatch(`Deploy`);
    expect(deployBtn.isEnabled()).toBe(true);

    // deploy the component
    page.clickAndExpectNotification(
      deployBtn,
      'Deploy Service-Unit failed',
      'An error occurred when trying to deploy the file "error-deploy.zip"'
    );

    expect(errorDetailsTitle.getText()).toEqual('An error occurred:');
    expect(errorDetailsMessage.getText()).toEqual('[Mock message] An error happened when trying to deploy the service-unit');
  });

  it(`should deploy a service-unit`, () => {
    page.getWorkspaceTreeByName('Comp 0').click();

    element(by.cssContainingText(`app-petals-component-view md-tab-header .mat-tab-label`, 'Operations')).click();

    const chooseFileBtn = element(by.css(`app-petals-component-operations .deploy .choose-file`));
    const fileInput = element(by.css(`app-petals-component-operations .deploy input[type="file"]`));
    const selectedFile = element(by.css(`app-petals-component-operations .deploy .selected-file .file-name`));
    const changeSuNameInput = element(by.css(`app-petals-component-operations .deploy form input[name="serviceUnitName"]`));
    const deployBtn = element(by.css(`app-petals-component-operations .deploy form button[type="submit"]`));
    const filePath = path.resolve(__dirname, './resources/su.zip');

    browser.wait(EC.elementToBeClickable(chooseFileBtn), 3000);

    expect(chooseFileBtn.getText()).toEqual(`Choose a file to upload`);
    // simulate the file selection
    fileInput.sendKeys(filePath);

    // once the file is selected, check that the other part of the form is displayed
    expect(selectedFile.isDisplayed()).toBe(true);
    expect(selectedFile.getText()).toEqual(`su.zip`);
    expect(chooseFileBtn.getText()).toEqual(`Change the file`);

    expect(deployBtn.getText()).toMatch(`Deploy`);

    expect(changeSuNameInput.getAttribute('value')).toEqual(`su`);
    expect(deployBtn.isEnabled()).toBe(true);

    const expectedTreeBeforeDeploy = [
      `Bus 0`,
      `Cont 0`,
      `Comp 0`,
      `SU 0`,
      `SU 1`,
      `Comp 1`,
      `SU 2`,
      `SU 3`,
      `Cont 1`,
      `Comp 2`,
      `SU 4`,
      `SU 5`,
      `Comp 3`,
      `SU 6`,
      `SU 7`
    ];

    expect(page.getWorkspaceTree()).toEqual(expectedTreeBeforeDeploy);

    // deploy the service-unit
    page.clickAndExpectNotification(deployBtn, 'SU deployed', '"su" has been deployed');

    // check that the service-unit is now added to the tree and that we've been redirected to it
    const expectedTreeAfterDeploy = [
      `Bus 0`,
      `Cont 0`,
      `Comp 0`,
      `SU 0`,
      `SU 1`,
      // this one should have been deployed
      `su`,
      `Comp 1`,
      `SU 2`,
      `SU 3`,
      `Cont 1`,
      `Comp 2`,
      `SU 4`,
      `SU 5`,
      `Comp 3`,
      `SU 6`,
      `SU 7`
    ];

    expect(page.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/service-units\/\w+/);
  });

  it(`should display an error if component change state (install) fails`, () => {
    // in container view
    const fileInput = element(by.css(`app-petals-container-operations .deploy input[type="file"]`));
    const filePath = path.resolve(__dirname, './resources/component.zip');
    const deployBtn = element(by.css(`app-petals-container-operations .deploy form button[type="submit"]`));

    // in component view
    const btnInstall = element(by.cssContainingText(`app-petals-component-overview button`, `Install`));
    const inputHttpPort = element(by.css(`app-petals-component-overview .parameters form input[placeholder="http-port"]`));
    const inputEnableHttps = element(by.css(`app-petals-component-overview .parameters form input[placeholder="enable-https"]`));
    const txtErrorChangeState = element(by.css(`app-petals-component-overview md-card.state .error .italic`));

    // deploy a component (already tested in containers E2E tests)
    page.getWorkspaceTreeByName('Cont 0').click();
    element(by.cssContainingText(`app-petals-container-view md-tab-header .mat-tab-label`, 'Operations')).click();
    fileInput.sendKeys(filePath);
    page.clickAndExpectNotification(deployBtn, 'Component deployed', '"component" has been deployed');

    // change state to install with some parameters (with error in http-port to make it fail)
    inputHttpPort.sendKeys('error');
    btnInstall.click();

    // check if the error is displayed
    expect(txtErrorChangeState.getText()).toEqual(`[Mock message] An error happened when trying to change the state of that component`);

    // make sure the form isn't reset
    expect(inputHttpPort.getAttribute('value')).toEqual(`8080error`);
    expect(inputEnableHttps.getAttribute('value')).toEqual(`false`);
  });
});
