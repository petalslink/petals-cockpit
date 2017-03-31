import { IBusImport } from './../app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { Bus, BusInProgress, busesService, busesInProgressService } from './buses-mock';
import { Container } from './containers-mock';
import { Component } from './components-mock';
import { ServiceUnit } from './service-units-mock';

// used in buses.service.mock
export const IMPORT_HTTP_ERROR_IP = 'IMPORT_HTTP_ERROR_IP';

// buses that can be imported
export const validContainers = [
  '192.168.0.1:7700'
];

// we don't need to manage CRUD operations on users and we don't have a class to handle them
// it would be completely overkill to put them in a separate file
export const users = {
  admin: {
    id: 'admin',
    name: 'Administrator'
  },
  bescudie: {
    id: 'bescudie',
    name: 'Bertrand ESCUDIE'
  },
  mrobert: {
    id: 'mrobert',
    name: 'Maxime ROBERT'
  },
  cchevalier: {
    id: 'cchevalier',
    name: 'Christophe CHEVALIER'
  },
  vnoel: {
    id: 'vnoel',
    name: 'Victor NOEL'
  }
};

export class Workspace {
  private static cpt = 0;
  private id: string;
  private name: string;
  private buses = new Map<string, Bus>();
  private busesInProgress = new Map<string, BusInProgress>();

  constructor(name?: string) {
    const i = Workspace.cpt++;
    this.id = `idWks${i}`;
    this.name = name ? name : `Workspace ${i}`;

    // by default add 1 bus
    this.addBus();

    // and 2 buses in progress
    this.addBusInProgress();
    this.addBusInProgress();
  }

  getId() {
    return this.id;
  }

  toObj() {
    return {
      id: this.id,
      name: this.name,
      message: 'You can import a bus from the container **192.168.0.1:7700** to get a mock bus.',
      users: this.workspaceUsers()
    };
  }

  private workspaceUsers() {
    switch (this.id) {
      case 'idWks1': return ['admin', 'bescudie', 'mrobert', 'cchevalier', 'vnoel'];
      default: return ['admin'];
    }
  }

  getBuses() {
    return Array.from(this.buses.values());
  }

  getBusesInProgress() {
    return Array.from(this.busesInProgress.values());
  }

  addBusInProgress(importData?: IBusImport) {
    const bus = busesInProgressService.create(importData);
    this.busesInProgress.set(bus.getId(), bus);

    return bus;
  }

  addBus() {
    const bus = busesService.create();
    this.buses.set(bus.getId(), bus);

    return bus;
  }

  tryAddBus(importData: IBusImport): { id: string, eventData: any } {
    const ipPort = `${importData.ip}:${importData.port}`;

    // this will return the data for the BUS_IMPORT_OK event
    if (validContainers.includes(ipPort)) {
      const bus = this.addBus();

      const containers = bus.getContainers();
      const components = containers.reduce((acc: Component[], container) => [...acc, ...container.getComponents()], []);
      const serviceUnits = components.reduce((acc: ServiceUnit[], component) => [...acc, ...component.getServiceUnits()], []);

      const eventData = {
        buses: bus.toObj(),
        containers: containers.reduce((acc, c) => ({ ...acc, ...c.toObj() }), {}),
        components: components.reduce((acc, c) => ({ ...acc, ...c.toObj() }), {}),
        serviceUnits: serviceUnits.reduce((acc, su) => ({ ...acc, ...su.toObj() }), {})
      };

      return {
        id: bus.getId(),
        eventData
      };
    }

    // this will return the data for the BUS_IMPORT_ERROR event
    const bus = this.addBusInProgress(importData);

    return {
      id: bus.getId(),
      eventData: {
        ...bus.toObj()[bus.getId()],
        importError: `Can't connect to ${ipPort}`,
        id: bus.getId()
      }
    };
  }
}

export class Workspaces {
  // map to cache the created workspaces
  private memoizedWorkspaces = new Map<string, { wks: Workspace, composedWks: any }>();

  constructor() {
    // generate 2 workspaces by default
    // pass undefined as name to auto generate it
    this.getNewWorkspace(undefined);
    this.getNewWorkspace(undefined);
  }

  /**
   * getWorkspace
   *
   * return the workspace which has an id `idWks`
   *
   * @export
   * @param {string} idWks The workspace id you're looking for
   * @returns {any} the workspace
   */
  getWorkspace(id: string) {
    return this.memoizedWorkspaces.get(id).wks;
  }

  /**
   * getWorkspaces
   *
   * @export
   * @returns {any} the workspaces list
   */
  getWorkspaces(user: string) {
    const workspacesIds = Array.from(this.memoizedWorkspaces.keys());

    return workspacesIds.reduce((acc, workspaceId) => {
      const ws = this.getWorkspace(workspaceId).toObj();
      if (ws.users.includes(user)) {
        return {
          ...acc,
          [workspaceId]: ws
        };
      } else {
        return acc;
      }
    }, {});
  }

  /**
   * getWorkspacesListAndUsers
   *
   * @export
   * @returns {any} the workspaces list and users
   */
  getWorkspacesListAndUsers(user: string) {
    const workspaces = this.getWorkspaces(user);

    return { workspaces, users };
  }

  /**
   * getWorkspaceComposed
   *
   * return the composed workspace which has an id `idWks`
   * if it already exists, will return the existing one
   * otherwise will create it with some default values
   *
   * @export
   * @param {string} id The workspace id you're looking for
   * @returns {any} the workspace composed
   */
  getWorkspaceComposed(id?: string, name?: string) {
    if (id) {
      if (this.memoizedWorkspaces.has(id)) {
        return { ...this.memoizedWorkspaces.get(id).composedWks };
      }
    }

    const newWorkspace = new Workspace(name);

    const busesInProgress = newWorkspace.getBusesInProgress();
    const buses = newWorkspace.getBuses();
    const containers = buses.reduce((acc: Container[], bus) => [...acc, ...bus.getContainers()], []);
    const components = containers.reduce((acc: Component[], container) => [...acc, ...container.getComponents()], []);
    const serviceUnits = components.reduce((acc: ServiceUnit[], component) => [...acc, ...component.getServiceUnits()], []);

    const composedWks = {
      workspace: newWorkspace.toObj(),

      users,

      busesInProgress: busesInProgress.reduce((acc, busInProgress) => {
        return {
          ...acc,
          ...busInProgress.toObj()
        };
      }, {}),

      buses: buses.reduce((acc, bus) => {
        return {
          ...acc,
          ...bus.toObj()
        };
      }, {}),

      containers: containers.reduce((acc, container) => {
        return {
          ...acc,
          ...container.toObj()
        };
      }, {}),

      components: components.reduce((acc, component) => {
        return {
          ...acc,
          ...component.toObj()
        };
      }, {}),

      serviceUnits: serviceUnits.reduce((acc, serviceUnit) => {
        return {
          ...acc,
          ...serviceUnit.toObj()
        };
      }, {})
    };

    this.memoizedWorkspaces.set(newWorkspace.getId(), { wks: newWorkspace, composedWks });

    return { ...composedWks };
  }

  getNewWorkspace(name: string) {
    const wksComposed = this.getWorkspaceComposed(undefined, name);
    return wksComposed.workspace;
  }

  deleteWorkspace(id: string) {
    this.memoizedWorkspaces.delete(id);
  }
}

export const workspacesService = new Workspaces();
