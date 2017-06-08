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
import { Observable } from 'rxjs/Observable';

import { IStore } from './../interfaces/store.interface';
import { ICurrentUser } from './../interfaces/users.interface';
import { isNot } from '../helpers/shared.helper';

export function _getCurrentUser(
  store$: Store<IStore>
): Observable<ICurrentUser> {
  return store$
    .select(
      state =>
        state.users.connectedUserId === ''
          ? null
          : state.users.byId[state.users.connectedUserId]
    )
    .filter(isNot(null));
}

export function getCurrentUser() {
  return _getCurrentUser;
}
