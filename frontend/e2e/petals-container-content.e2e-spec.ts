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
import { ServiceAssemblyOverviewPage } from './pages/service-assembly.po';
import { NotFoundPage } from './pages/not-found';

describe(`Petals container content`, () => {
  it(`should open the 404 page if the container doesn't exists`, () => {
    page
      .goToViaLogin('/workspaces/idWks0/petals/containers/unknownIdCont')
      .loginNoCheck('admin', 'admin');

    NotFoundPage.waitAndGet();
  });
});

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

    expect(cont.systemInfo.getText()).toEqual(
      [
        'Petals ESB µKernel 4.0.2 Petals Standalone Shared Memory 4.0.2 OpenJDK',
        'Runtime Environment 1.7.0_111-b01 Oracle Corporation Linux 3.16.0-4-amd64 amd64',
      ].join(' ')
    );
  });

  describe('Deploy component', () => {
    it('should have a correct component deployment form', () => {
      const upload = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getComponentUpload();

      expect(upload.chooseFileName.getText()).toEqual(
        `CHOOSE A FILE TO UPLOAD`
      );
      upload.fileInput.sendKeys('/test.zip');

      expect(upload.fileNameInput.isPresent()).toBe(false);
      expect(upload.fileName.getText()).toEqual(`test.zip`);
      expect(upload.changeFileName.getText()).toEqual(`CHANGE THE FILE`);

      expect(upload.deployButton.getText()).toMatch(`DEPLOY`);
      expect(upload.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the component deployment fails`, () => {
      const upload = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getComponentUpload();

      const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
      upload.fileInput.sendKeys(filePath);

      // deploy the component
      page.clickAndExpectNotification(
        upload.deployButton,
        'Deploy component failed',
        'An error occurred when trying to deploy the file "error-deploy.zip"'
      );

      expect(upload.errorTitle.getText()).toEqual('An error occurred:');
      expect(upload.errorMsg.getText()).toEqual(
        '[Mock message] An error happened when trying to deploy the component'
      );
    });

    it(`should deploy a component`, () => {
      const upload = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getComponentUpload();

      const filePath = path.resolve(__dirname, './resources/component.zip');
      upload.fileInput.sendKeys(filePath);

      const expectedTreeBeforeDeploy = [
        `Bus 0`,
        `Cont 0`,
        `SA 0`,
        `SA 1`,
        `SA 2`,
        `SL 0`,
        `Comp 0`,
        `SU 0`,
        `SU 2`,
        `Comp 1`,
        `SU 1`,
        `SU 3`,
        `Comp 2`,
        `Cont 1`,
        `SA 3`,
        `SA 4`,
        `SA 5`,
        `SL 1`,
        `Comp 3`,
        `SU 4`,
        `SU 6`,
        `Comp 4`,
        `SU 5`,
        `SU 7`,
        `Comp 5`,
      ];

      expect(workspace.getWorkspaceTree()).toEqual(expectedTreeBeforeDeploy);

      // make sure we can't change the name of the component we want to deploy
      expect(upload.fileNameInput.isPresent()).toBe(false);

      // deploy the component
      page.clickAndExpectNotification(
        upload.deployButton,
        'Component deployed',
        '"component" has been deployed'
      );

      // check that the component is now added to the tree and that we've been redirected to it
      const expectedTreeAfterDeploy = [
        `Bus 0`,
        `Cont 0`,
        `SA 0`,
        `SA 1`,
        `SA 2`,
        `SL 0`,
        `Comp 0`,
        `SU 0`,
        `SU 2`,
        `Comp 1`,
        `SU 1`,
        `SU 3`,
        `Comp 2`,
        // this one should have been deployed
        `component`,
        `Cont 1`,
        `SA 3`,
        `SA 4`,
        `SA 5`,
        `SL 1`,
        `Comp 3`,
        `SU 4`,
        `SU 6`,
        `Comp 4`,
        `SU 5`,
        `SU 7`,
        `Comp 5`,
      ];

      expect(workspace.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

      // we should be redirected
      const ops = ComponentOverviewPage.waitAndGet().openOperations();

      expect(ops.state.getText()).toEqual('Loaded');

      expect(
        ops.lifecycleCard.$('.component-parameters span').getText()
      ).toEqual('Install parameters');
      expect(ops.parameters.$$('input').count()).toBe(2);
      expect(ops.parameter('http-port').getAttribute('value')).toEqual('8080');
      expect(ops.parameter('enable-https').getAttribute('value')).toEqual(
        'false'
      );

      expect(ops.installButton.isEnabled()).toBe(true);
      expect(ops.unloadButton.isEnabled()).toBe(true);
    });
  });

  describe('Deploy service assembly', () => {
    it('should have a correct service-assembly deployment form', () => {
      const upload = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getServiceAssemblyUpload();

      expect(upload.chooseFileName.getText()).toEqual(
        `CHOOSE A FILE TO UPLOAD`
      );
      upload.fileInput.sendKeys('/test.zip');

      expect(upload.fileNameInput.isPresent()).toBe(false);
      expect(upload.fileName.getText()).toEqual(`test.zip`);
      expect(upload.changeFileName.getText()).toEqual(`CHANGE THE FILE`);

      expect(upload.deployButton.getText()).toMatch(`DEPLOY`);
      expect(upload.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the service-assembly deployment fails`, () => {
      const upload = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getServiceAssemblyUpload();

      const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
      upload.fileInput.sendKeys(filePath);

      // deploy the service-assembly
      page.clickAndExpectNotification(
        upload.deployButton,
        'Deploy service-assembly failed',
        'An error occurred when trying to deploy the file "error-deploy.zip"'
      );

      expect(upload.errorTitle.getText()).toEqual('An error occurred:');
      expect(upload.errorMsg.getText()).toEqual(
        '[Mock message] An error happened when trying to deploy the service-assembly'
      );
    });

    it(`should deploy a service-assembly`, () => {
      const upload = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getServiceAssemblyUpload();

      const filePath = path.resolve(__dirname, './resources/sa.zip');
      upload.fileInput.sendKeys(filePath);

      const expectedTreeBeforeDeploy = [
        `Bus 0`,
        `Cont 0`,
        `SA 0`,
        `SA 1`,
        `SA 2`,
        `SL 0`,
        `Comp 0`,
        `SU 0`,
        `SU 2`,
        `Comp 1`,
        `SU 1`,
        `SU 3`,
        `Comp 2`,
        `Cont 1`,
        `SA 3`,
        `SA 4`,
        `SA 5`,
        `SL 1`,
        `Comp 3`,
        `SU 4`,
        `SU 6`,
        `Comp 4`,
        `SU 5`,
        `SU 7`,
        `Comp 5`,
      ];

      expect(workspace.getWorkspaceTree()).toEqual(expectedTreeBeforeDeploy);

      // make sure we can't change the name of the component we want to deploy
      expect(upload.fileNameInput.isPresent()).toBe(false);

      // deploy the component
      page.clickAndExpectNotification(
        upload.deployButton,
        'SA deployed',
        '"SA 12" has been deployed'
      );

      // check that the component is now added to the tree and that we've been redirected to it
      const expectedTreeAfterDeploy = [
        `Bus 0`,
        `Cont 0`,
        `SA 0`,
        `SA 1`,
        `SA 2`,
        `SA 12`, // <-- added
        `SL 0`,
        `Comp 0`,
        `SU 0`,
        `SU 2`,
        `SU 16`, // <-- added
        `Comp 1`,
        `SU 1`,
        `SU 3`,
        `SU 17`, // <-- added
        `Comp 2`,
        `Cont 1`,
        `SA 3`,
        `SA 4`,
        `SA 5`,
        `SL 1`,
        `Comp 3`,
        `SU 4`,
        `SU 6`,
        `Comp 4`,
        `SU 5`,
        `SU 7`,
        `Comp 5`,
      ];

      expect(workspace.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

      // we should get redirected
      const sa = ServiceAssemblyOverviewPage.waitAndGet();

      expect(sa.state.getText()).toEqual('Shutdown');

      expect(sa.serviceUnits.getText()).toEqual(['SU 16', 'SU 17']);
      expect(sa.suComponents.getText()).toEqual(['Comp 0', 'Comp 1']);
    });
  });
});
