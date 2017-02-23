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

import { IWorkspaces, IWorkspacesTable } from './workspaces.interface';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IserviceUnitsTable } from '../service-units/service-units.interface';
import { IComponentsTable } from '../components/components.interface';
import { IContainersTable } from '../containers/containers.interface';
import { IUsersTable } from '../../../../../shared/interfaces/users.interface';
import { IServiceUnit } from '../service-units/service-unit.interface';
import { IComponent } from '../components/component.interface';
import { IContainer } from '../containers/container.interface';
import { IWorkspace } from './workspace.interface';
import { IBuses, IBusesTable } from '../buses/buses.interface';
import { IBus } from '../buses/bus.interface';
import { escapeStringRegexp } from '../../../../../shared/helpers/shared.helper';

export function _getWorkspacesList(store$: Store<IStore>): Observable<IWorkspaces> {
  const sWorkspaces = store$.select((state: IStore) => state.workspaces);
  const sUsers = store$.select((state: IStore) => state.users);
  const sBuses = store$.select((state: IStore) => state.buses);
  const sContainers = store$.select((state: IStore) => state.containers);
  const sComponents = store$.select((state: IStore) => state.components);
  const sServiceUnits = store$.select((state: IStore) => state.serviceUnits);

  return sWorkspaces
    .withLatestFrom(sUsers, sBuses, sContainers, sComponents, sServiceUnits)
    .map(([workspaces, users, buses, containers, components, serviceUnits]) => {
      return <IWorkspaces>{
        ...workspaces,
        ...<IWorkspaces>{
          list: workspaces.allIds.map(workspaceId => {
            return <IWorkspace>{
              ...workspaces.byId[workspaceId],
              ...<IWorkspace>{
                users: {
                  list: workspaces.byId[workspaceId].users.map(userId => users.byId[userId])
                }
              }
            };
          }
          )
        }
      };
    });
}

export function getWorkspacesList() {
  return _getWorkspacesList;
}

// -----------------------------------------------------------

export function _getCurrentWorkspace(store$: Store<IStore>): Observable<IWorkspace> {
  return store$.select(state => {
    return {
      workspaces: state.workspaces,
      users: state.users,
      buses: state.buses,
      containers: state.containers,
      components: state.components,
      serviceUnits: state.serviceUnits
    };
  })
    // as the object has a new reference every time,
    // use distinctUntilChanged for performance
    .distinctUntilChanged((p, n) =>
      p.workspaces === n.workspaces &&
      p.users === n.users &&
      p.buses === n.buses &&
      p.containers === n.containers &&
      p.components === n.components &&
      p.serviceUnits === n.serviceUnits
    )
    .filter(({ workspaces }) => workspaces.selectedWorkspaceId !== '')
    .map(({workspaces, users, buses, containers, components, serviceUnits}) => {
      return {
        id: workspaces.byId[workspaces.selectedWorkspaceId].id,
        name: workspaces.byId[workspaces.selectedWorkspaceId].name,
        selectedWorkspaceId: workspaces.selectedWorkspaceId,
        isAddingWorkspace: workspaces.isAddingWorkspace,
        isFetchingWorkspaces: workspaces.isFetchingWorkspaces,
        fetchingWorkspaceWithId: workspaces.fetchingWorkspaceWithId,
        searchPetals: workspaces.searchPetals,

        users: {
          list: workspaces.byId[workspaces.selectedWorkspaceId].users.map(userId => users.byId[userId])
        },

        buses: {
          selectedBusId: buses.selectedBusId,
          list: buses.allIds.map(busId => {
            return <IBus>{
              id: buses.byId[busId].id,
              name: buses.byId[busId].name,
              isFolded: buses.byId[busId].isFolded || false,

              containers: {
                selectedContainerId: containers.selectedContainerId,
                list: buses.byId[busId].containers.map(containerId => {
                  return <IContainer>{
                    id: containers.byId[containerId].id,
                    name: containers.byId[containerId].name,
                    isFolded: containers.byId[containerId].isFolded || false,

                    components: {
                      selectedComponentId: components.selectedComponentId,
                      list: containers.byId[containerId].components.map(componentId => {
                        return <IComponent>{
                          id: components.byId[componentId].id,
                          name: components.byId[componentId].name,
                          isFolded: components.byId[componentId].isFolded || false,

                          serviceUnits: {
                            selectedServiceUnitId: serviceUnits.selectedServiceUnitId,
                            list: components.byId[componentId].serviceUnits.map(serviceUnitId => {
                              return {
                                id: serviceUnits.byId[serviceUnitId].id,
                                name: serviceUnits.byId[serviceUnitId].name,
                                isFolded: serviceUnits.byId[serviceUnitId].isFolded || false
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
          })
        }
      };
    });
}

export function getCurrentWorkspace() {
  return _getCurrentWorkspace;
}

// -----------------------------------------------------------

export function _getCurrentTree(store$: Store<IStore>) {
  return _getCurrentWorkspace(store$)
    .map(workspace => {
      const baseUrl = `/workspaces/${workspace.selectedWorkspaceId}/petals`;
      return workspace.buses.list.map(bus => {
        return {
          id: bus.id,
          typeId: 'busId',
          name: bus.name,
          link: `${baseUrl}/buses/${bus.id}`,
          isFolded: bus.isFolded,

          children: bus.containers.list.map(container => {
            return {
              id: container.id,
              typeId: 'containerId',
              name: container.name,
              link: `${baseUrl}/containers/${container.id}`,
              isFolded: container.isFolded,

              children: container.components.list.map(component => {
                return {
                  id: component.id,
                  typeId: 'componentId',
                  name: component.name,
                  link: `${baseUrl}/components/${component.id}`,
                  isFolded: component.isFolded,

                  children: component.serviceUnits.list.map(serviceUnit => {
                    return {
                      id: serviceUnit.id,
                      typeId: 'serviceUnitId',
                      name: serviceUnit.name,
                      link: `${baseUrl}/service-units/${serviceUnit.id}`,
                      isFolded: serviceUnit.isFolded
                    };
                  })
                };
              })
            };
          })
        };
      });
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
