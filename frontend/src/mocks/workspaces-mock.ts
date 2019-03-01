/**
 * Copyright (C) 2017-2019 Linagora
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

import { IBusImport } from '@shared/services/buses.service';
import { IUserBackend } from '@shared/services/users.service';
import {
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
} from '@shared/services/workspaces.service';

import { validContainers } from './backend-mock';
import {
  Bus,
  busesInProgressService,
  busesService,
  BusInProgress,
} from './buses-mock';
import { Endpoint, endpointsService } from './endpoints-mock';
import { Interface, interfacesService } from './interfaces-mock';
import { Service, servicesService } from './services-mock';
import { BackendUser } from './users-mock';

function toObj<A>(arr: { toObj: () => A }[]): A {
  return assign.apply({}, arr.map(c => c.toObj()));
}

export class Workspace {
  private static cpt = 0;
  public readonly id: string;
  public readonly name: string;
  public shortDescription: string;
  public description: string;
  private readonly users = new Map<string, BackendUser>();
  private readonly buses = new Map<string, Bus>();
  private readonly busesInProgress = new Map<string, BusInProgress>();
  private readonly interfaces = new Map<string, Interface>();
  private readonly services = new Map<string, Service>();
  private readonly endpoints = new Map<string, Endpoint>();

  constructor(
    users: string[] = ['admin'],
    name?: string,
    shortDescription?: string,
    description?: string
  ) {
    const i = Workspace.cpt++;
    this.id = `idWks${i}`;
    this.name = name ? name : `Workspace ${i}`;
    this.shortDescription = shortDescription
      ? shortDescription
      : 'No description provided.';
    this.description = description
      ? description
      : 'Put some description in **markdown** for the workspace here.';
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
        shortDescription: this.shortDescription,
        description: this.description,
        users: this.getUsersIds(),
      },
      users: toObj(this.getUsers()),
    };
  }

  toObj(): { [id: string]: IWorkspaceBackend } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        users: this.getUsersIds(),
        shortDescription: this.shortDescription,
        description: this.description,
      },
    };
  }

  getUsersIds() {
    return Array.from(this.users.keys());
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getInterfacesIds() {
    return Array.from(this.interfaces.keys());
  }

  getInterfaces() {
    return Array.from(this.interfaces.values());
  }

  getMoreInterfaces(nbInterfaces: number) {
    let i: number;
    for (i = 0; i < nbInterfaces; i++) {
      const interfaceI = interfacesService.create(['idComp0']);
      this.interfaces.set(interfaceI.id, interfaceI);
    }
    return Array.from(this.interfaces.values());
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
      const serviceI = servicesService.create(['idComp0']);
      this.services.set(serviceI.id, serviceI);
    }
    return Array.from(this.services.values());
  }

  getEndpointsIds() {
    return Array.from(this.endpoints.keys());
  }

  getEndpoints() {
    return Array.from(this.endpoints.values());
  }

  getMoreEndpoints(nbEndpoints: number) {
    let i: number;
    for (i = 0; i < nbEndpoints; i++) {
      const endpointI = endpointsService.create('idComp0');
      this.endpoints.set(endpointI.id, endpointI);
    }
    return Array.from(this.endpoints.values());
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

    let interfaces = this.getInterfaces();
    let services = this.getServices();
    let endpoints = this.getEndpoints();
    if (this.buses.size > 1) {
      interfaces = this.getMoreInterfaces(6);
      services = this.getMoreServices(6);
      endpoints = this.getMoreEndpoints(2);
    }
    const sharedLibraries = flatMap(containers, c => c.getSharedLibraries());

    const eventData = {
      buses: bus.toObj(),
      containers: toObj(containers),
      components: toObj(components),
      endpoints: toObj(endpoints),
      interfaces: toObj(interfaces),
      serviceAssemblies: toObj(serviceAssemblies),
      serviceUnits: toObj(serviceUnits),
      services: toObj(services),
      sharedLibraries: toObj(sharedLibraries),
    };

    return { id: bus.id, eventData };
  }

  makeServicesForComp0() {
    const interfaces = new Map<string, Interface>();
    const services = new Map<string, Service>();
    const endpoints = new Map<string, Endpoint>();

    const newInterface1 = interfacesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart97'
    );
    interfaces.set(newInterface1.id, newInterface1);

    const newInterface2 = interfacesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/interface/technique/version/2.0}Interface-Localpart97'
    );
    interfaces.set(newInterface2.id, newInterface2);

    const newService1 = servicesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/service/technique/version/1.0}Localpart97'
    );
    services.set(newService1.id, newService1);

    const newService2 = servicesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/service/technique/version/2.0}Localpart97'
    );
    services.set(newService2.id, newService2);

    const newEndpoint = endpointsService.create(
      'idComp1',
      'edpt-13f82663-test-91i4-a147-3'
    );
    endpoints.set(newEndpoint.id, newEndpoint);

    const newEndpoint1 = endpointsService.create(
      'idComp1',
      'edpt-13f82663-test-91i4-a147-1'
    );
    endpoints.set(newEndpoint1.id, newEndpoint1);

    return this.makeEventData(interfaces, services, endpoints);
  }

  makeServicesForComp1() {
    const interfaces = new Map<string, Interface>();
    const services = new Map<string, Service>();
    const endpoints = new Map<string, Endpoint>();

    const newInterface1 = interfacesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/interface/technique/environmental/international/version/1.0}Interface-Localpart98'
    );
    interfaces.set(newInterface1.id, newInterface1);

    const newInterface2 = interfacesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/interface/technique/environmental/international/version/1.0}Interface-Localpart99'
    );
    interfaces.set(newInterface2.id, newInterface2);

    const newInterface3 = interfacesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/interface/technique/environmental/region/pays/international/version/1.0}Interface-Localpart96'
    );
    interfaces.set(newInterface3.id, newInterface3);

    const newInterface4 = interfacesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/interface/technique/global/region/pays/international/version/1.0}Interface-Localpart97'
    );
    interfaces.set(newInterface4.id, newInterface4);

    const newService1 = servicesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/service/technique/environmental/international/version/1.0}Localpart98'
    );
    services.set(newService1.id, newService1);

    const newService2 = servicesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/service/technique/environmental/international/version/1.0}Localpart99'
    );
    services.set(newService2.id, newService2);

    const newService3 = servicesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/service/technique/environmental/region/pays/international/version/1.0}Localpart96'
    );
    services.set(newService3.id, newService3);

    const newService4 = servicesService.create(
      ['idComp1'],
      '{http://namespace-example.fr/service/technique/global/region/pays/international/version/1.0}Localpart97'
    );
    services.set(newService4.id, newService4);

    const newEndpoint1 = endpointsService.create(
      'idComp1',
      'edpt-13f82663-test-91i4-a147-2'
    );
    endpoints.set(newEndpoint1.id, newEndpoint1);

    const newEndpoint2 = endpointsService.create(
      'idComp1',
      'edpt-13f82663-test-91i4-a147-3'
    );
    endpoints.set(newEndpoint2.id, newEndpoint2);

    return this.makeEventData(interfaces, services, endpoints);
  }

  makeServicesForComp2() {
    const interfaces = new Map<string, Interface>();
    const services = new Map<string, Service>();
    const endpoints = new Map<string, Endpoint>();
    return this.makeEventData(interfaces, services, endpoints);
  }

  makeEventData(
    interfaces: Map<string, Interface>,
    services: Map<string, Service>,
    endpoints: Map<string, Endpoint>
  ) {
    if (this.id === 'idWks0') {
      const eventData = {
        buses: {},
        containers: {},
        components: {},
        endpoints: toObj(Array.from(endpoints.values())),
        interfaces: toObj(Array.from(interfaces.values())),
        serviceAssemblies: {},
        serviceUnits: {},
        services: toObj(Array.from(services.values())),
        sharedLibraries: {},
      };

      return { eventData };
    }
  }

  addInterfaces() {
    const interface0 = interfacesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart0'
    );
    const interface1 = interfacesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart1'
    );
    const interface2 = interfacesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/interface/technique/version/2.0}Interface-Localpart2'
    );
    const interface3 = interfacesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/interface/technique/version/3.0}Interface-Localpart3'
    );
    const interface4 = interfacesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/interface/technique/version/3.0}Interface-Localpart4'
    );
    const interface5 = interfacesService.create(
      ['idComp6'],
      '{http://namespace-example.fr/interface/metiers/version/1.0}Interface-Localpart0'
    );
    const interface6 = interfacesService.create(
      ['idComp6'],
      '{http://namespace-example.fr/interface/metiers/version/1.0}Interface-Localpart1'
    );

    if (this.id === 'idWks1') {
      this.interfaces.set(interface5.id, interface5);
      this.interfaces.set(interface6.id, interface6);
    } else {
      this.interfaces.set(interface0.id, interface0);
      this.interfaces.set(interface1.id, interface1);
      this.interfaces.set(interface2.id, interface2);
      this.interfaces.set(interface3.id, interface3);
      this.interfaces.set(interface4.id, interface4);
    }
  }

  addEndpoints() {
    const endpoint0 = endpointsService.create(
      'idComp0',
      'edpt-89p82661-test-31o4-l391-00'
    );
    const endpoint1 = endpointsService.create(
      'idComp0',
      'edpt-89p82661-test-31o4-l391-01'
    );
    const endpoint2 = endpointsService.create(
      'idComp0',
      'edpt-89p82661-test-31o4-l391-02'
    );
    const endpoint3 = endpointsService.create(
      'idComp0',
      'edpt-89p82661-test-31o4-l391-03'
    );
    const endpoint4 = endpointsService.create(
      'idComp0',
      'edpt-89p82661-test-31o4-l391-04'
    );
    const endpoint5 = endpointsService.create(
      'idComp6',
      'edpt-89p82661-test-31o4-l391-05'
    );
    const endpoint6 = endpointsService.create(
      'idComp6',
      'edpt-89p82661-test-31o4-l391-06'
    );

    if (this.id === 'idWks1') {
      this.endpoints.set(endpoint5.id, endpoint5);
      this.endpoints.set(endpoint6.id, endpoint6);
    } else {
      this.endpoints.set(endpoint0.id, endpoint0);
      this.endpoints.set(endpoint1.id, endpoint1);
      this.endpoints.set(endpoint2.id, endpoint2);
      this.endpoints.set(endpoint3.id, endpoint3);
      this.endpoints.set(endpoint4.id, endpoint4);
    }
  }

  addServices() {
    const service0 = servicesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/service/technique/version/1.0}Localpart0'
    );
    const service1 = servicesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/service/technique/version/1.0}Localpart1'
    );
    const service2 = servicesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/service/technique/version/2.0}Localpart2'
    );
    const service3 = servicesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/service/technique/version/3.0}Localpart3'
    );
    const service4 = servicesService.create(
      ['idComp0'],
      '{http://namespace-example.fr/service/technique/version/3.0}Localpart4'
    );
    const service5 = servicesService.create(
      ['idComp6'],
      '{http://namespace-example.fr/service/metiers/version/1.0}Localpart0'
    );
    const service6 = servicesService.create(
      ['idComp6'],
      '{http://namespace-example.fr/service/metiers/version/1.0}Localpart1'
    );

    if (this.id === 'idWks1') {
      this.services.set(service5.id, service5);
      this.services.set(service6.id, service6);
    } else {
      this.services.set(service0.id, service0);
      this.services.set(service1.id, service1);
      this.services.set(service2.id, service2);
      this.services.set(service3.id, service3);
      this.services.set(service4.id, service4);
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
    const endpoints = this.getEndpoints();
    const interfaces = this.getInterfaces();
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
      endpoints: toObj(endpoints),
      interfaces: toObj(interfaces),
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

  create(
    users?: string[],
    name?: string,
    shortDescription?: string,
    description?: string
  ) {
    const ws = new Workspace(users, name, shortDescription, description);
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

  getRefreshedServices() {
    return refreshedServices;
  }
}

export const workspacesService = new Workspaces();

const ws0 = workspacesService.create();
ws0.shortDescription = 'This is short description for the Workspace 0.';
ws0.description =
  'You can import a bus from the container **192.168.0.1:7700** to get a mock bus.';

// add 5 interfaces, 5 services and 2 endpoints
ws0.addInterfaces();
ws0.addServices();
ws0.addEndpoints();

const ws1 = workspacesService.create([
  'admin',
  'adminldap',
  'bescudie',
  'mrobert',
  'cchevalier',
  'vnoel',
]);

// add 2 interfaces, 2 services and 2 endpoints
ws1.addInterfaces();
ws1.addServices();
ws1.addEndpoints();

const refreshedServices = {
  endpoints: {
    refreshedEndpoint0: {
      id: 'refreshedEndpoint0',
      name: 'edpt-89p82661-refr-31o4-l391-00',
      componentId: 'idComp0',
    },
    refreshedEndpoint1: {
      id: 'refreshedEndpoint1',
      name: 'edpt-89p82661-refr-31o4-l391-01',
      componentId: 'idComp0',
    },
  },
  interfaces: {
    refreshedInterface0: {
      id: 'refreshedInterface0',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-LocalpartRefreshed0',
      components: ['idComp0'],
    },
    refreshedInterface1: {
      id: 'refreshedInterface1',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-LocalpartRefreshed1',
      components: ['idComp0'],
    },
  },
  services: {
    idService1: {
      id: 'idService1',
      name:
        '{http://namespace-example.fr/service/metiers/version/1.0}Localpart1',
      components: ['idComp0'],
    },
    refreshedService0: {
      id: 'refreshedService0',
      name:
        '{http://namespace-example.fr/service/technique/version/1.0}LocalpartRefreshed0',
      components: ['idComp0'],
    },
    refreshedService1: {
      id: 'refreshedService1',
      name:
        '{http://namespace-example.fr/service/technique/version/1.0}LocalpartRefreshed1',
      components: ['idComp0'],
    },
  },
};
