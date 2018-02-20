/**
 * Copyright (C) 2017-2018 Linagora
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

import assign from 'lodash-es/assign';
import flatMap from 'lodash-es/flatMap';

import { IBusImport } from 'app/shared/services/buses.service';
import { IUserBackend } from 'app/shared/services/users.service';
import {
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
} from 'app/shared/services/workspaces.service';
import { validContainers } from 'mocks/backend-mock';
import { Service, servicesService } from 'mocks/services-mock';
import { BackendUser } from 'mocks/users-mock';
import {
  Bus,
  busesInProgressService,
  busesService,
  BusInProgress,
} from './buses-mock';

function toObj<A>(arr: { toObj: () => A }[]): A {
  return assign.apply({}, arr.map(c => c.toObj()));
}

export class Workspace {
  private static cpt = 0;
  public readonly id: string;
  public readonly name: string;
  public description: string;
  private readonly users = new Map<string, BackendUser>();
  private readonly buses = new Map<string, Bus>();
  private readonly busesInProgress = new Map<string, BusInProgress>();
  private readonly services = new Map<string, Service>();

  constructor(users: string[] = ['admin'], name?: string) {
    const i = Workspace.cpt++;
    this.id = `idWks${i}`;
    this.name = name ? name : `Workspace ${i}`;
    this.description =
      'Put some description in **markdown** for the workspace here.';
    users.forEach(u => this.users.set(u, BackendUser.get(u)));

    // by default add 1 bus
    this.addBus();

    // and 2 buses in progress
    this.addBusInProgress();
    this.addBusInProgress();
  }

  deleteUser(id: string) {
    this.users.delete(id);
  }

  getDetails(): {
    workspace: IWorkspaceBackendDetails;
    users: { [id: string]: IUserBackend };
  } {
    return {
      workspace: {
        id: this.id,
        name: this.name,
        description: this.description,
        users: this.getUsersIds(),
      },
      users: toObj(this.getUsers()),
    };
  }

  toObj(): { [id: string]: IWorkspaceBackend } {
    return {
      [this.id]: { id: this.id, name: this.name, users: this.getUsersIds() },
    };
  }

  getUsersIds() {
    return Array.from(this.users.keys());
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getServicesIds() {
    return Array.from(this.services.keys());
  }

  getServices() {
    return Array.from(this.services.values());
  }

  getMoreServices(nbServices: number) {
    let i: number;
    for (i = 0; i < nbServices; i++) {
      const serviceI = servicesService.create('idCont0', 'idComp0');
      this.services.set(serviceI.id, serviceI);
    }
    return Array.from(this.services.values());
  }

  addUser(user: BackendUser) {
    this.users.set(user.id, user);
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  getBuses() {
    return Array.from(this.buses.values());
  }

  getBusesInProgress() {
    return Array.from(this.busesInProgress.values());
  }

  private addBusInProgress(importData?: IBusImport) {
    const bus = busesInProgressService.create(this, importData);
    this.busesInProgress.set(bus.id, bus);

    return bus;
  }

  private addBus() {
    const bus = busesService.create(this);
    this.buses.set(bus.id, bus);

    const containers = bus.getContainers();
    const components = flatMap(containers, c => c.getComponents());
    const serviceAssemblies = flatMap(containers, c =>
      c.getServiceAssemblies()
    );
    const serviceUnits = flatMap(components, c => c.getServiceUnits());

    let services = this.getServices();
    if (this.buses.size > 1) {
      services = this.getMoreServices(6);
    }
    const sharedLibraries = flatMap(containers, c => c.getSharedLibraries());

    const eventData = {
      buses: bus.toObj(),
      containers: toObj(containers),
      components: toObj(components),
      serviceAssemblies: toObj(serviceAssemblies),
      serviceUnits: toObj(serviceUnits),
      services: toObj(services),
      sharedLibraries: toObj(sharedLibraries),
    };

    return { id: bus.id, eventData };
  }

  makeServicesForComp0() {
    const services = new Map<string, Service>();

    const newService1 = servicesService.create(
      'idCont0',
      'idComp0',
      '{http://namespace-example.fr/service/technique/version/1.0}Localpart97'
    );
    services.set(newService1.id, newService1);

    const newService2 = servicesService.create(
      'idCont0',
      'idComp0',
      '{http://namespace-example.fr/service/technique/version/2.0}Localpart97'
    );
    services.set(newService2.id, newService2);

    return this.makeEventData(services);
  }

  makeServicesForComp1() {
    const services = new Map<string, Service>();

    const newService1 = servicesService.create(
      'idCont0',
      'idComp1',
      '{http://namespace-example.fr/service/technique/environmental/international/version/1.0}Localpart98'
    );
    services.set(newService1.id, newService1);

    const newService2 = servicesService.create(
      'idCont0',
      'idComp1',
      '{http://namespace-example.fr/service/technique/environmental/international/version/1.0}Localpart99'
    );
    services.set(newService2.id, newService2);

    const newService3 = servicesService.create(
      'idCont0',
      'idComp1',
      '{http://namespace-example.fr/service/technique/environmental/region/pays/internationalversion/1.0}Localpart96'
    );
    services.set(newService3.id, newService3);

    const newService4 = servicesService.create(
      'idCont0',
      'idComp1',
      '{http://namespace-example.fr/service/technique/global/region/pays/international/version/1.0}Localpart97'
    );
    services.set(newService4.id, newService4);

    return this.makeEventData(services);
  }

  makeServicesForComp2() {
    const services = new Map<string, Service>();
    return this.makeEventData(services);
  }

  makeEventData(services: Map<string, Service>) {
    if (this.id === 'idWks0') {
      const eventData = {
        buses: {},
        containers: {},
        components: {},
        serviceAssemblies: {},
        serviceUnits: {},
        services: toObj(Array.from(services.values())),
        sharedLibraries: {},
      };

      return { eventData };
    }
  }

  addServices() {
    const service0 = servicesService.create(
      'idCont0',
      'idComp0',
      '{http://namespace-example.fr/service/technique/version/1.0}Localpart0'
    );
    const service1 = servicesService.create(
      'idCont0',
      'idComp0',
      '{http://namespace-example.fr/service/technique/version/1.0}Localpart1'
    );
    const service2 = servicesService.create(
      'idCont0',
      'idComp0',
      '{http://namespace-example.fr/service/technique/version/2.0}Localpart2'
    );
    const service3 = servicesService.create(
      'idCont0',
      'idComp0',
      '{http://namespace-example.fr/service/technique/version/3.0}Localpart3'
    );
    const service4 = servicesService.create(
      'idCont0',
      'idComp0',
      '{http://namespace-example.fr/service/technique/version/3.0}Localpart4'
    );
    const service5 = servicesService.create(
      'idCont2',
      'idComp6',
      '{http://namespace-example.fr/service/metiers/version/1.0}Localpart0'
    );
    const service6 = servicesService.create(
      'idCont2',
      'idComp6',
      '{http://namespace-example.fr/service/metiers/version/1.0}Localpart1'
    );

    if (this.id === 'idWks1') {
      this.services.set(service5.id, service5);
      this.services.set(service6.id, service6);
      const services = this.getServices();
      const eventData = { services: toObj(services) };
      return [{ id: service5.id, eventData }, { id: service6.id, eventData }];
    } else {
      this.services.set(service0.id, service0);
      this.services.set(service1.id, service1);
      this.services.set(service2.id, service2);
      this.services.set(service3.id, service3);
      this.services.set(service4.id, service4);

      const services = this.getServices();
      const eventData = { services: toObj(services) };
      return [
        { id: service0.id, eventData },
        { id: service1.id, eventData },
        { id: service2.id, eventData },
        { id: service3.id, eventData },
        { id: service4.id, eventData },
      ];
    }
  }

  tryAddBus(importData: IBusImport): { id: string; eventData: any } {
    const ipPort = `${importData.ip}:${importData.port}`;

    // this will return the data for the BUS_IMPORT_OK event
    if (validContainers.includes(ipPort)) {
      return this.addBus();
    }

    // this will return the data for the BUS_IMPORT_ERROR event
    const bus = this.addBusInProgress(importData);

    return {
      id: bus.id,
      eventData: {
        ...bus.toObj()[bus.id],
        importError: `Can't connect to ${ipPort}`,
        id: bus.id,
      },
    };
  }

  toFullObj() {
    const buses = this.getBuses();

    const containers = flatMap(buses, b => b.getContainers());
    const components = flatMap(containers, c => c.getComponents());
    const serviceAssemblies = flatMap(containers, c =>
      c.getServiceAssemblies()
    );
    const serviceUnits = flatMap(components, c => c.getServiceUnits());
    const services = this.getServices();
    const sharedLibraries = flatMap(containers, c => c.getSharedLibraries());

    return {
      ...this.getDetails(),
      busesInProgress: toObj(this.getBusesInProgress()),
      buses: toObj(buses),
      containers: toObj(containers),
      components: toObj(components),
      serviceAssemblies: toObj(serviceAssemblies),
      serviceUnits: toObj(serviceUnits),
      services: toObj(services),
      sharedLibraries: toObj(sharedLibraries),
    };
  }
}

export class Workspaces {
  private readonly workspaces = new Map<string, Workspace>();

  get(id: string) {
    return this.workspaces.get(id);
  }

  getWorkspaces(user: string) {
    return Array.from(this.workspaces.values()).filter(ws =>
      ws.getUsersIds().includes(user)
    );
  }

  getWorkspacesListAndUsers(user: string) {
    const workspaces = this.getWorkspaces(user);
    return {
      workspaces: toObj(workspaces),
      users: toObj(flatMap(workspaces, w => w.getUsers())),
    };
  }

  create(users?: string[], name?: string) {
    const ws = new Workspace(users, name);
    this.workspaces.set(ws.id, ws);
    return ws;
  }

  delete(id: string) {
    const ws = this.get(id);
    ws.getUsers().forEach(u => {
      if (u.lastWorkspace === id) {
        u.lastWorkspace = null;
      }
    });
    this.workspaces.delete(id);
  }
}

export const workspacesService = new Workspaces();

const ws0 = workspacesService.create();
ws0.description =
  'You can import a bus from the container **192.168.0.1:7700** to get a mock bus.';

// add 5 services
ws0.addServices();

const ws1 = workspacesService.create([
  'admin',
  'bescudie',
  'mrobert',
  'cchevalier',
  'vnoel',
]);

// add 2 services
ws1.addServices();
