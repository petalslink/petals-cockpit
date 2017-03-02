import { IBusInProgress } from './../app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { Bus, BusInProgress, busesService, busesInProgressService } from './buses-mock';
import { Container } from './containers-mock';
import { Component } from './components-mock';
import { ServiceUnit } from './service-units-mock';

export class Workspace {
  private static _cpt = 0;
  private _id: number;
  private _name: string;
  private _buses: Bus[] = [];
  private _busesInProgress: BusInProgress[] = [];

  private firstErrorSent = false;

  constructor(name?: string) {
    this._id = Workspace._cpt++;

    this._name = name;

    // by default add 1 bus
    this._buses.push(busesService.create());

    // and 2 buses in progress
    this._busesInProgress.push(busesInProgressService.create());
    this._busesInProgress.push(busesInProgressService.create());
  }

  public getIdFormatted() {
    return `idWks${this._id}`;
  }

  public toObj() {
    return {
      id: this.getIdFormatted(),
      name: this._name || `Workspace ${this._id}`,
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
    return this._buses;
  }

  public getBusesInProgress() {
    return this._busesInProgress;
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

    this._buses.push(bus);

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
const users = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    username: 'admin'
  },
  bescudie: {
    id: 'bescudie',
    name: 'Bertrand ESCUDIE',
    username: 'bescudie'
  },
  mrobert: {
    id: 'mrobert',
    name: 'Maxime ROBERT',
    username: 'mrobert'
  },
  cchevalier: {
    id: 'cchevalier',
    name: 'Christophe CHEVALIER',
    username: 'cchevalier'
  },
  vnoel: {
    id: 'vnoel',
    name: 'Victor NOEL',
    username: 'vnoel'
  }
};

export class Workspaces {
  // map to cache the created workspaces
  private _memoizedWorkspaces = new Map<string, { wks: Workspace, composedWks: any }>();

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
    return this._memoizedWorkspaces.get(idWks).wks;
  }

  /**
   * getWorkspaces
   *
   * @export
   * @returns {any} the workspaces list
   */
  getWorkspaces() {
    const workspacesIds = Array.from(this._memoizedWorkspaces.keys());

    return workspacesIds.reduce((acc, workspaceId) => {
      return {
        ...acc,
        [workspaceId]: this.getWorkspace(workspaceId).toObj()
      };
    }, {});
  }

  /**
   * getWorkspacesListAndUsers
   *
   * @export
   * @returns {any} the workspaces list and users
   */
  getWorkspacesListAndUsers() {
    const workspaces = this.getWorkspaces();

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
      if (this._memoizedWorkspaces.has(idWks)) {
        return { ...this._memoizedWorkspaces.get(idWks).composedWks };
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

    this._memoizedWorkspaces.set(newWorkspace.getIdFormatted(), { wks: newWorkspace, composedWks });

    return { ...composedWks };
  };

  getNewWorkspace(name: string) {
    const wksComposed = this.getWorkspaceComposed(undefined, name);
    return wksComposed.workspace;
  }
}

export const workspacesService = new Workspaces();
