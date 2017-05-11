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

import { omit, flatMap, assign } from 'lodash';

import { IBusImport } from './../app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { Bus, BusInProgress, busesService, busesInProgressService } from './buses-mock';
import { users } from './backend-mock';

function toObj<A>(arr: { toObj: () => A }[]): A {
  return assign.apply({}, arr.map(c => c.toObj()));
}

// used in buses.service.mock
export const IMPORT_HTTP_ERROR_IP = 'IMPORT_HTTP_ERROR_IP';

// buses that can be imported
export const validContainers = [
  '192.168.0.1:7700'
];

export class Workspace {
  private static cpt = 0;
  public readonly id: string;
  public readonly name: string;
  public description: string;
  private readonly users: string[];
  private readonly buses = new Map<string, Bus>();
  private readonly busesInProgress = new Map<string, BusInProgress>();

  private static workspaceUsers(i: number) {
    switch (i) {
      case 1: return ['admin', 'bescudie', 'mrobert', 'cchevalier', 'vnoel'];
      default: return ['admin'];
    }
  }

  private static workspaceDescription(i: number) {
    switch (i) {
      case 0: return 'You can import a bus from the container **192.168.0.1:7700** to get a mock bus.';
      default: return 'Put some description in **markdown** for the workspace here.';
    }
  }

  constructor(name?: string) {
    const i = Workspace.cpt++;
    this.id = `idWks${i}`;
    this.name = name ? name : `Workspace ${i}`;
    this.description = Workspace.workspaceDescription(i);
    this.users = Workspace.workspaceUsers(i);
    // by default add 1 bus
    this.addBus();

    // and 2 buses in progress
    this.addBusInProgress();
    this.addBusInProgress();
  }

  toObj() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      users: this.users
    };
  }

  getBuses() {
    return Array.from(this.buses.values());
  }

  getBusesInProgress() {
    return Array.from(this.busesInProgress.values());
  }

  addBusInProgress(importData?: IBusImport) {
    const bus = busesInProgressService.create(this, importData);
    this.busesInProgress.set(bus.id, bus);

    return bus;
  }

  addBus() {
    const bus = busesService.create(this);
    this.buses.set(bus.id, bus);

    return bus;
  }

  tryAddBus(importData: IBusImport): { id: string, eventData: any } {
    const ipPort = `${importData.ip}:${importData.port}`;

    // this will return the data for the BUS_IMPORT_OK event
    if (validContainers.includes(ipPort)) {
      const bus = this.addBus();

      const containers = bus.getContainers();
      const components = flatMap(containers, c => c.getComponents());
      const serviceAssemblies = flatMap(containers, c => c.getServiceAssemblies());
      const serviceUnits = flatMap(components, c => c.getServiceUnits());

      const eventData = {
        buses: bus.toObj(),
        containers: toObj(containers),
        components: toObj(components),
        serviceAssemblies: toObj(serviceAssemblies),
        serviceUnits: toObj(serviceUnits)
      };

      return {
        id: bus.id,
        eventData
      };
    }

    // this will return the data for the BUS_IMPORT_ERROR event
    const bus = this.addBusInProgress(importData);

    return {
      id: bus.id,
      eventData: {
        ...bus.toObj()[bus.id],
        importError: `Can't connect to ${ipPort}`,
        id: bus.id
      }
    };
  }
}

export class Workspaces {
  // map to cache the created workspaces
  private readonly memoizedWorkspaces = new Map<string, { wks: Workspace, composedWks: any }>();

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
  private getWorkspaces(user: string) {
    const workspacesIds = Array.from(this.memoizedWorkspaces.keys());

    return workspacesIds.reduce((acc, workspaceId) => {
      const ws = this.getWorkspace(workspaceId).toObj();
      if (ws.users.includes(user)) {
        return {
          ...acc,
          // this is potentially big, so the backend des not return it here
          [workspaceId]: omit(ws, 'description')
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

  getWorkspaceOverview(id: string) {
    const workspace = this.getWorkspace(id).toObj();

    return { workspace, users };
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

    const containers = flatMap(buses, b => b.getContainers());
    const components = flatMap(containers, c => c.getComponents());
    const serviceAssemblies = flatMap(containers, c => c.getServiceAssemblies());
    const serviceUnits = flatMap(components, c => c.getServiceUnits());

    const composedWks = {
      workspace: newWorkspace.toObj(),
      users,
      busesInProgress: toObj(busesInProgress),
      buses: toObj(buses),
      containers: toObj(containers),
      components: toObj(components),
      serviceAssemblies: toObj(serviceAssemblies),
      serviceUnits: toObj(serviceUnits)
    };

    this.memoizedWorkspaces.set(newWorkspace.id, { wks: newWorkspace, composedWks });

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
