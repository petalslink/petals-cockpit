/**
 * Copyright (C) 2017-2019 Linagora
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

import { IStore } from '@shared/state/store.interface';
import { IComponentRow } from '@wks/state/components/components.interface';
import { getComponentsById } from '@wks/state/components/components.selectors';
import { IServiceUnit } from '@wks/state/service-units/service-units.interface';
import { getServiceUnitsById } from '@wks/state/service-units/service-units.selectors';
import {
  IServiceAssembly,
  IServiceAssemblyRow,
} from './service-assemblies.interface';

export interface IServiceAssemblyWithSUsAndComponents extends IServiceAssembly {
  serviceUnits: IServiceUnitWithComponent[];
}

export interface IServiceUnitWithComponent extends IServiceUnit {
  component: IComponentRow;
}

export function getServiceAssembliesById(state: IStore) {
  return state.serviceAssemblies.byId;
}

export function getServiceAssembliesAllIds(state: IStore) {
  return state.serviceAssemblies.allIds;
}

export const getSelectedServiceAssembly = createSelector(
  (state: IStore) => state.serviceAssemblies.selectedServiceAssemblyId,
  getServiceAssembliesById,
  (id, sas): IServiceAssemblyRow => sas[id]
);

export const getCurrentServiceAssembly = createSelector(
  getSelectedServiceAssembly,
  getServiceUnitsById,
  getComponentsById,
  (sa, sus, components): IServiceAssemblyWithSUsAndComponents => {
    if (sa) {
      return {
        ...sa,
        serviceUnits: sa.serviceUnits.map(id => {
          const su = sus[id];
          return { ...su, component: components[su.componentId] };
        }),
      };
    } else {
      return undefined;
    }
  }
);
