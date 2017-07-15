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

import { IBusInProgressRow } from './buses-in-progress.interface';
import { IStore } from 'app/shared/state/store.interface';
import { arrayEquals } from 'app/shared/helpers/shared.helper';

export function getBusesInProgress(
  store$: Store<IStore>
): Observable<IBusInProgressRow[]> {
  return store$
    .select(s => s.busesInProgress.allIds.map(id => s.busesInProgress.byId[id]))
    .distinctUntilChanged(arrayEquals);
}

export function getCurrentBusInProgressOrNull(
  store$: Store<IStore>
): Observable<IBusInProgressRow> {
  return store$.select(
    state =>
      !state.busesInProgress.selectedBusInProgressId
        ? null
        : state.busesInProgress.byId[
            state.busesInProgress.selectedBusInProgressId
          ]
  );
}
