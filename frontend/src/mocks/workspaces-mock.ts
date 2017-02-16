import { omit } from 'underscore';

import { IBusInProgress } from './../app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { Bus, BusInProgress, busesService, busesInProgressService } from './buses-mock';
import { containersService, Container } from './containers-mock';
import { Component } from './components-mock';
import { ServiceUnit } from './service-units-mock';

export class Workspace {
  private static _cpt = 0;
  private _id: number;
  private _buses: Bus[] = [];
  private _busesInProgress: BusInProgress[] = [];

  private firstErrorSent = false;

  constructor() {
    this._id = Workspace._cpt++;

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
      name: `Workspace ${this._id}`,
      users: [`bescudie`]
    };
  }

  public getBuses() {
    return this._buses;
  }

  public getBusesInProgress() {
    return this._busesInProgress;
  }

  public addBus(busInProgress: IBusInProgress): {id: string, eventData: any} {
    // we fail the first time, for the demo
    if (!this.firstErrorSent) {
      this.firstErrorSent = true;

      const bus = busesInProgressService.create(busInProgress);

      return {
        id: bus.getIdFormatted(),
        eventData: Object.assign({}, bus.toObj()[bus.getIdFormatted()], {
          importError: `Can't connect to bus`
        })
      };
    }

    const bus = busesService.create();

    this._buses.push(bus);

    const containers = bus.getContainers();
    const components = containers.reduce((acc: Component[], container) => [...acc, ...container.getComponents()], []);
    const serviceUnits = components.reduce((acc: ServiceUnit[], component) => [...acc, ...component.getServiceUnits()], []);

    const eventData = {
      buses: bus.toObj(),

      containers: containers.reduce((acc, container) => Object.assign({}, acc, container.toObj()), {}),

      components: components.reduce((acc, component) => Object.assign({}, acc, component.toObj()), {}),

      serviceUnits: serviceUnits.reduce((acc, serviceUnit) => Object.assign({}, acc, serviceUnit.toObj()), {})
    };

    return {
      id: bus.getIdFormatted(),
      eventData
    };
  }
}

export class Workspaces {
  private _currentWorkspace;

  // map to cache the created workspaces
  private _memoizedWorkspaces = new Map<string, { wks: Workspace, composedWks: any }>();

  constructor() { }

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
  getWorkspaceComposed(idWks: string) {
    this._currentWorkspace = idWks;

    if (this._memoizedWorkspaces.has(idWks)) {
      return <Workspace>Object.assign({}, this._memoizedWorkspaces.get(idWks).composedWks);
    }

    const newWorkspace = new Workspace();

    const busesInProgress = newWorkspace.getBusesInProgress();
    const buses = newWorkspace.getBuses();
    const containers = buses.reduce((acc: Container[], bus) => [...acc, ...bus.getContainers()], []);
    const components = containers.reduce((acc: Component[], container) => [...acc, ...container.getComponents()], []);
    const serviceUnits = components.reduce((acc: ServiceUnit[], component) => [...acc, ...component.getServiceUnits()], []);

    const composedWks = {
      workspace: newWorkspace.toObj(),

      users: {
        admin: {
          name: 'Administrator',
          username: 'admin'
        }
      },

      busesInProgress: busesInProgress.reduce((acc, busInProgress) => Object.assign(acc, busInProgress.toObj()), {}),

      buses: buses.reduce((acc, bus) => Object.assign(acc, bus.toObj()), {}),

      containers: containers.reduce((acc, container) => Object.assign(acc, container.toObj()), {}),

      components: components.reduce((acc, component) => Object.assign(acc, component.toObj()), {}),

      serviceUnits: serviceUnits.reduce((acc, serviceUnit) => Object.assign(acc, serviceUnit.toObj()), {})
    };

    this._memoizedWorkspaces.set(idWks, { wks: newWorkspace, composedWks });

    return <Workspace>Object.assign({}, composedWks);
  };
}

export const workspacesService = new Workspaces();
