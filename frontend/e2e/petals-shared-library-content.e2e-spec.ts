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
import { NotFoundPage } from './pages/not-found';

describe(`Petals shared library content`, () => {
  it(`should open the 404 page if the shared-library doesn't exists`, () => {
    page
      .goToViaLogin('/workspaces/idWks0/petals/shared-libraries/unknownIdSl')
      .loginNoCheck('admin', 'admin');

    NotFoundPage.waitAndGet();
  });
});

describe(`Petals shared library content`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace('admin', 'admin');
  });

  it(`should open the content page`, () => {
    const sl = workspace.openSharedLibrary('SL 0');

    expect(sl.title.getText()).toEqual('SL 0');
    expect(sl.components.getText()).toEqual(['Comp 2']);

    const comp = sl.openComponent('Comp 2');
    expect(comp.title.getText()).toEqual('Comp 2');

    expect(comp.sharedLibraries.getText()).toEqual(['SL 0']);
    comp.openSharedLibrary('SL 0');
  });

  it(`should unload a shared library`, () => {
    let ops = workspace.openSharedLibrary('SL 0').openOperations();

    expect(ops.unloadButton.isEnabled()).toBe(false);

    // unload the component
    const comp = ops.openOverview().openComponent(0).openOperations();
    page.waitAndClick(comp.stopButton);
    page.clickAndExpectNotification(comp.unloadButton);

    // we should now be able to unload the comp 0
    ops = workspace.openSharedLibrary('SL 0').openOperations();

    expect(ops.unloadButton.isEnabled()).toBe(true);

    page.clickAndExpectNotification(ops.unloadButton);

    // we should be redirected to the workspace page ...
    WorkspaceOverviewPage.waitAndGet();

    // and the sl should have been deleted from petals tree
    expect(workspace.treeElement(`SL 0`, 'shared-library').isPresent()).toBe(
      false
    );
  });
});
