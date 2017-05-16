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

import { page } from './common';
import { WorkspacePage } from './pages/workspace.po';

describe(`Petals service-unit content`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace('admin', 'admin');
  });

  it(`should open the content page`, () => {
    const su = workspace.openServiceUnit('SU 0');

    expect(su.title.getText()).toEqual('SU 0');
    expect(su.state.getText()).toEqual('Started');
  });

  it(`should stop/start/stop/unload a service-unit`, () => {
    const su = workspace.openServiceUnit('SU 0');

    su.stopButton.click();
    expect(su.state.getText()).toEqual('Stopped');

    su.startButton.click();
    expect(su.state.getText()).toEqual('Started');

    su.stopButton.click();
    expect(su.state.getText()).toEqual('Stopped');

    // once unloaded ...
    // there should be a popup saying that the SU has been deleted
    page.clickAndExpectNotification(
      su.unloadButton,
      'Service unit unloaded',
      '"SU 0" has been unloaded');

    // we should be redirected to the workspace page ...
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    // and the SU should have been deleted from petals tree
    expect(workspace.treeElement(`SU 0`, 'service-unit').isPresent()).toBe(false);
  });
});
