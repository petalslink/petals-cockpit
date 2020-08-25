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

import { select, Store } from '@ngrx/store';
import { createSelector } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { escapeStringRegexp } from '@shared/helpers/shared.helper';
import { IStore } from '@shared/state/store.interface';
import { IUserRow } from '@shared/state/users.interface';
import {
  getConnectedUser,
  getUsersAllIds,
  getUsersById,
} from '@shared/state/users.selectors';
import { IBusRow } from '@wks/state/buses/buses.interface';
import { getBusesAllIds, getBusesById } from '@wks/state/buses/buses.selectors';
import { IComponentRow } from '@wks/state/components/components.interface';
import { getComponentsById } from '@wks/state/components/components.selectors';
import { IContainerRow } from '@wks/state/containers/containers.interface';
import { getContainersById } from '@wks/state/containers/containers.selectors';
import { IServiceAssemblyRow } from '@wks/state/service-assemblies/service-assemblies.interface';
import { getServiceAssembliesById } from '@wks/state/service-assemblies/service-assemblies.selectors';
import { IServiceUnitRow } from '@wks/state/service-units/service-units.interface';
import { getServiceUnitsById } from '@wks/state/service-units/service-units.selectors';
import { ISharedLibraryRow } from '@wks/state/shared-libraries/shared-libraries.interface';
import { getSharedLibrariesById } from '@wks/state/shared-libraries/shared-libraries.selectors';
import {
  IWorkspaceRow,
  IWorkspaces,
  IWorkspaceUserPermissions,
  IWorkspaceUserRow,
} from './workspaces.interface';

export function getSelectedWorkspaceId(state: IStore) {
  return state.workspaces.selectedWorkspaceId;
}

export function getAllWorkspaces(
  store$: Store<IStore>
): Observable<IWorkspaces> {
  return store$.pipe(
    select(state => state.workspaces),
    map(workspaces => {
      return {
        ...workspaces,
        list: workspaces.allIds
          .map(wksId => workspaces.byId[wksId])
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
  );
}

export function getCurrentUserWorkspaces(
  store$: Store<IStore>
): Observable<IWorkspaces> {
  return combineLatest(
    store$.pipe(select(state => state.workspaces)),
    store$.pipe(select(getConnectedUser))
  ).pipe(
    map(([workspaces, currentUser]) => {
      return {
        ...workspaces,
        list: workspaces.allIds
          .map(wksId => workspaces.byId[wksId])
          .filter(wks => wks.users.allIds.includes(currentUser.id))
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
  );
}

export interface IBreadcrumb {
  id?: string;
  name: string;
  type: string;
  svgIcon?: string;
  icon?: string;
}

export const getCurrentBreadcrumb = createSelector(
  (state: IStore) => getCurrentWorkspace(state),
  getBusesById,
  getContainersById,
  getComponentsById,
  getServiceUnitsById,
  getServiceAssembliesById,
  getSharedLibrariesById,
  (
    currentWorkspace: IWorkspaceRow,
    allBuses: any,
    allCont: any,
    allComp: any,
    allSu: any,
    allSa: any,
    allSl: any,
    url: string
  ): IBreadcrumb[] => {
    if (url.endsWith('/workspaces/' + currentWorkspace.id)) {
      return [
        {
          id: currentWorkspace.id,
          name: currentWorkspace.name,
          type: 'workspaces',
          icon: 'folder',
        },
      ];
    }

    // topology breadcrumbs
    if (url.includes('/workspaces/' + currentWorkspace.id + '/petals')) {
      const mainBreadcrumbs: IBreadcrumb[] = [
        {
          id: currentWorkspace.id,
          name: currentWorkspace.name,
          type: 'workspaces',
          icon: 'folder',
        },
        {
          name: 'Topology',
          type: 'category',
        },
      ];
      if (url.endsWith('petals')) {
        return mainBreadcrumbs;
      }
      if (url.endsWith('not-found')) {
        return mainBreadcrumbs.concat({
          name: 'Not Found',
          type: 'category',
        });
      } else {
        const splitUrl = url.split('/');
        const currentItemId = splitUrl[splitUrl.length - 1];

        if (url.includes('petals/buses')) {
          return mainBreadcrumbs.concat({
            id: currentItemId,
            name: allBuses[currentItemId].name,
            type: 'buses',
            svgIcon: `bus`,
          });
        } else if (url.includes('petals/containers')) {
          mainBreadcrumbs.push({
            id: allBuses[allCont[currentItemId].busId].id,
            name: allBuses[allCont[currentItemId].busId].name,
            type: 'buses',
            svgIcon: `bus`,
          });
          return mainBreadcrumbs.concat({
            id: currentItemId,
            name: allCont[currentItemId].name,
            type: 'containers',
            icon: `dns`,
          });
        } else if (url.includes('petals/components')) {
          mainBreadcrumbs.push({
            id: allBuses[allCont[allComp[currentItemId].containerId].busId].id,
            name:
              allBuses[allCont[allComp[currentItemId].containerId].busId].name,
            type: 'buses',
            svgIcon: `bus`,
          });
          mainBreadcrumbs.push({
            id: allCont[allComp[currentItemId].containerId].id,
            name: allCont[allComp[currentItemId].containerId].name,
            type: 'containers',
            icon: `dns`,
          });
          return mainBreadcrumbs.concat({
            id: currentItemId,
            name: allComp[currentItemId].name,
            type: 'components',
            svgIcon: `component`,
          });
        } else if (url.includes('petals/service-units')) {
          mainBreadcrumbs.push({
            id: allBuses[allCont[allSu[currentItemId].containerId].busId].id,
            name:
              allBuses[allCont[allSu[currentItemId].containerId].busId].name,
            type: 'buses',
            svgIcon: `bus`,
          });
          mainBreadcrumbs.push({
            id: allCont[allSu[currentItemId].containerId].id,
            name: allCont[allSu[currentItemId].containerId].name,
            type: 'containers',
            icon: `dns`,
          });
          mainBreadcrumbs.push({
            id: allComp[allSu[currentItemId].componentId].id,
            name: allComp[allSu[currentItemId].componentId].name,
            type: 'components',
            svgIcon: `component`,
          });
          return mainBreadcrumbs.concat({
            id: currentItemId,
            name: allSu[currentItemId].name,
            type: 'service-units',
            svgIcon: `su`,
          });
        } else if (url.includes('petals/service-assemblies')) {
          mainBreadcrumbs.push({
            id: allBuses[allCont[allSa[currentItemId].containerId].busId].id,
            name:
              allBuses[allCont[allSa[currentItemId].containerId].busId].name,
            type: 'buses',
            svgIcon: `bus`,
          });
          mainBreadcrumbs.push({
            id: allCont[allSa[currentItemId].containerId].id,
            name: allCont[allSa[currentItemId].containerId].name,
            type: 'containers',
            icon: `dns`,
          });
          return mainBreadcrumbs.concat({
            id: currentItemId,
            name: allSa[currentItemId].name,
            type: 'service-assemblies',
            svgIcon: `sa`,
          });
        } else if (url.includes('petals/shared-libraries')) {
          mainBreadcrumbs.push({
            id: allBuses[allCont[allSl[currentItemId].containerId].busId].id,
            name:
              allBuses[allCont[allSl[currentItemId].containerId].busId].name,
            type: 'buses',
            svgIcon: `bus`,
          });
          mainBreadcrumbs.push({
            id: allCont[allSl[currentItemId].containerId].id,
            name: allCont[allSl[currentItemId].containerId].name,
            type: 'containers',
            icon: `dns`,
          });
          return mainBreadcrumbs.concat({
            id: currentItemId,
            name: allSl[currentItemId].name,
            type: 'shared-libraries',
            svgIcon: `sl`,
          });
        }
      }
    }

    // services breadcrumbs
    if (url.includes('/workspaces/' + currentWorkspace.id + '/services')) {
      return [
        {
          id: currentWorkspace.id,
          name: currentWorkspace.name,
          type: 'workspaces',
          icon: 'folder',
        },
        {
          name: 'Service',
          type: 'category',
        },
      ];
    }
  }
);

// -----------------------------------------------------------

export function getCurrentWorkspace(store: IStore): IWorkspaceRow {
  return store.workspaces.byId[store.workspaces.selectedWorkspaceId];
}

const getCurrentWorkspaceUsersById = createSelector(
  (state: IStore) => getCurrentWorkspace(state).users,
  getUsersById,
  (usersWks, usersById): IWorkspaceUserRow[] => {
    return Object.values(usersWks.byId).reduce(
      (acc, user) => [
        ...acc,
        {
          id: user.id,
          name: usersWks.byId[user.id].name,
          adminWorkspace: usersWks.byId[user.id].adminWorkspace,
          deployArtifact: usersWks.byId[user.id].deployArtifact,
          lifecycleArtifact: usersWks.byId[user.id].lifecycleArtifact,
          isSavingUserPermissions:
            usersWks.byId[user.id].isSavingUserPermissions,
        },
      ],
      <IWorkspaceUserRow[]>[]
    );
  }
);

export function getCurrentWorkspaceUsers(
  store$: Store<IStore>
): Observable<IWorkspaceUserRow[]> {
  return store$.pipe(select(getCurrentWorkspaceUsersById));
}

export const getCurrentUserPermissions = createSelector(
  (
    state: IStore
  ): { [permissionId in keyof IWorkspaceUserPermissions]: boolean } =>
    getConnectedUser(state).workspacePermissions
);

export const getUsersNotInCurrentWorkspace = createSelector(
  getUsersAllIds,
  getUsersById,
  (state: IStore) => getCurrentWorkspace(state).users,
  (usersAllIds, usersById, currentWorkspaceUsersSe): IUserRow[] =>
    usersAllIds
      .filter(id => !currentWorkspaceUsersSe.byId[id])
      .map(id => usersById[id])
);

export function getServicesSearch(state: IStore): string {
  return state.workspaces.searchServices;
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

export interface TreeElement {
  level: number;
  expandable: boolean;
}

export interface WorkspaceElement {
  id: string;
  type: WorkspaceElementType;
  name: string;
  link?: string;
  state?: string;
  isReachable?: boolean;
  svgIcon?: string;
  icon?: string;
  cssClass: string;
  isFolded: boolean;
  children?: WorkspaceElement[];
}

export interface WorkspaceElementFlatNode
  extends TreeElement,
    WorkspaceElement {}

export const currentWorkspaceTree = createSelector(
  getSelectedWorkspaceId,
  getBusesAllIds,
  getBusesById,
  getContainersById,
  getComponentsById,
  getServiceUnitsById,
  getServiceAssembliesById,
  getSharedLibrariesById,
  (
    selectedWorkspaceId,
    busesAllIds,
    busesByIds,
    containersByIds,
    componentsByIds,
    serviceUnitsByIds,
    serviceAssembliesByIds,
    sharedLibrariesByIds
  ): WorkspaceElement[] => {
    const baseUrl = `/workspaces/${selectedWorkspaceId}/petals`;

    return busesAllIds
      .map(id => busesByIds[id])
      .map<WorkspaceElement>((bus: IBusRow) => ({
        id: bus.id,
        type: WorkspaceElementType.BUS,
        name: bus.name,
        link: `${baseUrl}/buses/${bus.id}`,
        isFolded: bus.isFolded,
        cssClass: `workspace-element-type-bus`,
        svgIcon: `bus`,

        children: bus.containers
          .map(id => containersByIds[id])
          .map<WorkspaceElement>((container: IContainerRow) => ({
            id: container.id,
            type: WorkspaceElementType.CONTAINER,
            name: container.name,
            link: `${baseUrl}/containers/${container.id}`,
            isReachable: container.isReachable,
            isFolded: container.isFolded,
            cssClass: `workspace-element-type-container`,
            icon: `dns`,

            children: !container.isReachable
              ? []
              : [
                  {
                    id: container.id,
                    type: WorkspaceElementType.COMPCATEGORY,
                    name: 'Components',
                    isFolded: container.isComponentsCategoryFolded,
                    cssClass: `workspace-element-type-category-components`,
                    children: container.components
                      .map(id => componentsByIds[id])
                      .map<WorkspaceElement>((component: IComponentRow) => ({
                        id: component.id,
                        type: WorkspaceElementType.COMPONENT,
                        name: component.name,
                        link: `${baseUrl}/components/${component.id}`,
                        state: component.state,
                        isFolded: component.isFolded,
                        cssClass: `workspace-element-type-component`,
                        svgIcon: `component`,

                        children: component.serviceUnits
                          .map(id => serviceUnitsByIds[id])
                          .map<WorkspaceElement>(
                            (serviceUnit: IServiceUnitRow) => ({
                              id: serviceUnit.id,
                              type: WorkspaceElementType.SERVICEUNIT,
                              name: serviceUnit.name,
                              link: `${baseUrl}/service-units/${
                                serviceUnit.id
                              }`,
                              state:
                                serviceAssembliesByIds[
                                  serviceUnit.serviceAssemblyId
                                ].state,
                              isFolded: serviceUnit.isFolded,
                              cssClass: `workspace-element-type-service-unit`,
                              svgIcon: `su`,
                              children: [],
                            })
                          ),
                      })),
                  },
                  {
                    id: container.id,
                    type: WorkspaceElementType.SACATEGORY,
                    name: 'Service Assemblies',
                    isFolded: container.isServiceAssembliesCategoryFolded,
                    cssClass: `workspace-element-type-category-service-assemblies`,
                    children: container.serviceAssemblies
                      .map(id => serviceAssembliesByIds[id])
                      .map<WorkspaceElement>(
                        (serviceAssembly: IServiceAssemblyRow) => ({
                          id: serviceAssembly.id,
                          type: WorkspaceElementType.SERVICEASSEMBLY,
                          name: serviceAssembly.name,
                          link: `${baseUrl}/service-assemblies/${
                            serviceAssembly.id
                          }`,
                          state: serviceAssembly.state,
                          isFolded: serviceAssembly.isFolded,
                          cssClass: `workspace-element-type-service-assembly`,
                          svgIcon: `sa`,
                          children: [],
                        })
                      ),
                  },
                  {
                    id: container.id,
                    type: WorkspaceElementType.SLCATEGORY,
                    name: 'Shared Libraries',
                    isFolded: container.isSharedLibrariesCategoryFolded,
                    cssClass: `workspace-element-type-category-shared-libraries`,
                    children: container.sharedLibraries
                      .map(id => sharedLibrariesByIds[id])
                      .map<WorkspaceElement>((sl: ISharedLibraryRow) => ({
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
);

export const getCurrentWorkspaceTreeFiltered = createSelector(
  currentWorkspaceTree,
  (state: IStore) => state.workspaces.searchPetals,
  (tree, search): WorkspaceElement[] => {
    if (typeof search !== 'string' || search === '') {
      return tree;
    }

    const escaped = escapeStringRegexp(search);

    return tree
      .map(e => filterElement(escaped.toLowerCase(), e))
      .filter(e => e !== null);
  }
);

function filterElement(
  filter: string,
  element: WorkspaceElement
): WorkspaceElement {
  if (
    element.name
      .toLowerCase()
      .trim()
      .match(filter)
  ) {
    return element;
  } else if (!element.children) {
    return null;
  } else {
    const es = element.children
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
