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

import { getServiceAssembliesById } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.selectors';
import {
  getServiceUnitsById,
  IServiceUnitWithSA,
} from 'app/features/cockpit/workspaces/state/service-units/service-units.selectors';
import { ISharedLibraryRow } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';
import { getSharedLibrariesById } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.selectors';
import {
  IComponentBackendDetailsCommon,
  IComponentBackendSSECommon,
} from 'app/shared/services/components.service';
import { IStore } from 'app/shared/state/store.interface';
import { IComponentRow, IComponentUI } from './components.interface';

export interface IComponentWithSLsAndSUs
  extends IComponentUI,
    IComponentBackendSSECommon,
    IComponentBackendDetailsCommon {
  serviceUnits: IServiceUnitWithSA[];
  sharedLibraries: ISharedLibraryRow[];
}

export function getComponentsById(state: IStore) {
  return state.components.byId;
}

export function getComponentsAllIds(state: IStore) {
  return state.components.allIds;
}

export const getSelectedComponent = createSelector(
  (state: IStore) => state.components.selectedComponentId,
  getComponentsById,
  (id, components): IComponentRow => components[id]
);

export const getCurrentComponent = createSelector(
  getSelectedComponent,
  getServiceUnitsById,
  getSharedLibrariesById,
  getServiceAssembliesById,
  (component, sus, sls, sas): IComponentWithSLsAndSUs => {
    if (component) {
      return {
        ...component,
        serviceUnits: component.serviceUnits.map(suId => {
          const su = sus[suId];
          return {
            ...su,
            serviceAssembly: sas[su.serviceAssemblyId],
          };
        }),
        sharedLibraries: component.sharedLibraries.map(slId => sls[slId]),
      };
    } else {
      return undefined;
    }
  }
);
