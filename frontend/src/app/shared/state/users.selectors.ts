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

import { Store } from '@ngrx/store';
import { createSelector } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { isNot } from '../helpers/shared.helper';
import { IStore } from './store.interface';
import { ICurrentUser } from './users.interface';

export const getUsers = (state: IStore) => state.users;

export const getConnectedUser = (state: IStore) => state.users.connectedUser;

export const getUsersAllIds = (state: IStore) => state.users.allIds;

export const getUsersById = (state: IStore) => state.users.byId;

export const getAllUsers = createSelector(
  getUsersAllIds,
  getUsersById,
  (ids, byId) => ids.map(id => byId[id])
);

export const getCurrentUser = (
  store$: Store<IStore>
): Observable<ICurrentUser> => {
  return store$.select(getConnectedUser).filter(isNot(null));
};
