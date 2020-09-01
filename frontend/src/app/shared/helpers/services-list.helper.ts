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

import { IEndpointRow } from '@feat/cockpit/workspaces/state/endpoints/endpoints.interface';
import { IInterfaceRow } from '@feat/cockpit/workspaces/state/interfaces/interfaces.interface';
import { IServiceRow } from '@feat/cockpit/workspaces/state/services/services.interface';
import {
  EServiceNodeType,
  IServiceTreeNode,
} from '@feat/cockpit/workspaces/state/workspaces/workspaces.interface';

export interface IQName {
  namespace: string;
  localpart: string;
}

export function createInterfaceNamespaceNode(
  namespace: string,
  path: number[]
): IServiceTreeNode {
  return {
    type: EServiceNodeType.InterfaceNamespace,
    id: undefined,
    name: namespace,
    isFolded: false,
    svgIcon: 'namespace',
    path: path,
    children: [],
  };
}

export function createServiceNamespaceNode(
  namespace: string,
  path: number[]
): IServiceTreeNode {
  return {
    type: EServiceNodeType.ServiceNamespace,
    id: undefined,
    name: namespace,
    isFolded: false,
    svgIcon: 'namespace',
    path: path,
    children: [],
  };
}

export function createInterfaceLocalpartNode(
  itf: IInterfaceRow,
  wksId: string,
  path: number[]
): IServiceTreeNode {
  return {
    type: EServiceNodeType.InterfaceLocalpart,
    id: itf.id,
    name: findNamespaceLocalpart(itf.name).localpart,
    isFolded: false,
    link: `/workspaces/${wksId}/services/interfaces/${itf.id}`,
    svgIcon: 'interface',
    path: path,
    children: [],
  };
}

export function createServiceLocalpartNode(
  svc: IServiceRow,
  wksId: string,
  path: number[]
): IServiceTreeNode {
  return {
    type: EServiceNodeType.ServiceLocalpart,
    id: svc.id,
    name: findNamespaceLocalpart(svc.name).localpart,
    isFolded: false,
    link: `/workspaces/${wksId}/services/services/${svc.id}`,
    svgIcon: 'service',
    path: path,
    children: [],
  };
}

export function createEndpointNode(
  edp: IEndpointRow,
  wksId: string,
  path: number[]
): IServiceTreeNode {
  return {
    type: EServiceNodeType.Endpoint,
    id: edp.id,
    name: edp.name,
    isFolded: false,
    link: `/workspaces/${wksId}/services/endpoints/${edp.id}`,
    svgIcon: 'endpoint',
    path: path,
    children: [],
  };
}

export function findNamespaceLocalpart(str: string): IQName {
  if (str) {
    const res = str.match(/{(.+)}(.+)/);
    if (res) {
      return { namespace: res[1], localpart: res[2] };
    }
  }
  return { namespace: '', localpart: '' };
}

export function groupByNamespace(
  arr: { id: string; namespace: string; localpart: string }[]
): { namespace: string; localparts: { id: string; name: string }[] }[] {
  return Object.values(
    arr.reduce(
      (acc, curr) => {
        const accCurrLocalparts = acc[curr.namespace]
          ? acc[curr.namespace].localparts
          : [];

        return {
          ...acc,
          [curr.namespace]: {
            namespace: curr.namespace,
            localparts: [
              ...accCurrLocalparts,
              { id: curr.id, name: curr.localpart },
            ],
          },
        };
      },
      {} as {
        [key: string]: {
          namespace: string;
          localparts: { id: string; name: string }[];
        };
      }
    )
  );
}
