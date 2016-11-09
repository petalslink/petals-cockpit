/**
 * Copyright (C) 2016 Linagora
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

import { makeTypedFactory, TypedRecord } from 'typed-immutable-record';

import { configFactory } from './shared-module/reducers/config.state';
import { userFactory } from './shared-module/reducers/user.state';
import { workspaceFactory } from './shared-module/reducers/workspace.state';
import { minimalWorkspacesFactory } from './shared-module/reducers/minimal-workspaces.state';
import { IStore } from './shared-module/interfaces/store.interface';

// only used here, so don't export
interface IStoreRecord extends TypedRecord<IStoreRecord>, IStore {};

export const storeFactory = makeTypedFactory<IStore, IStoreRecord>({
  config: configFactory(),
  user: userFactory(),
  minimalWorkspaces: minimalWorkspacesFactory(),
  workspace: workspaceFactory()
});
