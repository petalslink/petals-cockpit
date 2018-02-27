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

import { IInterfaceRow } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.interface';
import { getSelectedWorkspaceId } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';
import {
  findNamespaceLocalpart,
  groupByNamespace,
} from 'app/shared/helpers/services-list.helper';
import { IStore } from 'app/shared/state/store.interface';

export const getInterfacesById = (state: IStore) => state.interfaces.byId;

export const getInterfacesAllIds = (state: IStore) => state.interfaces.allIds;

export const getSelectedInterface = createSelector(
  (state: IStore) => state.interfaces.selectedInterfaceId,
  getInterfacesById,
  (id, sep): IInterfaceRow => sep[id]
);

export const getAllInterfaces = createSelector(
  getInterfacesAllIds,
  getInterfacesById,
  (ids, byId) => {
    return ids.map(id => byId[id]);
  }
);

export const getCurrentInterfaceTree = createSelector(
  getSelectedWorkspaceId,
  getInterfacesAllIds,
  getInterfacesById,
  (
    selectedWorkspaceId,
    interfacesAllIds,
    interfacesByIds
  ): TreeElement<any>[] => {
    const baseUrl = `/workspaces/${selectedWorkspaceId}/services/interfaces`;

    const interfacesWithNspLocalpart = interfacesAllIds.map(id => ({
      ...findNamespaceLocalpart(interfacesByIds[id].name),
      id,
    }));

    const groupedByNamespace = groupByNamespace(interfacesWithNspLocalpart);

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
