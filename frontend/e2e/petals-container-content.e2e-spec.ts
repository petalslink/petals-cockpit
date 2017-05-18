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
import { WorkspacePage } from './pages/workspace.po';
import { ComponentOverviewPage } from './pages/component.po';

describe(`Petals container content`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace('admin', 'admin');
  });

  it(`should open the content page`, () => {
    const cont = workspace.openContainer('Cont 0');

    expect(cont.title.getText()).toEqual('Cont 0');

    expect(cont.ip.getText()).toEqual('192.168.0.0');
    expect(cont.port.getText()).toEqual('7700');
    expect(cont.reachabilities.count()).toBe(1);
    expect(cont.reachabilities.get(0).getText()).toEqual('Cont 1');
    expect(cont.systemInfo.getText()).toEqual([
      'Petals ESB µKernel 4.0.2 Petals Standalone Shared Memory 4.0.2 OpenJDK',
      'Runtime Environment 1.7.0_111-b01 Oracle Corporation Linux 3.16.0-4-amd64 amd64'
    ].join(' '));
  });

  it(`should navigate to another container of the bus`, () => {
    const cont = workspace.openContainer('Cont 0');

    expect(cont.title.getText()).toEqual('Cont 0');

    const cont2 = cont.openReachability(0);

    expect(cont2.title.getText()).toEqual('Cont 1');
  });

  it('should have a correct component deployment form', () => {
    const ops = workspace.openContainer('Cont 0').openOperations();

    expect(ops.chooseFileButton.getText()).toEqual(`Choose a file to upload`);
    ops.fileInput.sendKeys('/test.zip');

    expect(ops.selectedFile.isDisplayed()).toBe(true);
    expect(ops.selectedFile.getText()).toEqual(`test.zip`);
    expect(ops.chooseFileButton.getText()).toEqual(`Change the file`);

    expect(ops.deployButton.getText()).toMatch(`Deploy`);
    expect(ops.deployButton.isEnabled()).toBe(true);
  });

  it(`should show a detailed error if the component deployment fails`, () => {
    const ops = workspace.openContainer('Cont 0').openOperations();

    const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
    ops.fileInput.sendKeys(filePath);

    // deploy the component
    page.clickAndExpectNotification(
      ops.deployButton,
      'Deploy component failed',
      'An error occurred when trying to deploy the file "error-deploy.zip"'
    );

    expect(ops.errorDetailsTitle.getText()).toEqual('An error occurred:');
    expect(ops.errorDetailsMessage.getText()).toEqual('[Mock message] An error happened when trying to deploy the component');
  });

  it(`should deploy a component`, () => {
    const ops = workspace.openContainer('Cont 0').openOperations();

    const filePath = path.resolve(__dirname, './resources/component.zip');
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

    // deploy the component
    page.clickAndExpectNotification(ops.deployButton, 'Component deployed', '"component" has been deployed');

    // check that the component is now added to the tree and that we've been redirected to it
    const expectedTreeAfterDeploy = [
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
      // this one should have been deployed
      `component`,
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

    // we should get redirected
    const comp = ComponentOverviewPage.waitAndGet();

    expect(comp.state.getText()).toEqual('Loaded');

    expect(comp.parameters.$('h3').getText()).toEqual('Install parameters');
    expect(comp.parameters.$$('input').count()).toBe(2);
    expect(comp.parameter('http-port').getAttribute('value')).toEqual('8080');
    expect(comp.parameter('enable-https').getAttribute('value')).toEqual('false');

    expect(comp.installButton.isEnabled()).toBe(true);
    expect(comp.unloadButton.isEnabled()).toBe(true);
  });
});
