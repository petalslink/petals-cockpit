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

import { createSelector } from '@ngrx/store';

import {
  IEndpoint,
  IEndpointRow,
} from 'app/features/cockpit/workspaces/state/endpoints/endpoints.interface';
import { IInterfaceRow } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.interface';
import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { getSelectedWorkspaceId } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';
import { IStore } from 'app/shared/state/store.interface';

export interface IEndpointWithServicesAndInterfaces extends IEndpoint {
  services: IServiceRow[];
  interfaces: IInterfaceRow[];
}

export function getEndpointsById(state: IStore) {
  return state.endpoints.byId;
}

export function getEndpointsAllIds(state: IStore) {
  return state.endpoints.allIds;
}

export const getSelectedEndpoint = createSelector(
  (state: IStore) => state.endpoints.selectedEndpointId,
  getEndpointsById,
  (id, sep): IEndpointRow => sep[id]
);

export const getAllEndpoints = createSelector(
  getEndpointsAllIds,
  getEndpointsById,
  (ids, byId) => {
    return ids.map(id => byId[id]);
  }
);

export const getCurrentEndpointTree = createSelector(
  getSelectedWorkspaceId,
  getEndpointsAllIds,
  getEndpointsById,
  (
    selectedWorkspaceId,
    endpointsAllIds,
    endpointsByIds
  ): TreeElement<any>[] => {
    const baseUrl = `/workspaces/${selectedWorkspaceId}/services/endpoints`;

    const endpoints = endpointsAllIds.map(id => ({
      name: endpointsByIds[id].name,
      id,
    }));

    return endpoints.map(edp => ({
      name: edp.name,
      isFolded: false,
      cssClass: `item-edpName`,
      link: `${baseUrl}/${edp.id}`,
      children: [],
    }));
  }
);
