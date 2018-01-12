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

import {
  findNamespaceLocalpart,
  groupByNamespace,
} from 'app/features/cockpit/workspaces/service-menu/services-list/services-list.helper';
import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { getSelectedWorkspaceId } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';
import { IStore } from 'app/shared/state/store.interface';

export const getServicesById = (state: IStore) => state.services.byId;

export const getServicesAllIds = (state: IStore) => state.services.allIds;

export const getSelectedService = createSelector(
  (state: IStore) => state.services.selectedServiceId,
  getServicesById,
  (id, ss): IServiceRow => ss[id]
);

export const getAllServices = createSelector(
  getServicesAllIds,
  getServicesById,
  (ids, byId) => {
    return ids.map(id => byId[id]);
  }
);

export const getCurrentServiceTree = createSelector(
  getSelectedWorkspaceId,
  getServicesAllIds,
  getServicesById,
  (selectedWorkspaceId, servicesAllIds, servicesByIds): TreeElement<any>[] => {
    const baseUrl = `/workspaces/${selectedWorkspaceId}/services`;

    const servicesWithNspLocalpart = servicesAllIds.map(id => ({
      ...findNamespaceLocalpart(servicesByIds[id].name),
      id,
    }));

    const groupedByNamespace = groupByNamespace(servicesWithNspLocalpart);

    return groupedByNamespace.map(nspWithLocalparts => ({
      name: nspWithLocalparts.namespace,
      isFolded: false,
      cssClass: `item-namespace`,
      link: ``,
      children: nspWithLocalparts.localparts.map(localpart => ({
        name: localpart.name,
        isFolded: false,
        cssClass: `item-localpart`,
        link: `${baseUrl}/${localpart.id}`,
        children: [],
      })),
    }));
  }
);
