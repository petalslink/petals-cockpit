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
import { browser } from 'protractor';
import * as path from 'path';

import { page } from './common';
import { WorkspacePage } from './pages/workspace.po';
import { ServiceUnitOverviewPage } from './pages/service-unit.po';
import { ComponentOverviewPage } from './pages/component.po';

describe(`Petals component content`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace(`admin`, `admin`);
  });

  it(`should open the content page`, () => {
    const comp = workspace.openComponent('Comp 0');

    expect(comp.title.getText()).toEqual('Comp 0');
    expect(comp.state.getText()).toEqual('Started');
    expect(comp.type.getText()).toEqual('BC');
  });

  it(`should stop/start/stop/unload a component`, () => {
    let comp = workspace.openComponent('Comp 0');

    comp.stopButton.click();
    expect(comp.state.getText()).toEqual('Stopped');
    expect(comp.stopButton.isPresent()).toBe(false);
    expect(comp.startButton.isEnabled()).toBe(true);
    expect(comp.installButton.isPresent()).toBe(false);
    // as the comp 0 still have 2 SUs (SU 0, SU 1), we can't unload it yet
    expect(comp.uninstallButton.isEnabled()).toBe(false);
    expect(comp.unloadButton.isEnabled()).toBe(false);

    comp.startButton.click();
    expect(comp.state.getText()).toEqual('Started');
    expect(comp.stopButton.isEnabled()).toBe(true);
    expect(comp.startButton.isPresent()).toBe(false);
    expect(comp.unloadButton.isPresent()).toBe(false);
    expect(comp.installButton.isPresent()).toBe(false);
    expect(comp.uninstallButton.isPresent()).toBe(false);

    comp.stopButton.click();

    // unload the 2 SU
    const sa0 = workspace.openServiceAssembly('SA 0').openOperations();
    page.waitAndClick(sa0.stopButton);
    page.clickAndExpectNotification(sa0.unloadButton);

    const sa1 = workspace.openServiceAssembly('SA 1').openOperations();
    page.waitAndClick(sa1.stopButton);
    page.clickAndExpectNotification(sa1.unloadButton);

    const sa4 = workspace.openServiceAssembly('SA 4').openOperations();
    page.waitAndClick(sa4.stopButton);
    page.clickAndExpectNotification(sa4.unloadButton);

    // we should now be able to unload the comp 0
    comp = workspace.openComponent('Comp 0');

    expect(comp.state.getText()).toEqual('Stopped');
    expect(comp.stopButton.isPresent()).toBe(false);
    expect(comp.startButton.isEnabled()).toBe(true);
    expect(comp.installButton.isPresent()).toBe(false);
    expect(comp.uninstallButton.isEnabled()).toBe(true);
    expect(comp.unloadButton.isEnabled()).toBe(true);

    // uninstall
    comp.uninstallButton.click();
    expect(comp.state.getText()).toEqual('Loaded');
    expect(comp.stopButton.isPresent()).toBe(false);
    expect(comp.startButton.isPresent()).toBe(false);
    expect(comp.installButton.isEnabled()).toBe(true);
    expect(comp.uninstallButton.isPresent()).toBe(false);
    expect(comp.unloadButton.isEnabled()).toBe(true);

    // install
    comp.installButton.click();
    expect(comp.state.getText()).toEqual('Shutdown');
    expect(comp.stopButton.isPresent()).toBe(false);
    expect(comp.startButton.isEnabled()).toBe(true);
    expect(comp.installButton.isPresent()).toBe(false);
    expect(comp.uninstallButton.isEnabled()).toBe(true);
    expect(comp.unloadButton.isEnabled()).toBe(true);

    comp.uninstallButton.click();

    // once unloaded ...
    page.clickAndExpectNotification(comp.unloadButton);

    // we should be redirected to the workspace page ...
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    // and the component should have been deleted from petals tree
    expect(workspace.treeElement(`Comp 0`, 'component').isPresent()).toBe(false);
  });

  it('should have a correct SU deployment form', () => {
    const ops = workspace.openComponent('Comp 0').openOperations();

    expect(ops.chooseFileButton.getText()).toEqual(`Choose a file to upload`);
    ops.fileInput.sendKeys('/test.zip');

    expect(ops.selectedFile.isDisplayed()).toBe(true);
    expect(ops.selectedFile.getText()).toEqual(`test.zip`);
    expect(ops.chooseFileButton.getText()).toEqual(`Change the file`);

    expect(ops.changeSuNameInput.getAttribute('value')).toEqual(`test`);

    expect(ops.deployButton.getText()).toMatch(`Deploy`);
    expect(ops.deployButton.isEnabled()).toBe(true);
  });

  it(`should show a detailed error if the SU deployment fails`, () => {
    const ops = workspace.openComponent('Comp 0').openOperations();

    const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
    ops.fileInput.sendKeys(filePath);

    // deploy the component
    page.clickAndExpectNotification(
      ops.deployButton,
      'Deploy Service-Unit failed',
      'An error occurred when trying to deploy the file "error-deploy.zip"'
    );

    expect(ops.errorDetailsTitle.getText()).toEqual('An error occurred:');
    expect(ops.errorDetailsMessage.getText()).toEqual('[Mock message] An error happened when trying to deploy the service-unit');
  });

  it(`should deploy a service-unit`, () => {
    const ops = workspace.openComponent('Comp 0').openOperations();

    const filePath = path.resolve(__dirname, './resources/su.zip');
    ops.fileInput.sendKeys(filePath);

    const expectedTreeBeforeDeploy = [
      `Bus 0`,
      `Cont 0`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `SA 3`,
      `SA 4`,
      `Comp 0`,
      `SU 0`,
      `SU 1`,
      `SU 4`,
      `Comp 1`,
      `SU 2`,
      `SU 3`,
      `SU 5`,
      `Cont 1`,
      `SA 5`,
      `SA 6`,
      `SA 7`,
      `SA 8`,
      `SA 9`,
      `Comp 2`,
      `SU 6`,
      `SU 7`,
      `SU 10`,
      `Comp 3`,
      `SU 8`,
      `SU 9`,
      `SU 11`
    ];

    expect(workspace.getWorkspaceTree()).toEqual(expectedTreeBeforeDeploy);

    // deploy the service-unit
    page.clickAndExpectNotification(ops.deployButton, 'SU deployed', '"su" has been deployed');

    // check that the service-unit is now added to the tree and that we've been redirected to it
    const expectedTreeAfterDeploy = [
      `Bus 0`,
      `Cont 0`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `SA 3`,
      `SA 4`,
      `sa-su`,
      `Comp 0`,
      `SU 0`,
      `SU 1`,
      `SU 4`,
      // this one should have been deployed
      `su`,
      `Comp 1`,
      `SU 2`,
      `SU 3`,
      `SU 5`,
      `Cont 1`,
      `SA 5`,
      `SA 6`,
      `SA 7`,
      `SA 8`,
      `SA 9`,
      `Comp 2`,
      `SU 6`,
      `SU 7`,
      `SU 10`,
      `Comp 3`,
      `SU 8`,
      `SU 9`,
      `SU 11`
    ];

    expect(workspace.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

    // we should get redirected after
    ServiceUnitOverviewPage.waitAndGet();
  });

  it(`should display an error if component change state (install) fails`, () => {
    // deploy a component (already tested in containers E2E tests)
    const cont = workspace.openContainer('Cont 0').openOperations();

    const filePath = path.resolve(__dirname, './resources/component.zip');
    cont.fileInput.sendKeys(filePath);
    page.clickAndExpectNotification(cont.deployButton, 'Component deployed', '"component" has been deployed');

    // we should be redirected
    const comp = ComponentOverviewPage.waitAndGet();

    // change state to install with some parameters (with error in http-port to make it fail)
    const inputHttpPort = comp.parameter('http-port');
    const inputEnableHttps = comp.parameter('enable-https');

    inputHttpPort.sendKeys('error');
    comp.installButton.click();

    // check if the error is displayed
    expect(comp.changeStateError.getText())
      .toEqual(`[Mock message] An error happened when trying to change the state of that component`);

    // make sure the form isn't reset
    expect(inputHttpPort.getAttribute('value')).toEqual(`8080error`);
    expect(inputEnableHttps.getAttribute('value')).toEqual(`false`);
  });
});
