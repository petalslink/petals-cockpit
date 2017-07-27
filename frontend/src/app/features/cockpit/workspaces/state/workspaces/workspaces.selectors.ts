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

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { TreeElement } from 'app/features/cockpit/workspaces/petals-menu/material-tree/material-tree.component';
import {
  arrayEquals,
  escapeStringRegexp,
} from 'app/shared/helpers/shared.helper';
import { IStore } from 'app/shared/state/store.interface';
import { IUserRow } from 'app/shared/state/users.interface';
import { getUsersById } from 'app/shared/state/users.selectors';
import { IWorkspaceRow, IWorkspaces } from './workspaces.interface';

export function getWorkspaces(store$: Store<IStore>): Observable<IWorkspaces> {
  return store$
    .select(state => state.workspaces)
    .withLatestFrom(store$.select(getUsersById))
    .map(([workspaces, usersById]) => {
      return {
        ...workspaces,
        list: workspaces.allIds.map(wId => {
          const ws = workspaces.byId[wId];
          return {
            ...ws,
            users: ws.users.map(id => usersById.byId[id]),
          };
        }),
      };
    });
}

// -----------------------------------------------------------

export function getCurrentWorkspace(
  store$: Store<IStore>
): Observable<IWorkspaceRow> {
  return store$.select(currentWorkspace);
}

const currentWorkspace = (s: IStore) =>
  s.workspaces.byId[s.workspaces.selectedWorkspaceId];

export function getCurrentWorkspaceUsers(
  store$: Store<IStore>
): Observable<IUserRow[]> {
  return store$
    .select(state =>
      currentWorkspace(state).users.map(id => state.users.byId[id])
    )
    .distinctUntilChanged(arrayEquals);
}

export function getUsersNotInCurrentWorkspace(
  store$: Store<IStore>
): Observable<IUserRow[]> {
  return store$
    .map(state => {
      const wUsers = currentWorkspace(state).users;
      return state.users.allIds
        .filter(id => !wUsers.includes(id))
        .map(id => state.users.byId[id]);
    })
    .distinctUntilChanged(arrayEquals);
}

// -----------------------------------------------------------

export enum WorkspaceElementType {
  BUS,
  CONTAINER,
  COMPONENT,
  SERVICEASSEMBLY,
  SERVICEUNIT,
  SHAREDLIBRARY,
  COMPCATEGORY,
  SACATEGORY,
  SLCATEGORY,
}

export interface WorkspaceElement extends TreeElement<WorkspaceElement> {
  id: string;
  type: WorkspaceElementType;
  name: string;
}

export function getCurrentWorkspaceTree(
  store$: Store<IStore>
): Observable<WorkspaceElement[]> {
  return store$.select(state => {
    const tree = buildTree(state);
    const search = state.workspaces.searchPetals;

    if (typeof search !== 'string' || search === '') {
      return tree;
    }

    const escaped = escapeStringRegexp(search);

    return tree
      .map(e => filterElement(escaped.toLowerCase(), e))
      .filter(e => e !== null);
  });
}

function buildTree(state: IStore) {
  const baseUrl = `/workspaces/${state.workspaces.selectedWorkspaceId}/petals`;
  return state.buses.allIds
    .map(id => state.buses.byId[id])
    .map<WorkspaceElement>(bus => ({
      id: bus.id,
      type: WorkspaceElementType.BUS,
      name: bus.name,
      link: `${baseUrl}/buses/${bus.id}`,
      isFolded: bus.isFolded,
      cssClass: `workspace-element-type-bus`,
      svgIcon: `bus`,

      children: bus.containers
        .map(id => state.containers.byId[id])
        .map<WorkspaceElement>(container => ({
          id: container.id,
          type: WorkspaceElementType.CONTAINER,
          name: container.name,
          link: `${baseUrl}/containers/${container.id}`,
          isFolded: container.isFolded,
          cssClass: `workspace-element-type-container`,
          icon: `dns`,

          children: [
            {
              id: container.id,
              type: WorkspaceElementType.COMPCATEGORY,
              name: 'Components',
              isFolded: container.isComponentsCategoryFolded,
              cssClass: `workspace-element-type-category-components`,
              children: container.components
                .map(id => state.components.byId[id])
                .map<WorkspaceElement>(component => ({
                  id: component.id,
                  type: WorkspaceElementType.COMPONENT,
                  name: component.name,
                  link: `${baseUrl}/components/${component.id}`,
                  isFolded: component.isFolded,
                  cssClass: `workspace-element-type-component`,
                  svgIcon: `component`,

                  children: component.serviceUnits
                    .map(id => state.serviceUnits.byId[id])
                    .map<WorkspaceElement>(serviceUnit => ({
                      id: serviceUnit.id,
                      type: WorkspaceElementType.SERVICEUNIT,
                      name: serviceUnit.name,
                      link: `${baseUrl}/service-units/${serviceUnit.id}`,
                      isFolded: serviceUnit.isFolded,
                      cssClass: `workspace-element-type-service-unit`,
                      svgIcon: `su`,
                      children: [],
                    })),
                })),
            },
            {
              id: container.id,
              type: WorkspaceElementType.SACATEGORY,
              name: 'Service Assemblies',
              isFolded: container.isServiceAssembliesCategoryFolded,
              cssClass: `workspace-element-type-category-service-assemblies`,
              children: container.serviceAssemblies
                .map(id => state.serviceAssemblies.byId[id])
                .map<WorkspaceElement>(serviceAssembly => ({
                  id: serviceAssembly.id,
                  type: WorkspaceElementType.SERVICEASSEMBLY,
                  name: serviceAssembly.name,
                  link: `${baseUrl}/service-assemblies/${serviceAssembly.id}`,
                  isFolded: serviceAssembly.isFolded,
                  cssClass: `workspace-element-type-service-assembly`,
                  svgIcon: `sa`,
                  children: [],
                })),
            },
            {
              id: container.id,
              type: WorkspaceElementType.SLCATEGORY,
              name: 'Shared Libraries',
              isFolded: container.isSharedLibrariesCategoryFolded,
              cssClass: `workspace-element-type-category-shared-libraries`,
              children: container.sharedLibraries
                .map(id => state.sharedLibraries.byId[id])
                .map<WorkspaceElement>(sl => ({
                  id: sl.id,
                  type: WorkspaceElementType.SHAREDLIBRARY,
                  name: sl.name,
                  link: `${baseUrl}/shared-libraries/${sl.id}`,
                  isFolded: sl.isFolded,
                  cssClass: `workspace-element-type-shared-library`,
                  svgIcon: `sl`,
                  children: [],
                })),
            },
          ],
        })),
    }));
}

function filterElement(filter: string, element: any): any {
  if (element.name.toLowerCase().trim().match(filter)) {
    return element;
  } else if (!element.children) {
    return null;
  } else {
    const es = (element.children as any[])
      .map(e => filterElement(filter, e))
      .filter(e => e !== null);

    if (es.length === 0) {
      return null;
    } else {
      return {
        ...element,
        isFolded: false,
        children: es,
      };
    }
  }
}
