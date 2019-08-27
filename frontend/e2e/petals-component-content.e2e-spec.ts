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

// import * as path from 'path';
// import { browser } from 'protractor/built';

// import { page } from './common';
// import { NotFoundPage } from './pages/not-found';
// import { WorkspacePage } from './pages/workspace.po';
// import { clearInput, waitAndClick } from './utils';

// describe(`Petals component content`, () => {
//   it(`should open the 404 page if the component doesn't exists`, () => {
//     page
//       .goToViaLogin('/workspaces/idWks0/petals/components/unknownIdComp')
//       .loginNoCheck('admin', 'admin');

//     NotFoundPage.waitAndGet();
//   });
// });

// describe(`Petals component content`, () => {
//   let workspace: WorkspacePage;

//   beforeEach(() => {
//     workspace = page.goToLogin().loginToWorkspace(`admin`, `admin`);
//   });

//   it(`should open the content page, check the state and related service-units in overview tab`, () => {
//     // we should get redirected to Comp 2
//     const comp2 = workspace.openComponent('Comp 2');

//     expect(comp2.title.getText()).toEqual('Comp 2');
//     expect(comp2.state.getText()).toEqual('Started');
//     expect(comp2.type.getText()).toEqual('BC');

//     expect(comp2.sharedLibraries.getText()).toEqual([`SL 0`]);

//     comp2
//       .getInfoNoSuMessage()
//       .expectToBe('info', `This component doesn't have any service unit.`);

//     // we should get redirected to Comp 1
//     const comp1 = workspace.openComponent('Comp 1');

//     expect(comp1.title.getText()).toEqual('Comp 1');
//     expect(comp1.state.getText()).toEqual('Started');
//     expect(comp1.type.getText()).toEqual('BC');

//     expect(comp1.serviceUnits.getText()).toEqual([
//       `SU 1`,
//       `SA 1`,
//       `SU 3`,
//       `SA 2`,
//     ]);

//     comp1
//       .getInfoNoSlMessage()
//       .expectToBe('info', `This component doesn't use any shared library.`);

//     // clicking on SU's name should open SU's page
//     comp1.openServiceUnit('SU 1');
//   });

//   it(`should stop/start/stop/unload a component`, () => {
//     let ops = workspace.openComponent('Comp 0').openOperations();

//     expect(ops.parameter('httpPort').isPresent()).toBe(false);
//     expect(ops.parameter('httpsEnabled').isPresent()).toBe(false);
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('10');

//     waitAndClick(ops.stopButton);

//     expect(ops.parameter('httpPort').isPresent()).toBe(false);
//     expect(ops.parameter('httpsEnabled').isPresent()).toBe(false);
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('10');

//     waitAndClick(ops.startButton);
//     waitAndClick(ops.stopButton);

//     // unload the 2 SU
//     const sa0 = workspace.openServiceAssembly('SA 0').openOperations();
//     waitAndClick(sa0.stopButton);
//     page.clickAndExpectNotification(sa0.unloadButton);

//     const sa2 = workspace.openServiceAssembly('SA 2').openOperations();
//     waitAndClick(sa2.stopButton);
//     page.clickAndExpectNotification(sa2.unloadButton);

//     // we should now be able to unload the comp 0
//     ops = workspace.openComponent('Comp 0').openOperations();

//     waitAndClick(ops.uninstallButton);

//     expect(ops.getSUUpload().chooseFileButton.isEnabled()).toBe(false);

//     expect(ops.parameter('httpPort').getAttribute('value')).toEqual('8484');
//     expect(ops.parameter('httpsEnabled').getAttribute('value')).toEqual(
//       'false'
//     );
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('10');

//     waitAndClick(ops.installButton);

//     expect(ops.parameter('httpPort').isPresent()).toBe(false);
//     expect(ops.parameter('httpsEnabled').isPresent()).toBe(false);
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('10');

//     waitAndClick(ops.uninstallButton);

//     // once unloaded ...
//     page.clickAndExpectNotification(ops.unloadButton);

//     expect(browser.getCurrentUrl()).toMatch(
//       /\/workspaces\/\w+\/petals\/components\/\w+$/
//     );

//     expect(ops.hasBeenDeletedMessage.getText()).toEqual(
//       `This component has been removed`
//     );

//     // the component should have been deleted from petals tree
//     expect(workspace.treeElement(`Comp 0`, 'component').isPresent()).toBe(
//       false
//     );
//   });

//   it(`should set a component's parameters`, () => {
//     const ops = workspace.openComponent('Comp 2').openOperations();

//     expect(ops.parameter('httpPort').isPresent()).toBe(false);
//     expect(ops.parameter('httpsEnabled').isPresent()).toBe(false);
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('10');
//     expect(ops.setParametersButton.isEnabled()).toBe(false);

//     ops.parameter('httpThreadPoolSizeMax').sendKeys('0');

//     waitAndClick(ops.setParametersButton);
//     waitAndClick(ops.stopButton);

//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('100');

//     waitAndClick(ops.uninstallButton);

//     expect(ops.parameter('httpPort').getAttribute('value')).toEqual('8484');
//     expect(ops.parameter('httpsEnabled').getAttribute('value')).toEqual(
//       'false'
//     );
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('100');

//     clearInput(ops.parameter('httpsEnabled'));
//     ops.parameter('httpsEnabled').sendKeys('true');
//     ops.parameter('httpThreadPoolSizeMax').sendKeys('1');

//     waitAndClick(ops.setParametersButton);
//     waitAndClick(ops.installButton);

//     expect(ops.parameter('httpPort').isPresent()).toBe(false);
//     expect(ops.parameter('httpsEnabled').isPresent()).toBe(false);
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('1001');

//     waitAndClick(ops.uninstallButton);

//     expect(ops.parameter('httpPort').getAttribute('value')).toEqual('8484');
//     expect(ops.parameter('httpsEnabled').getAttribute('value')).toEqual('true');
//     expect(
//       ops.parameter('httpThreadPoolSizeMax').getAttribute('value')
//     ).toEqual('1001');
//   });

//   it('should have a correct SU deployment form', () => {
//     const deploy = workspace
//       .openComponent('Comp 0')
//       .openOperations()
//       .getSUUpload();

//     expect(deploy.chooseFile.getText()).toEqual(`CHOOSE A FILE...`);
//     const filePath = path.resolve(__dirname, './resources/su.zip');
//     deploy.fileInput.sendKeys(filePath);

//     expect(deploy.fileName.isDisplayed()).toBe(true);
//     expect(deploy.fileName.getText()).toEqual(`su.zip`);
//     expect(deploy.chooseFileButton.isPresent()).toBe(false);
//     expect(deploy.cancelFile.isPresent()).toBe(true);

//     expect(deploy.deployButton.getText()).toMatch(`UPLOAD`);
//     expect(deploy.deployButton.isEnabled()).toBe(true);
//   });

//   it(`should show a detailed error if the SU deployment fails`, () => {
//     const deploy = workspace
//       .openComponent('Comp 0')
//       .openOperations()
//       .getSUUpload();

//     const filePath = path.resolve(__dirname, './resources/error-deploy.zip');
//     deploy.fileInput.sendKeys(filePath);

//     const error = deploy.getErrorDeployMessage();

//     error.expectHidden();

//     // deploy the component
//     page.clickAndExpectNotification(
//       deploy.deployButton,
//       'Service Unit Deployment Failed',
//       'An error occurred while deploying error-deploy.zip'
//     );

//     error.expectToBe(
//       'error',
//       `[Mock message] An error happened when trying to deploy the service-unit`
//     );
//   });

//   it(`should deploy a service-unit`, () => {
//     const deploy = workspace
//       .openComponent('Comp 0')
//       .openOperations()
//       .getSUUpload();

//     const filePath = path.resolve(__dirname, './resources/su.zip');

//     deploy.fileInput.sendKeys(filePath);

//     const expectedTreeBeforeDeploy = [
//       `Bus 0`,
//       `Cont 0`,
//       `COMPONENTS`,
//       `Comp 0`,
//       `SU 0`,
//       `SU 2`,
//       `Comp 1`,
//       `SU 1`,
//       `SU 3`,
//       `Comp 2`,
//       `SERVICE ASSEMBLIES`,
//       `SA 0`,
//       `SA 1`,
//       `SA 2`,
//       `SHARED LIBRARIES`,
//       `SL 0`,
//       `Cont 1`,
//       `COMPONENTS`,
//       `Comp 3`,
//       `SU 4`,
//       `SU 6`,
//       `Comp 4`,
//       `SU 5`,
//       `SU 7`,
//       `Comp 5`,
//       `SERVICE ASSEMBLIES`,
//       `SA 3`,
//       `SA 4`,
//       `SA 5`,
//       `SHARED LIBRARIES`,
//       `SL 1`,
//     ];

//     expect(workspace.getWorkspaceTree()).toEqual(expectedTreeBeforeDeploy);

//     // deploy the service-unit
//     page.clickAndExpectNotification(
//       deploy.deployButton,
//       'Service Unit Deployed',
//       '"su" has been successfully deployed'
//     );

//     // check that the service-unit is now added to the tree and that we've been redirected to it
//     const expectedTreeAfterDeploy = [
//       `Bus 0`,
//       `Cont 0`,
//       `COMPONENTS`,
//       `Comp 0`,
//       `SU 0`,
//       `SU 2`,
//       // this one should have been deployed
//       `SU 16`,
//       `Comp 1`,
//       `SU 1`,
//       `SU 3`,
//       `Comp 2`,
//       `SERVICE ASSEMBLIES`,
//       `SA 0`,
//       `SA 1`,
//       `SA 2`,
//       // the corresponding SA should have been added
//       `SA 12`,
//       `SHARED LIBRARIES`,
//       `SL 0`,
//       `Cont 1`,
//       `COMPONENTS`,
//       `Comp 3`,
//       `SU 4`,
//       `SU 6`,
//       `Comp 4`,
//       `SU 5`,
//       `SU 7`,
//       `Comp 5`,
//       `SERVICE ASSEMBLIES`,
//       `SA 3`,
//       `SA 4`,
//       `SA 5`,
//       `SHARED LIBRARIES`,
//       `SL 1`,
//     ];

//     expect(workspace.getWorkspaceTree()).toEqual(expectedTreeAfterDeploy);

//     workspace.openServiceUnit('SU 16');
//   });

//   it(`should display an error if component change state (install) fails`, () => {
//     // deploy a component (already tested in containers E2E tests)
//     const deploy = workspace
//       .openContainer('Cont 0')
//       .openOperations()
//       .getComponentUpload();

//     const filePath = path.resolve(__dirname, './resources/component.zip');
//     deploy.fileInput.sendKeys(filePath);
//     page.clickAndExpectNotification(deploy.deployButton);

//     const ops = workspace.openComponent('Comp 12').openOperations();

//     // change state to install with some parameters (with error in httpThreadPoolSizeMax to make it fail)
//     const poolSizeInput = ops.parameter('httpThreadPoolSizeMax');

//     clearInput(poolSizeInput);
//     poolSizeInput.sendKeys('error');

//     const error = ops.getErrorChangeStateMessage();

//     error.expectHidden();

//     waitAndClick(ops.setParametersButton);

//     error.expectToBe(
//       'error',
//       `[Mock message] An error happened when trying to change the parameters of that component`
//     );

//     // make sure the form isn't reset
//     expect(ops.parameter('httpsEnabled').getAttribute('value')).toEqual(
//       `false`
//     );
//     expect(ops.parameter('httpPort').getAttribute('value')).toEqual(`8484`);
//     expect(poolSizeInput.getAttribute('value')).toEqual(`error`);
//   });
// });
