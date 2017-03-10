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

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IBusRow } from './bus.interface';
import { isNot } from '../../../../../shared/helpers/shared.helper';

export function _getCurrentBus(store$: Store<IStore>): Observable<IBusRow> {
  return store$
    .select(state => state.buses.selectedBusId === ''
      ? null
      : state.buses.byId[state.buses.selectedBusId])
    .filter(isNot(null));
}

export function getCurrentBus() {
  return _getCurrentBus;
}
