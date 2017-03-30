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

const path = require('path');

describe(`Petals component content`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.setDesktopSize();
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

    expect(element(by.css(`button.choose-file`)).isEnabled()).toBe(true);
  });

  it(`should stop/start/stop/unload a component`, () => {
    const stateElem = element(by.css(`app-petals-component-overview md-card.state md-card-title`));
    const btnStop = element(by.cssContainingText(`app-petals-component-overview button`, `Stop`));
    const btnStart = element(by.cssContainingText(`app-petals-component-overview button`, `Start`));
    const btnUnload = element(by.cssContainingText(`app-petals-component-overview button`, `Unload`));

    // the component exists and should be present in petals tree
    expect(page.getWorkspaceTreeByName(`Comp 0`).first().isPresent()).toBe(true);

    page.getWorkspaceTreeByName('Comp 0').click();

    btnStop.click();
    expect(stateElem.getText()).toEqual('Stopped');
    expect(btnStop.isPresent()).toBe(false);
    expect(btnStart.isEnabled()).toBe(true);
    // as the comp 0 still have 2 SUs (SU 0, SU 1), we can't unload it yet
    expect(btnUnload.isEnabled()).toBe(false);

    btnStart.click();
    expect(stateElem.getText()).toEqual('Started');
    expect(btnStop.isEnabled()).toBe(true);
    expect(btnStart.isPresent()).toBe(false);
    expect(btnUnload.isPresent()).toBe(false);

    btnStop.click();

    // unload the 2 SU
    page.getWorkspaceTreeByName('SU 0').click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Unload`)).click();
    element(by.css(`simple-notification`)).click();

    page.getWorkspaceTreeByName('SU 1').click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Unload`)).click();
    element(by.css(`simple-notification`)).click();

    // we should now be able to unload the comp 0
    page.getWorkspaceTreeByName('Comp 0').click();
    expect(btnStop.isPresent()).toBe(false);
    expect(btnStart.isEnabled()).toBe(true);
    expect(btnUnload.isEnabled()).toBe(true);

    // once unloaded ...
    btnUnload.click();
    element(by.css(`simple-notification`)).click();

    // we should be redirected to the workspace page ...
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    // and the component should have been deleted from petals tree
    expect(page.getWorkspaceTreeByName(`Comp 0`).first().isPresent()).toBe(false);
  });

  it(`should deploy a service-unit`, () => {
    page.getWorkspaceTreeByName('Comp 0').click();

    const chooseFileBtn = element(by.css(`app-petals-component-overview .deploy .choose-file`));
    const fileInput = element(by.css(`app-petals-component-overview .deploy input[type="file"]`));
    const selectedFile = element(by.css(`app-petals-component-overview .deploy .selected-file .file-name`));
    const changeSuNameInput = element(by.css(`app-petals-component-overview .deploy form input[name="serviceUnitName"]`));
    const deployBtn = element(by.css(`app-petals-component-overview .deploy form button[type="submit"]`));
    const filePath = path.resolve(__dirname, './resources/su.zip');
    const simpleNotification = element(by.css(`simple-notification`));

    expect(chooseFileBtn.getText()).toEqual(`Choose a file to upload`);
    // simulate the file selection
    fileInput.sendKeys(filePath);

    // once the file is selected, check that the other part of the form is displayed
    expect(selectedFile.isDisplayed()).toBe(true);
    expect(selectedFile.getText()).toEqual(`su.zip`);
    expect(chooseFileBtn.getText()).toEqual(`Change the file`);

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
    deployBtn.click();

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

    browser.wait(EC.visibilityOf(simpleNotification), 3000);
    expect(element(by.css(`simple-notification .sn-title`)).getText()).toEqual(`SU deployed`);
    expect(element(by.css(`simple-notification .sn-content`)).getText()).toEqual('"su" has been deployed');
  });
});
