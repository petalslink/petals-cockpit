/**
 * Copyright (C) 2017-2020 Linagora
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

import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  IBusBackendDetailsCommon,
  IBusBackendSSECommon,
} from '@shared/services/buses.service';
import { IStore } from '@shared/state/store.interface';
import { IContainerRow } from '@wks/state/containers/containers.interface';
import { getContainersById } from '@wks/state/containers/containers.selectors';
import { IBusRow, IBusUI } from './buses.interface';

export interface IBusWithContainers
  extends IBusUI,
    IBusBackendSSECommon,
    IBusBackendDetailsCommon {
  containers: IContainerRow[];
}

export function getBusesById(state: IStore) {
  return state.buses.byId;
}

export function getBusesAllIds(state: IStore) {
  return state.buses.allIds;
}

export const getSelectedBus = createSelector(
  (state: IStore) => state.buses.selectedBusId,
  getBusesById,
  (id, buses): IBusRow => buses[id]
);

export const getCurrentBus = createSelector(
  getSelectedBus,
  getContainersById,
  (bus, containers): IBusWithContainers => {
    if (bus) {
      return { ...bus, containers: bus.containers.map(c => containers[c]) };
    } else {
      return undefined;
    }
  }
);

export function getBuses(
  store$: Store<IStore>
): Observable<{ list: IBusRow[] }> {
  return store$.pipe(
    select(state => state.buses),
    map(buses => {
      return {
        list: buses.allIds
          .map(id => {
            return buses.byId[id];
          })
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
  );
}

export const getBusImportProgressStatus = createSelector(
  (state: IStore) => state.buses.importBusId,
  (state: IStore) => state.buses.isCancelingImportBus,
  (
    importBusId,
    isCancelingImportBus
  ): { importBusId: string; isCancelingImportBus: boolean } => {
    return { importBusId, isCancelingImportBus };
  }
);

export const getImportBusError = createSelector(
  (state: IStore) => state.buses.importBusError,
  (state: IStore) => state.buses.importError,
  (
    importBusError,
    importError
  ): { importBusError: string; importError: string } => {
    return { importBusError, importError };
  }
);
