/**
 * Copyright (C) 2017-2019 Linagora
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
import {
  ComponentDeploymentPage,
  ServiceAssemblyDeploymentPage,
  SharedLibraryDeploymentPage,
} from './pages/upload-component.po';
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

  // TODO: test inconsistently failing
  // describe(`Unreachable container`, () => {
  //   let bus: BusPage;

  //   beforeEach(() => {
  //     bus = page
  //       .openWorkspaces()
  //       .selectWorkspace(1, 'Workspace 1')
  //       .openBus('Bus 3');
  //   });

  //   it(`should show a message saying that the container is unreachable`, () => {
  //     // open the container with name 'Cont 3'
  //     bus.openContainer(1, { shouldBeReachable: false });
  //   });

  //   it(`should hide (hover with opacity) other information than IP and PORT`, () => {
  //     const containerOperations = bus.openContainer(1).openOperations();

  //     containerOperations.getComponentUpload().expectHover();
  //     containerOperations.getServiceAssemblyUpload().expectHover();
  //     containerOperations.getSharedLibraryUpload().expectHover();
  //   });
  // });

  describe('Deploy component', () => {
    let deploy: ComponentDeploymentPage;
    beforeEach(() => {
      deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getComponentUpload();
    });

    it('should have a correct component deployment form', () => {
      deploy.selectFile(`./resources/component.zip`, `component.zip`, '');

      expect(deploy.deployButton.getText()).toMatch(`UPLOAD`);
      expect(deploy.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the component deployment fails`, () => {
      expect(deploy.getErrorDeployMessage().content.isPresent()).toBe(false);

      // shouldn't be able to find the component's name from the zip
      deploy.selectFile(`./resources/error-deploy.zip`, null, null);

      page.expectNotification(
        'File error',
        `An error occurred while trying to read the component name from this zip file`
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
      // should be able to find the component name from the zip
      deploy.selectFile(
        `./resources/petals-zip/components/petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip`,
        `petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip`,
        `petals-bc-sql`
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
        deploy.deployButton,
        'Component Deployed',
        'petals-bc-sql has been successfully deployed'
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
        `petals-bc-sql`,
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
      const ops = workspace.openComponent('petals-bc-sql').openOperations();

      expect(ops.state.getText()).toEqual('Loaded');

      expect(
        ops.lifecycleInfo.$('.component-parameters-title span').getText()
      ).toEqual('Component parameters');
      expect(ops.parameters.$$('input').count()).toBe(3);
      expect(ops.parameter('httpsEnabled').getAttribute('value')).toEqual(
        'false'
      );
      expect(ops.parameter('httpPort').getAttribute('value')).toEqual('8484');
      expect(
        ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
      ).toEqual('10');

      expect(ops.installButton.isEnabled()).toBe(true);
      expect(ops.unloadButton.isEnabled()).toBe(true);
    });

    it(`should show an info message if no SLs into a zip file`, () => {
      deploy.selectFile(
        `./resources/petals-zip/components/petals-bc-jms-2.0.zip`,
        `petals-bc-jms-2.0.zip`,
        `petals-bc-jms`
      );

      expect(deploy.detailsMessageReadZipFile.getText()).toEqual(
        `No shared libraries have been detected in this zip file.`
      );
      expect(deploy.sharedLibrariesInfo.count()).toEqual(0);
      expect(deploy.deployButton.isEnabled()).toBe(true);
    });

    it(`should not be able to upload an existing component`, () => {
      deploy.selectFile(
        `./resources/petals-zip/components/petals-bc-jms-2.0.zip`,
        `petals-bc-jms-2.0.zip`,
        `petals-bc-jms`
      );

      deploy.nameInput.clear().then(() => deploy.nameInput.sendKeys('Comp 0'));

      expect(deploy.deployButton.isEnabled()).toBe(false);
    });

    it(`should show a warning message if none of the SLs from a zip are into the current container`, () => {
      const filePath = path.resolve(
        __dirname,
        './resources/petals-zip/components/petals-bc-sql-1.6.3-SNAPSHOT.zip'
      );

      deploy.fileInput.sendKeys(filePath);

      expect(deploy.detailsMessageReadZipFile.getText()).toEqual(
        `Shared libraries with a red cross are not in this container.`
      );
      expect(deploy.sharedLibrariesInfo.count()).toEqual(2);
      expect(deploy.getSharedLibrariesDeployComponent()).toEqual([
        'clear\npetals-sl-hsql',
        'clear\npetals-sl-sqlserver-6.1.0.jre7',
      ]);
    });

    it(`should show a success message if all the sls from zip are into the current container`, () => {
      deploy.selectFile(
        `./resources/petals-zip/components/petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip`,
        `petals-bc-sql-1.6.3-SNAPSHOT-all-green.zip`,
        `petals-bc-sql`
      );

      expect(deploy.detailsMessageReadZipFile.getText()).toEqual(
        `All the shared libraries are in this container.`
      );
      expect(deploy.sharedLibrariesInfo.count()).toEqual(1);
      expect(deploy.getSharedLibrariesDeployComponent()).toEqual([
        'success\nSL 0',
      ]);
    });

    it(`should show a warning message if at least one of the SLs from zip is not into the current container`, () => {
      deploy.selectFile(
        `./resources/petals-zip/components/petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip`,
        `petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip`,
        `petals-bc-sql`
      );

      expect(deploy.detailsMessageReadZipFile.getText()).toEqual(
        `Shared libraries with a red cross are not in this container.`
      );
      expect(deploy.sharedLibrariesInfo.count()).toEqual(2);
      expect(deploy.getSharedLibrariesDeployComponent()).toEqual([
        'success\nSL 0',
        'clear\npetals-sl-sqlserver-6.1.0.jre7',
      ]);
    });
  });

  describe('Deploy service assembly', () => {
    let deploy: ServiceAssemblyDeploymentPage;
    beforeEach(() => {
      deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getServiceAssemblyUpload();
    });

    it('should have a correct service-assembly deployment form', () => {
      deploy.selectFile(`./resources/sa.zip`, 'sa.zip', '');

      expect(deploy.deployButton.getText()).toMatch(`UPLOAD`);
      expect(deploy.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the service-assembly deployment fails`, () => {
      expect(deploy.getErrorDeployMessage().content.isPresent()).toBe(false);

      // shouldn't be able to find the service assembly's name from the zip
      deploy.selectFile(`./resources/error-deploy.zip`, null, null);

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
      deploy.selectFile(
        `./resources/petals-zip/service-assemblies/sa-flowable-vacation-sample.zip`,
        '',
        ''
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
        deploy.deployButton,
        'Service Assembly Deployed',
        'sa-flowable-vacation-sample has been successfully deployed'
      );

      // check that the component is now added to the tree and that we've been redirected to it
      const expectedTreeAfterDeploy = [
        `Bus 0`,
        `Cont 0`,
        `COMPONENTS`,
        `Comp 0`,
        `SU 0`,
        `SU 2`,
        `su1-sa-flowable-vacation-sample`,
        `Comp 1`,
        `SU 1`,
        `SU 3`,
        `su2-sa-flowable-vacation-sample`,
        `Comp 2`,
        `SERVICE ASSEMBLIES`,
        `SA 0`,
        `SA 1`,
        `SA 2`,
        `sa-flowable-vacation-sample`,
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
      const sa = workspace.openServiceAssembly('sa-flowable-vacation-sample');

      expect(sa.state.getText()).toEqual('Shutdown');
      expect(sa.serviceUnits.getText()).toEqual([
        'su1-sa-flowable-vacation-sample',
        'Comp 0',
        'su2-sa-flowable-vacation-sample',
        'Comp 1',
      ]);
    });
  });

  describe('Deploy shared library', () => {
    let deploy: SharedLibraryDeploymentPage;
    beforeEach(() => {
      deploy = workspace
        .openContainer('Cont 0')
        .openOperations()
        .getSharedLibraryUpload();
    });

    it('should have a correct shared library deployment form', () => {
      expect(deploy.chooseFile.getText()).toEqual(`CHOOSE A FILE...`);

      deploy.selectFile(`./resources/sl.zip`, `sl.zip`, '', '');

      expect(deploy.deployButton.getText()).toMatch(`UPLOAD`);
      expect(deploy.deployButton.isEnabled()).toBe(true);
    });

    it(`should show a detailed error if the shared library deployment fails`, () => {
      expect(deploy.getErrorDeployMessage().content.isPresent()).toBe(false);

      // shouldn't be able to find the shared library's name from the zip
      deploy.selectFile(`./resources/error-deploy.zip`, '', '', '');

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
      deploy.selectFile(
        `./resources/petals-zip/shared-libraries/petals-sl-saxonhe-9.6.0.6.zip`,
        '',
        '',
        '1.0.1'
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

      // deploy the shared library
      page.clickAndExpectNotification(
        deploy.deployButton,
        'Shared Library Deployed',
        'petals-sl-saxonhe-9.6.0.6 has been successfully deployed'
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
        `petals-sl-saxonhe-9.6.0.6`,
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
      const sl = workspace.openSharedLibrary('petals-sl-saxonhe-9.6.0.6');
      expect(sl.title.getText()).toEqual('petals-sl-saxonhe-9.6.0.6');

      sl
        .getInfoSlNoComponent()
        .expectToBe('info', `This shared library isn't used by any component.`);
    });
  });
});
