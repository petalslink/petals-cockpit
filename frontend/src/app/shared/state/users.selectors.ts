/**
 * Copyright (C) 2017-2018 Linagora
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
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { isNot } from '@shared/helpers/shared.helper';
import { IStore } from './store.interface';
import { ICurrentUser } from './users.interface';

export function getUsers(state: IStore) {
  return state.users;
}

export function getConnectedUser(state: IStore) {
  return state.users.connectedUser;
}

export function getUsersById(state: IStore) {
  return state.users.byId;
}

export function getUsersAllIds(state: IStore) {
  return state.users.allIds;
}

export const getAllUsers = createSelector(
  getUsersAllIds,
  getUsersById,
  (ids, byId) => ids.map(id => byId[id])
);

export const getCurrentUser = (
  store$: Store<IStore>
): Observable<ICurrentUser> => {
  return store$.select(getConnectedUser).pipe(filter(isNot(null)));
};
