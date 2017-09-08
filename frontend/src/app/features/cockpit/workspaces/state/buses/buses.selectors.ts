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

import { createSelector } from '@ngrx/store';

import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/containers.interface';
import {
  IBusBackendDetailsCommon,
  IBusBackendSSECommon,
} from 'app/shared/services/buses.service';
import { IStore } from 'app/shared/state/store.interface';
import { IBusUI } from './buses.interface';

export interface IBusWithContainers
  extends IBusUI,
    IBusBackendSSECommon,
    IBusBackendDetailsCommon {
  containers: IContainerRow[];
}

export const getBusesById = (state: IStore) => state.buses.byId;

export const getBusesAllIds = (state: IStore) => state.buses.allIds;

export const getSelectedBus = createSelector(
  (state: IStore) => state.buses.selectedBusId,
  getBusesById,
  (id, buses) => buses[id]
);

export const getCurrentBus = createSelector(
  getSelectedBus,
  (state: IStore) => state.containers.byId,
  (bus, containers) => {
    if (bus) {
      return {
        ...bus,
        containers: bus.containers.map(c => containers[c]),
      };
    } else {
      return undefined;
    }
  }
);
