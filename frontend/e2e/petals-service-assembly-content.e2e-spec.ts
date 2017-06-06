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
import { page } from './common';
import { WorkspacePage, WorkspaceOverviewPage } from './pages/workspace.po';

describe(`Petals service-assembly content`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace('admin', 'admin');
  });

  it(`should open the content page, check the state and related service-units in overview tab`, () => {
    let sa = workspace.openServiceAssembly('SA 0');

    expect(sa.title.getText()).toEqual('SA 0');
    expect(sa.state.getText()).toEqual('Started');

    expect(sa.serviceUnits.getText()).toEqual(['Service unit "SU 0" deployed on component "Comp 0"']);

    // clicking on SU's name should open SU's page
    sa.openServiceUnit('SU 0');

    // clicking on component's name should open component's page
    sa = workspace.openServiceAssembly('SA 0');
    sa.openComponent('Comp 0');
  });

  it(`should stop/start/stop/unload a service-assembly`, () => {
    const ops = workspace.openServiceAssembly('SA 0').openOperations();

    page.waitAndClick(ops.stopButton);
    expect(ops.state.getText()).toEqual('Stopped');

    page.waitAndClick(ops.startButton);
    expect(ops.state.getText()).toEqual('Started');

    page.waitAndClick(ops.stopButton);
    expect(ops.state.getText()).toEqual('Stopped');

    // once unloaded ...
    // there should be a popup saying that the SU has been deleted
    page.clickAndExpectNotification(
      ops.unloadButton,
      'Service assembly unloaded',
      '"SA 0" has been unloaded');

    // we should be redirected to the workspace page ...
    WorkspaceOverviewPage.waitAndGet();

    // and the SU should have been deleted from petals tree
    expect(workspace.treeElement(`SU 0`, 'service-unit').isPresent()).toBe(false);
  });
});