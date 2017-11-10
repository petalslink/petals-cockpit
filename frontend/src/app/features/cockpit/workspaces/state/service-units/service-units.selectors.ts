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

import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';
import { getComponentsById } from 'app/features/cockpit/workspaces/state/components/components.selectors';
import { IServiceAssemblyRow } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import { getServiceAssembliesById } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.selectors';
import { IStore } from 'app/shared/state/store.interface';

export interface IServiceUnitWithSA extends IServiceUnit {
  serviceAssembly: IServiceAssemblyRow;
}

export interface IServiceUnitWithSAAndComponent extends IServiceUnit {
  serviceAssembly: IServiceAssemblyRow;
  component: IComponentRow;
}

export function getServiceUnitsById(state: IStore) {
  return state.serviceUnits.byId;
}

export function getServiceUnitsAllIds(state: IStore) {
  return state.serviceUnits.allIds;
}

export const getSelectedServiceUnit = createSelector(
  (state: IStore) => state.serviceUnits.selectedServiceUnitId,
  getServiceUnitsById,
  (id, sus): IServiceUnitRow => sus[id]
);

export const getCurrentServiceUnit = createSelector(
  getSelectedServiceUnit,
  getServiceAssembliesById,
  getComponentsById,
  (su, sas, components): IServiceUnitWithSAAndComponent => {
    if (su) {
      return {
        ...su,
        serviceAssembly: sas[su.serviceAssemblyId],
        component: components[su.componentId],
      };
    } else {
      return undefined;
    }
  }
);
