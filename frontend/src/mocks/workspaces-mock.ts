import { IBusInProgress } from './../app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { Bus, BusInProgress, busesService, busesInProgressService } from './buses-mock';
import { Container } from './containers-mock';
import { Component } from './components-mock';
import { ServiceUnit } from './service-units-mock';

export class Workspace {
  private static cpt = 0;
  private id: number;
  private name: string;
  private buses: Bus[] = [];
  private busesInProgress: BusInProgress[] = [];

  private firstErrorSent = false;

  constructor(name?: string) {
    this.id = Workspace.cpt++;

    this.name = name;

    // by default add 1 bus
    this.buses.push(busesService.create());

    // and 2 buses in progress
    this.busesInProgress.push(busesInProgressService.create());
    this.busesInProgress.push(busesInProgressService.create());
  }

  public getIdFormatted() {
    return `idWks${this.id}`;
  }

  public toObj() {
    return {
      id: this.getIdFormatted(),
      name: this.name || `Workspace ${this.id}`,
      users: this.workspaceUsers()
    };
  }

  private workspaceUsers() {
    switch (this.getIdFormatted()) {
      case 'idWks1': return ['admin', 'bescudie', 'mrobert', 'cchevalier', 'vnoel'];
      default: return ['admin'];
    }
  }

  public getBuses() {
    return this.buses;
  }

  public getBusesInProgress() {
    return this.busesInProgress;
  }

  public addBus(busInProgress: IBusInProgress): { id: string, eventData: any } {
    // we fail the first time, for the demo
    if (!this.firstErrorSent) {
      this.firstErrorSent = true;

      const bus = busesInProgressService.create(busInProgress);

      return {
        id: bus.getIdFormatted(),
        eventData: {
          ...bus.toObj()[bus.getIdFormatted()],
          ...{ importError: `Can't connect to bus` }
        }
      };
    }

    const bus = busesService.create();

    this.buses.push(bus);

    const containers = bus.getContainers();
    const components = containers.reduce((acc: Component[], container) => [...acc, ...container.getComponents()], []);
    const serviceUnits = components.reduce((acc: ServiceUnit[], component) => [...acc, ...component.getServiceUnits()], []);

    const eventData = {
      buses: bus.toObj(),

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

    return {
      id: bus.getIdFormatted(),
      eventData
    };
  }
}

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
  getWorkspace(idWks: string) {
    return this.memoizedWorkspaces.get(idWks).wks;
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
   * @param {string} idWks The workspace id you're looking for
   * @returns {any} the workspace composed
   */
  getWorkspaceComposed(idWks?: string, name?: string) {
    if (idWks) {
      if (this.memoizedWorkspaces.has(idWks)) {
        return { ...this.memoizedWorkspaces.get(idWks).composedWks };
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

    this.memoizedWorkspaces.set(newWorkspace.getIdFormatted(), { wks: newWorkspace, composedWks });

    return { ...composedWks };
  };

  getNewWorkspace(name: string) {
    const wksComposed = this.getWorkspaceComposed(undefined, name);
    return wksComposed.workspace;
  }
}

export const workspacesService = new Workspaces();
