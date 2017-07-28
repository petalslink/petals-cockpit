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

import * as path from 'path';

import { page } from './common';
import { ComponentOverviewPage } from './pages/component.po';
import { NotFoundPage } from './pages/not-found';
import { WorkspaceOverviewPage, WorkspacePage } from './pages/workspace.po';
import { waitAndClick } from './utils';

describe(`Petals component content`, () => {
  it(`should open the 404 page if the component doesn't exists`, () => {
    page
      .goToViaLogin('/workspaces/idWks0/petals/components/unknownIdComp')
      .loginNoCheck('admin', 'admin');

    NotFoundPage.waitAndGet();
  });
});

describe(`Petals component content`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace(`admin`, `admin`);
  });

  it(`should open the content page`, () => {
    const comp = workspace.openComponent('Comp 2');

    expect(comp.title.getText()).toEqual('Comp 2');
    expect(comp.state.getText()).toEqual('Started');
    expect(comp.type.getText()).toEqual('BC');

    expect(comp.sharedLibraries.getText()).toEqual([`SL 0`]);
  });

  it(`should stop/start/stop/unload a component`, () => {
    let ops = workspace.openComponent('Comp 0').openOperations();

    expect(ops.state.getText()).toEqual('Started');
    expect(ops.stopButton.isEnabled()).toBe(true);
    expect(ops.startButton.isPresent()).toBe(false);
    expect(ops.unloadButton.isPresent()).toBe(false);
    expect(ops.installButton.isPresent()).toBe(false);
    expect(ops.uninstallButton.isPresent()).toBe(false);

    ops.stopButton.click();
    expect(ops.state.getText()).toEqual('Stopped');
    expect(ops.stopButton.isPresent()).toBe(false);
    expect(ops.startButton.isEnabled()).toBe(true);
    expect(ops.installButton.isPresent()).toBe(false);
    // as the ops 0 still have 2 SUs (SU 0, SU 1), we can't unload it yet
    expect(ops.uninstallButton.isEnabled()).toBe(false);
    expect(ops.unloadButton.isEnabled()).toBe(false);

    ops.startButton.click();
    expect(ops.state.getText()).toEqual('Started');
    expect(ops.stopButton.isEnabled()).toBe(true);
    expect(ops.startButton.isPresent()).toBe(false);
    expect(ops.unloadButton.isPresent()).toBe(false);
    expect(ops.installButton.isPresent()).toBe(false);
    expect(ops.uninstallButton.isPresent()).toBe(false);

    ops.stopButton.click();

    // unload the 2 SU
    const sa0 = workspace.openServiceAssembly('SA 0').openOperations();
    waitAndClick(sa0.stopButton);
    page.clickAndExpectNotification(sa0.unloadButton);

    const sa2 = workspace.openServiceAssembly('SA 2').openOperations();
    waitAndClick(sa2.stopButton);
    page.clickAndExpectNotification(sa2.unloadButton);

    // we should now be able to unload the comp 0
    ops = workspace.openComponent('Comp 0').openOperations();

    expect(ops.state.getText()).toEqual('Stopped');
    expect(ops.stopButton.isPresent()).toBe(false);
    expect(ops.startButton.isEnabled()).toBe(true);
    expect(ops.installButton.isPresent()).toBe(false);
    expect(ops.uninstallButton.isEnabled()).toBe(true);
    expect(ops.unloadButton.isEnabled()).toBe(true);

    // uninstall
    ops.uninstallButton.click();
    expect(ops.state.getText()).toEqual('Loaded');
    expect(ops.stopButton.isPresent()).toBe(false);
    expect(ops.startButton.isPresent()).toBe(false);
    expect(ops.installButton.isEnabled()).toBe(true);
    expect(ops.uninstallButton.isPresent()).toBe(false);
    expect(ops.unloadButton.isEnabled()).toBe(true);

    expect(ops.getSUUpload().chooseFileButton.isEnabled()).toBe(false);

    // install
    ops.installButton.click();
    expect(ops.state.getText()).toEqual('Shutdown');
    expect(ops.stopButton.isPresent()).toBe(false);
    expect(ops.startButton.isEnabled()).toBe(true);
    expect(ops.installButton.isPresent()).toBe(false);
    expect(ops.uninstallButton.isEnabled()).toBe(true);
    expect(ops.unloadButton.isEnabled()).toBe(true);

    ops.uninstallButton.click();

    // once unloaded ...
    page.clickAndExpectNotification(ops.unloadButton);

    // we should be redirected to the workspace page ...
    WorkspaceOverviewPage.waitAndGet();

    // and the component should have been deleted from petals tree
    expect(workspace.treeElement(`Comp 0`, 'component').isPresent()).toBe(
      false
    );
  });

  it('should have a correct SU deployment form', () => {
    const deploy = workspace
      .openComponent('Comp 0')
      .openOperations()
      .getSUUpload();

    expect(deploy.chooseFileName.getText()).toEqual(`CHOOSE A FILE TO UPLOAD`);
    deploy.fileInput.sendKeys('/test.zip');

    expect(deploy.fileName.isDisplayed()).toBe(true);
    expect(deploy.fileName.getText()).toEqual(`test.zip`);
    expect(deploy.changeFileName.getText()).toEqual(`CHANGE THE FILE`);

    expect(deploy.fileNameInput.getAttribute('value')).toEqual(`test`);

    expect(deploy.deployButton.getText()).toMatch(`DEPLOY`);
    expect(deploy.deployButton.isEnabled()).toBe(true);
  });

  it(`should show a detailed error if the SU deployment fails`, () => {
    const deploy = workspace
      .openComponent('Comp 0')
      .openOperations()
      .getSUUpload();

    const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
    deploy.fileInput.sendKeys(filePath);

    // deploy the component
    page.clickAndExpectNotification(
      deploy.deployButton,
      'Service Unit Deployment Failed',
      'An error occurred while deploying error-deploy.zip'
    );

    expect(deploy.errorTitle.getText()).toEqual('An error occurred:');
    expect(deploy.errorMsg.getText()).toEqual(
      '[Mock message] An error happened when trying to deploy the service-unit'
    );
  });

  it(`should deploy a service-unit`, () => {
    const deploy = workspace
      .openComponent('Comp 0')
      .openOperations()
      .getSUUpload();

    const filePath = path.resolve(__dirname, './resources/su.zip');

    expect(deploy.fileNameInput.isPresent()).toBe(false);
    deploy.fileInput.sendKeys(filePath);
    expect(deploy.fileNameInput.isDisplayed()).toBe(true);

    const expectedTreeBeforeDeploy = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `SU 0`,
      `SU 2`,
      `Comp 1`,
      `SU 1`,
      `SU 3`,
      `Comp 2`,
      `SERVICE ASSEMBLIES`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      `SHARED LIBRARIES`,
      `SL 0`,
      `Cont 1`,
      `COMPONENTS`,
      `Comp 3`,
      `SU 4`,
      `SU 6`,
      `Comp 4`,
      `SU 5`,
      `SU 7`,
      `Comp 5`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
      `SHARED LIBRARIES`,
      `SL 1`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(expectedTreeBeforeDeploy);

    // deploy the service-unit
    page.clickAndExpectNotification(
      deploy.deployButton,
      'Service Unit Deployed',
      '"su" has been successfully deployed'
    );

    // check that the service-unit is now added to the tree and that we've been redirected to it
    const expectedTreeAfterDeploy = [
      `Bus 0`,
      `Cont 0`,
      `COMPONENTS`,
      `Comp 0`,
      `SU 0`,
      `SU 2`,
      // this one should have been deployed
      `su`,
      `Comp 1`,
      `SU 1`,
      `SU 3`,
      `Comp 2`,
      `SERVICE ASSEMBLIES`,
      `SA 0`,
      `SA 1`,
      `SA 2`,
      // the corresponding SA should have been added
      `sa-su`,
      `SHARED LIBRARIES`,
      `SL 0`,
      `Cont 1`,
      `COMPONENTS`,
      `Comp 3`,
      `SU 4`,
      `SU 6`,
      `Comp 4`,
      `SU 5`,
      `SU 7`,
      `Comp 5`,
      `SERVICE ASSEMBLIES`,
      `SA 3`,
      `SA 4`,
      `SA 5`,
      `SHARED LIBRARIES`,
      `SL 1`,
    ];

    expect(workspace.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

    workspace.openServiceUnit('su');
  });

  it(`should display an error if component change state (install) fails`, () => {
    // deploy a component (already tested in containers E2E tests)
    const deploy = workspace
      .openContainer('Cont 0')
      .openOperations()
      .getComponentUpload();

    const filePath = path.resolve(__dirname, './resources/component.zip');
    deploy.fileInput.sendKeys(filePath);
    page.clickAndExpectNotification(deploy.deployButton);

    const ops = workspace.openComponent('component').openOperations();

    // change state to install with some parameters (with error in http-port to make it fail)
    const inputHttpPort = ops.parameter('http-port');
    const inputEnableHttps = ops.parameter('enable-https');

    inputHttpPort.sendKeys('error');
    ops.installButton.click();

    // check if the error is displayed
    expect(ops.changeStateError.getText()).toEqual(
      `[Mock message] An error happened when trying to change the state of that component`
    );

    // make sure the form isn't reset
    expect(inputHttpPort.getAttribute('value')).toEqual(`8080error`);
    expect(inputEnableHttps.getAttribute('value')).toEqual(`false`);
  });
});
