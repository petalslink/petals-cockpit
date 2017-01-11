import { IServiceUnit } from './../service-units/service-unit.interface';
import { IComponent } from './../components/component.interface';
import { IContainer } from './../containers/container.interface';
import { IWorkspace } from './workspace.interface';
import { IBuses } from './../buses/buses.interface';
import { IBus } from './../buses/bus.interface';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IWorkspaces } from './workspaces.interface';
import { IStore } from './../../../../../shared/interfaces/store.interface';

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
      return <IWorkspaces>Object.assign({}, workspaces, <IWorkspaces>{
        list: workspaces.allIds.map(workspaceId => {
          return <IWorkspace>Object.assign({},
            workspaces.byId[workspaceId],
            <IWorkspace>{
              users: {
                list: workspaces.byId[workspaceId].users.map(userId => users.byId[userId])
              }
            }
          );
        })
      });
    });
}

export function getWorkspacesList() {
  return _getWorkspacesList;
}

// -----------------------------------------------------------

export function _getCurrentWorkspace(store$: Store<IStore>): Observable<IWorkspace> {
  const sWorkspaces = store$.select((state: IStore) => state.workspaces);
  const sUsers = store$.select((state: IStore) => state.users);
  const sBuses = store$.select((state: IStore) => state.buses);
  const sContainers = store$.select((state: IStore) => state.containers);
  const sComponents = store$.select((state: IStore) => state.components);
  const sServiceUnits = store$.select((state: IStore) => state.serviceUnits);

  return sWorkspaces
    .filter(workspaces => workspaces.selectedWorkspaceId !== '')
    .withLatestFrom(sUsers, sBuses, sContainers, sComponents, sServiceUnits)
    .map(([workspaces, users, buses, containers, components, serviceUnits]) => {
      return <IWorkspace>{
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
          importingBus: buses.importingBus,
          list: workspaces.byId[workspaces.selectedWorkspaceId].buses.map(busId => {
            return <IBus>{
              id: buses.byId[busId].id,
              name: buses.byId[busId].name,

              containers: {
                selectedContainerId: containers.selectedContainerId,
                list: buses.byId[busId].containers.map(containerId => {
                  return <IContainer>{
                    id: containers.byId[containerId].id,
                    name: containers.byId[containerId].name,

                    components: {
                      selectedComponentId: components.selectedComponentId,
                      list: containers.byId[containerId].components.map(componentId => {
                        return <IComponent>{
                          id: components.byId[componentId].id,
                          name: components.byId[componentId].name,

                          serviceUnits: {
                            selectedServiceUnitId: serviceUnits.selectedServiceUnitId,
                            list: components.byId[componentId].serviceUnits.map(serviceUnitId => {
                              return serviceUnits.byId[serviceUnitId];
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
      let baseUrl = `/workspaces/${workspace.selectedWorkspaceId}/petals`;
      return workspace.buses.list.map(bus => {
        return {
          id: bus.id,
          name: bus.name,
          link: `${baseUrl}/buses/${bus.id}`,
          children: bus.containers.list.map(container => {
            return {
              id: container.id,
              name: container.name,
              link: `${baseUrl}/containers/${container.id}`,
              children: container.components.list.map(component => {
                return {
                  id: component.id,
                  name: component.name,
                  link: `${baseUrl}/components/${component.id}`,
                  children: component.serviceUnits.list.map(serviceUnit => {
                    return {
                      id: serviceUnit.id,
                      name: serviceUnit.name,
                      link: `${baseUrl}/service-units/${serviceUnit.id}`,
                    };
                  })
                };
              })
            };
          })
        };
      });
    });
}

export function getCurrentTree() {
  return _getCurrentTree;
}
