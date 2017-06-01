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

import { IWorkspaces, IWorkspace } from './workspaces.interface';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { escapeStringRegexp, arrayEquals, tuple } from '../../../../../shared/helpers/shared.helper';
import { IUser } from '../../../../../shared/interfaces/users.interface';
import { TreeElement } from 'app/features/cockpit/workspaces/petals-menu/material-tree/material-tree.component';

export function _getWorkspacesList(store$: Store<IStore>): Observable<IWorkspaces> {
  const sWorkspaces = store$.select((state: IStore) => state.workspaces);
  const sUsers = store$.select((state: IStore) => state.users);
  const sBuses = store$.select((state: IStore) => state.buses);

  return sWorkspaces
    .withLatestFrom(sUsers, sBuses)
    .map(([workspaces, users]) => {
      return {
        ...workspaces,
        ...<IWorkspaces>{
          list: workspaces.allIds.map(workspaceId => {
            return {
              ...workspaces.byId[workspaceId],
              ...<IWorkspace>{
                users: {
                  list: workspaces.byId[workspaceId].users.map(userId => <IUser>users.byId[userId])
                }
              }
            };
          })
        }
      };
    });
}

export function getWorkspacesList() {
  return _getWorkspacesList;
}

// -----------------------------------------------------------

/**
 * filter the store to only get the state if the current workspace is fetched.
 */
export function filterWorkspaceFetched(store$: Store<IStore>): Observable<IStore> {
  return store$
    .filter(state => state.workspaces.selectedWorkspaceId && state.workspaces.isSelectedWorkspaceFetched);
}

export function _getCurrentWorkspace(store$: Store<IStore>): Observable<IWorkspace> {
  return filterWorkspaceFetched(store$)
    .map(state => tuple([
      state.workspaces,
      state.users,
      state.buses,
      state.containers,
      state.components,
      state.serviceAssemblies,
      state.serviceUnits
    ]))
    // as the object has a new reference every time,
    // use distinctUntilChanged for performance
    .distinctUntilChanged(arrayEquals)
    .map(([workspaces, users, buses, containers, components, serviceAssemblies, serviceUnits]) => {
      const workspace = workspaces.byId[workspaces.selectedWorkspaceId];
      return {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        isRemoving: workspace.isRemoving,
        isSettingDescription: workspace.isSettingDescription,
        isFetchingDetails: workspace.isFetchingDetails,

        users: {
          connectedUserId: users.connectedUserId,
          isConnecting: users.isConnecting,
          isConnected: users.isConnected,
          isDisconnecting: users.isDisconnecting,
          connectionFailed: users.connectionFailed,
          list: workspace.users.map(userId => users.byId[userId])
        },

        buses: {
          selectedBusId: buses.selectedBusId,
          list: buses.allIds.map(busId => {
            const bus = buses.byId[busId];
            return {
              id: bus.id,
              workspaceId: bus.workspaceId,
              name: bus.name,
              isFetchingDetails: bus.isFetchingDetails,
              isFolded: bus.isFolded || false,

              containers: {
                selectedContainerId: containers.selectedContainerId,
                isFetchingDetails: containers.isFetchingDetails,
                list: bus.containers.map(containerId => {
                  const container = containers.byId[containerId];
                  return {
                    id: container.id,
                    busId: container.busId,
                    name: container.name,
                    ip: container.ip,
                    port: container.port,
                    systemInfo: container.systemInfo,
                    isFetchingDetails: container.isFetchingDetails,
                    isFolded: container.isFolded || false,
                    isDeployingComponent: container.isDeployingComponent,
                    errorDeploymentComponent: container.errorDeploymentComponent,
                    isDeployingServiceAssembly: container.isDeployingServiceAssembly,
                    errorDeploymentServiceAssembly: container.errorDeploymentServiceAssembly,

                    components: {
                      selectedComponentId: components.selectedComponentId,
                      isFetchingDetails: components.isFetchingDetails,
                      list: container.components.map(componentId => {
                        const component = components.byId[componentId];
                        return {
                          id: component.id,
                          containerId: component.containerId,
                          name: component.name,
                          state: component.state,
                          type: component.type,
                          parameters: component.parameters,
                          isFetchingDetails: component.isFetchingDetails,
                          isUpdatingState: component.isUpdatingState,
                          isDeployingServiceUnit: component.isDeployingServiceUnit,
                          isFolded: component.isFolded || false,
                          errorChangeState: component.errorChangeState,
                          errorDeployment: component.errorDeployment,

                          serviceUnits: {
                            selectedServiceUnitId: serviceUnits.selectedServiceUnitId,
                            isFetchingDetails: serviceUnits.isFetchingDetails,
                            list: component.serviceUnits.map(serviceUnitId => {
                              const serviceUnit = serviceUnits.byId[serviceUnitId];
                              return {
                                id: serviceUnit.id,
                                containerId: serviceUnit.containerId,
                                componentId: serviceUnit.componentId,
                                serviceAssemblyId: serviceUnit.serviceAssemblyId,
                                name: serviceUnit.name,
                                isUpdatingState: serviceUnit.isUpdatingState,
                                isFolded: serviceUnit.isFolded || false,
                                errorChangeState: serviceUnit.errorChangeState
                              };
                            })
                          }
                        };
                      })
                    },
                    serviceAssemblies: {
                      selectedServiceAssemblyId: serviceAssemblies.selectedServiceAssemblyId,
                      isFetchingDetails: serviceAssemblies.isFetchingDetails,
                      list: container.serviceAssemblies.map(serviceAssemblyId => {
                        const serviceAssembly = serviceAssemblies.byId[serviceAssemblyId];
                        return {
                          id: serviceAssembly.id,
                          name: serviceAssembly.name,
                          serviceUnits: serviceAssembly.serviceUnits,
                          containerId: serviceAssembly.containerId,
                          state: serviceAssembly.state,

                          isFolded: serviceAssembly.isFolded,
                          isUpdatingState: serviceAssembly.isUpdatingState,
                          errorChangeState: serviceAssembly.errorChangeState
                        };
                      })
                    }
                  };
                })
              }
            };
          })
        }
      };
    });
}

export function getCurrentWorkspace() {
  return _getCurrentWorkspace;
}

// -----------------------------------------------------------

export enum WorkspaceElementType {
  BUS, CONTAINER, COMPONENT, SERVICEASSEMBLY, SERVICEUNIT
}

export interface WorkspaceElement extends TreeElement<WorkspaceElement> {
  id: string;
  type: WorkspaceElementType;
  name: string;
}

export function _getCurrentTree(store$: Store<IStore>): Observable<WorkspaceElement[]> {
  return _getCurrentWorkspace(store$)
    .map(workspace => {
      const baseUrl = `/workspaces/${workspace.id}/petals`;
      return workspace.buses.list.map<WorkspaceElement>(bus => ({
        id: bus.id,
        type: WorkspaceElementType.BUS,
        name: bus.name,
        link: `${baseUrl}/buses/${bus.id}`,
        isFolded: bus.isFolded,
        cssClass: `workspace-element-type-bus`,

        children: bus.containers.list.map<WorkspaceElement>(container => ({
          id: container.id,
          type: WorkspaceElementType.CONTAINER,
          name: container.name,
          link: `${baseUrl}/containers/${container.id}`,
          isFolded: container.isFolded,
          cssClass: `workspace-element-type-container`,

          children: [
            ...container.serviceAssemblies.list.map<WorkspaceElement>(serviceAssembly => ({
              id: serviceAssembly.id,
              type: WorkspaceElementType.SERVICEASSEMBLY,
              name: serviceAssembly.name,
              link: `${baseUrl}/service-assemblies/${serviceAssembly.id}`,
              isFolded: serviceAssembly.isFolded,
              cssClass: `workspace-element-type-service-assembly`,
              children: []
            })),
            ...container.components.list.map<WorkspaceElement>(component => ({
              id: component.id,
              type: WorkspaceElementType.COMPONENT,
              name: component.name,
              link: `${baseUrl}/components/${component.id}`,
              isFolded: component.isFolded,
              cssClass: `workspace-element-type-component`,

              children: component.serviceUnits.list.map<WorkspaceElement>(serviceUnit => ({
                id: serviceUnit.id,
                type: WorkspaceElementType.SERVICEUNIT,
                name: serviceUnit.name,
                link: `${baseUrl}/service-units/${serviceUnit.id}`,
                isFolded: serviceUnit.isFolded,
                cssClass: `workspace-element-type-service-unit`,
                children: []
              }))
            }))
          ]
        }))
      }));
    })
    .withLatestFrom(store$.select(s => s.workspaces.searchPetals))
    .map(([tree, search]) => {
      if (typeof search !== 'string' || search === '') {
        return tree;
      }

      const escaped = escapeStringRegexp(search);

      return tree
        .map(e => filterElement(escaped.toLowerCase(), e))
        .filter(e => e !== null);
    });
}

export function filterElement(filter: string, element: any): any {
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
        children: es
      };
    }
  }
}

export function getCurrentTree() {
  return _getCurrentTree;
}
