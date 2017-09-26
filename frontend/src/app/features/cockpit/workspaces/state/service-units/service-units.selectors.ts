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
import { IServiceUnit, IServiceUnitRow } from './service-units.interface';

import { IServiceAssemblyRow } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import { IStore } from 'app/shared/state/store.interface';

export interface IServiceUnitWithSA extends IServiceUnit {
  serviceAssembly: IServiceAssemblyRow;
}

export const getServiceUnitsById = (state: IStore) => state.serviceUnits.byId;

export const getServiceUnitsAllIds = (state: IStore) =>
  state.serviceUnits.allIds;

export const getSelectedServiceUnit = createSelector(
  (state: IStore) => state.serviceUnits.selectedServiceUnitId,
  getServiceUnitsById,
  (id, sus): IServiceUnitRow => sus[id]
);

export const getCurrentServiceUnit = createSelector(
  getSelectedServiceUnit,
  (state: IStore) => state.serviceAssemblies.byId,
  (su, sas): IServiceUnitWithSA => {
    if (su) {
      return {
        ...su,
        serviceAssembly: sas[su.serviceAssemblyId],
      };
    } else {
      return undefined;
    }
  }
);
