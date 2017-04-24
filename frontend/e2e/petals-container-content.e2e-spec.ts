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

describe(`Petals container content`, () => {
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
    page.getWorkspaceTreeByName('Cont 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/);

    const pageTitle = element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText();
    expect(pageTitle).toEqual('Cont 0');

    const ip = element(by.css(`app-petals-container-overview md-card.ip md-card-title`)).getText();
    const port = element(by.css(`app-petals-container-overview md-card.port md-card-title`)).getText();
    const reachability = element(by.css(`app-petals-container-overview md-card.reachability md-card-title`)).getText();
    const systemInfo = element(by.css(`app-petals-container-overview md-card.system-info`)).getText();

    expect(ip).toEqual('192.168.0.0');
    expect(port).toEqual('7700');
    expect(reachability).toEqual('Cont 1');
    expect(systemInfo).toEqual([
      'Petals ESB µKernel 4.0.2 Petals Standalone Shared Memory 4.0.2 OpenJDK',
      'Runtime Environment 1.7.0_111-b01 Oracle Corporation Linux 3.16.0-4-amd64 amd64'
    ].join(' '));
  });

  it(`should navigate to another container of the bus`, () => {
    page.getWorkspaceTreeByName('Cont 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/);

    expect(element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText()).toEqual('Cont 0');

    element(by.css(`app-petals-container-overview md-card.reachability`)).click();

    expect(element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText()).toEqual('Cont 1');
  });

  it(`should deploy a component`, () => {
    page.getWorkspaceTreeByName('Cont 0').click();

    element(by.cssContainingText(`app-petals-container-view md-tab-header .mat-tab-label`, 'Operations')).click();

    const chooseFileBtn = element(by.css(`app-petals-container-operations .deploy .choose-file`));
    const fileInput = element(by.css(`app-petals-container-operations .deploy input[type="file"]`));
    const selectedFile = element(by.css(`app-petals-container-operations .deploy .selected-file .file-name`));
    const deployBtn = element(by.css(`app-petals-container-operations .deploy form button[type="submit"]`));
    const filePath = path.resolve(__dirname, './resources/component.zip');

    browser.wait(EC.elementToBeClickable(chooseFileBtn), 3000);

    // component
    const btnStart = element(by.cssContainingText(`app-petals-component-overview button`, `Start`));
    const btnInstall = element(by.cssContainingText(`app-petals-component-overview button`, `Install`));
    const btnUnload = element(by.cssContainingText(`app-petals-component-overview button`, `Unload`));

    expect(chooseFileBtn.getText()).toEqual(`Choose a file to upload`);
    // simulate the file selection
    fileInput.sendKeys(filePath);

    // once the file is selected, check that the other part of the form is displayed
    expect(selectedFile.isDisplayed()).toBe(true);
    expect(selectedFile.getText()).toEqual(`component.zip`);
    expect(chooseFileBtn.getText()).toEqual(`Change the file`);

    expect(deployBtn.getText()).toMatch(`Deploy`);
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

    // deploy the component
    page.clickAndExpectNotification(deployBtn, 'Component deployed', '"component" has been deployed');

    // check that the component is now added to the tree and that we've been redirected to it
    const expectedTreeAfterDeploy = [
      `Bus 0`,
        `Cont 0`,
          `Comp 0`,
            `SU 0`,
            `SU 1`,
          `Comp 1`,
            `SU 2`,
            `SU 3`,
          // this one should have been deployed
          `component`,
        `Cont 1`,
          `Comp 2`,
            `SU 4`,
            `SU 5`,
          `Comp 3`,
            `SU 6`,
            `SU 7`
    ];

    expect(page.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/components\/\w+/);

    const state = element(by.css(`app-petals-component-overview md-card.state md-card-title`)).getText();
    expect(state).toEqual('Loaded');

    const parametersTitle = element(by.css(`app-petals-component-overview .parameters h3`));
    const parametersFormInputs = element.all(by.css(`app-petals-component-overview .parameters form input`));

    expect(parametersTitle.isDisplayed()).toBe(true);
    expect(parametersTitle.getText()).toEqual('Install parameters');

    expect(parametersFormInputs.get(0).getAttribute('placeholder')).toEqual('http-port');
    expect(parametersFormInputs.get(1).getAttribute('placeholder')).toEqual('enable-https');

    expect(parametersFormInputs.get(0).getAttribute('value')).toEqual('8080');
    expect(parametersFormInputs.get(1).getAttribute('value')).toEqual('false');

    expect(btnStart.isEnabled()).toBe(true);
    expect(btnInstall.isEnabled()).toBe(true);
    expect(btnUnload.isEnabled()).toBe(true);
  });
});
