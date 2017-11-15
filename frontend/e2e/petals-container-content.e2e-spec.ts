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
import { NotFoundPage } from './pages/not-found';
import { WorkspacePage } from './pages/workspace.po';

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

    cont
      .getInfoContainerReachabilitiesMessage()
      .expectToBe('info', `Click on a container to see its parameters.`);
  });

  describe('Deploy component', () => {
    it('should have a correct component deployment form', () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getComponentUpload();

      const filePath = path.resolve(__dirname, './resources/component.zip');
      deploy.fileInput.sendKeys(filePath);

      expect(deploy.fileName.getText()).toEqual(`component.zip`);

      expect(deploy.deployButton.getText()).toMatch(`Upload`);
      expect(deploy.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the component deployment fails`, () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getComponentUpload();

      expect(deploy.getErrorDeployMessage().content.isPresent()).toBe(false);

      const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
      deploy.fileInput.sendKeys(filePath);

      // shouldn't be able to find the component's name from the zip
      expect(deploy.nameInput.getAttribute('value')).toEqual('');
      page.expectNotification(
        'File error',
        `An error occurred while trying to read the component's name from zip file`
      );

      const error = deploy.getErrorDeployMessage();

      error.expectHidden();

      // deploy the component
      page.clickAndExpectNotification(
        deploy.deployButton,
        'Component Deployment Failed',
        'An error occurred while deploying error-deploy.zip'
      );

      error.expectToBe(
        'error',
        `[Mock message] An error happened when trying to deploy the component`
      );
    });

    it(`should deploy a component`, () => {
      const upload = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getComponentUpload();

      const filePath = path.resolve(
        __dirname,
        './resources/petals-zip/components/petals-bc-jms-2.0.zip'
      );
      upload.fileInput.sendKeys(filePath);

      // should be able to find the component's name from the zip
      expect(upload.nameInput.getAttribute('value')).toEqual(
        'petals-component'
      );

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

      // deploy the component
      page.clickAndExpectNotification(
        upload.deployButton,
        'Component Deployed',
        'component has been successfully deployed'
      );

      // check that the component is now added to the tree and that we've been redirected to it
      const expectedTreeAfterDeploy = [
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
        // this one should have been deployed
        `petals-component`,
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

      expect(workspace.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

      // we should be redirected
      const ops = workspace.openComponent('petals-component').openOperations();

      expect(ops.state.getText()).toEqual('Loaded');

      expect(
        ops.lifecycleInfo.$('.component-parameters-title span').getText()
      ).toEqual('Component parameters');
      expect(ops.parameters.$$('input').count()).toBe(3);
      expect(ops.parameter('httpsEnabled').getAttribute('value')).toEqual(
        'false'
      );
      expect(ops.parameter('httpPort').getAttribute('value')).toEqual('8080');
      expect(
        ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
      ).toEqual('10');

      expect(ops.installButton.isEnabled()).toBe(true);
      expect(ops.unloadButton.isEnabled()).toBe(true);
    });
  });

  describe('Deploy service assembly', () => {
    it('should have a correct service-assembly deployment form', () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getServiceAssemblyUpload();

      const filePath = path.resolve(__dirname, './resources/sa.zip');
      deploy.fileInput.sendKeys(filePath);

      expect(deploy.fileName.getText()).toEqual(`sa.zip`);

      expect(deploy.deployButton.getText()).toMatch(`Upload`);
      expect(deploy.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the service-assembly deployment fails`, () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getServiceAssemblyUpload();

      expect(deploy.getErrorDeployMessage().content.isPresent()).toBe(false);

      const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
      deploy.fileInput.sendKeys(filePath);

      const error = deploy.getErrorDeployMessage();

      error.expectHidden();

      // deploy the service-assembly
      page.clickAndExpectNotification(
        deploy.deployButton,
        'Service Assembly Deployment Failed',
        'An error occurred while deploying error-deploy.zip'
      );

      error.expectToBe(
        'error',
        `[Mock message] An error happened when trying to deploy the service-assembly`
      );
    });

    it(`should deploy a service-assembly`, () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getServiceAssemblyUpload();

      const filePath = path.resolve(__dirname, './resources/sa.zip');
      deploy.fileInput.sendKeys(filePath);

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

      // deploy the component
      page.clickAndExpectNotification(
        deploy.deployButton,
        'Service Assembly Deployed',
        'SA 12 has been successfully deployed'
      );

      // check that the component is now added to the tree and that we've been redirected to it
      const expectedTreeAfterDeploy = [
        `Bus 0`,
        `Cont 0`,
        `COMPONENTS`,
        `Comp 0`,
        `SU 0`,
        `SU 2`,
        `SU 16`, // <-- added
        `Comp 1`,
        `SU 1`,
        `SU 3`,
        `SU 17`, // <-- added
        `Comp 2`,
        `SERVICE ASSEMBLIES`,
        `SA 0`,
        `SA 1`,
        `SA 2`,
        `SA 12`, // <-- added
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

      // we should get redirected
      const sa = workspace.openServiceAssembly('SA 12');

      expect(sa.state.getText()).toEqual('Shutdown');

      expect(sa.serviceUnits.getText()).toEqual([
        'SU 16',
        'Comp 0',
        'SU 17',
        'Comp 1',
      ]);
    });
  });

  describe('Deploy shared library', () => {
    it('should have a correct shared library deployment form', () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getSharedLibraryUpload();

      expect(deploy.chooseFileButton.getText()).toEqual(
        `Choose a file to upload`
      );
      const filePath = path.resolve(__dirname, './resources/sl.zip');
      deploy.fileInput.sendKeys(filePath);

      expect(deploy.fileName.getText()).toEqual(`sl.zip`);

      expect(deploy.deployButton.getText()).toMatch(`Upload`);
      expect(deploy.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the shared library deployment fails`, () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getSharedLibraryUpload();

      expect(deploy.getErrorDeployMessage().content.isPresent()).toBe(false);

      const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
      deploy.fileInput.sendKeys(filePath);

      const error = deploy.getErrorDeployMessage();

      error.expectHidden();

      // deploy the service-assembly
      page.clickAndExpectNotification(
        deploy.deployButton,
        'Shared Library Deployment Failed',
        'An error occurred while deploying error-deploy.zip'
      );

      error.expectToBe(
        'error',
        `[Mock message] An error happened when trying to deploy the shared library`
      );
    });

    it(`should deploy a shared library`, () => {
      const deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getSharedLibraryUpload();

      const filePath = path.resolve(
        __dirname,
        './resources/petals-zip/shared-libraries/petals-sl-saxonhe-9.6.0.6.zip'
      );
      deploy.fileInput.sendKeys(filePath);

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

      // deploy the component
      page.clickAndExpectNotification(
        deploy.deployButton,
        'Shared Library Deployed',
        'SL 4 has been successfully deployed'
      );

      // check that the component is now added to the tree and that we've been redirected to it
      const expectedTreeAfterDeploy = [
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
        `SL 4`, // <-- added
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

      // we should get redirected
      const sl = workspace.openSharedLibrary('SL 4');
      expect(sl.title.getText()).toEqual('SL 4');

      sl
        .getInfoSlNoComponent()
        .expectToBe('info', `This shared library isn't used by any component.`);
    });
  });
});
