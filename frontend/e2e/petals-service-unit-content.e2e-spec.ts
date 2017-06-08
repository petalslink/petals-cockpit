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
    expect(su.serviceAssembly.getText()).toEqual('SA 0');
    expect(su.viewServiceAssemblyName.getText()).toEqual('VIEW THIS SA');

    const sa = su.openServiceAssembly();
    expect(sa.title.getText()).toEqual('SA 0');
  });
});
