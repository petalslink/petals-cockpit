/**
 * Copyright (C) 2017-2020 Linagora
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

import { IWorkspaceUserRow } from '@feat/cockpit/workspaces/state/workspaces/workspaces.interface';
import { Component } from '@mocks/components-mock';
import { IBusImport } from '@shared/services/buses.service';
import {
  IWorkspaceBackend,
  IWorkspaceBackendCommon,
  IWorkspaceBackendDetails,
  IWorkspaceUserPermissionsBackend,
} from '@shared/services/workspaces.service';
import { IInterfaceBackendSSECommon } from './../app/shared/services/interfaces.service';
import { IServiceBackendSSECommon } from './../app/shared/services/services.service';
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
  public name: string;
  public shortDescription: string;
  public description: string;
  private readonly users = new Map<string, IWorkspaceUserRow>();
  private readonly buses = new Map<string, Bus>();
  private readonly busesInProgress = new Map<string, BusInProgress>();
  private interfaces: Interface[] = [];
  private services: Service[] = [];
  private endpoints: Endpoint[] = [];

  constructor(
    users: IWorkspaceUserRow[] = [
      {
        id: 'admin',
        name: 'Administrator',
        adminWorkspace: true,
        deployArtifact: true,
        lifecycleArtifact: true,
        isSavingUserPermissions: false,
      },
    ],
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
    users.forEach(user =>
      this.users.set(user.id, {
        id: BackendUser.get(user.id).id,
        name: BackendUser.get(user.id).name,
        adminWorkspace: user.adminWorkspace,
        deployArtifact: user.deployArtifact,
        lifecycleArtifact: user.lifecycleArtifact,
        isSavingUserPermissions: user.isSavingUserPermissions,
      })
    );

    // by default add 1 bus
    this.addBus();
  }

  deleteUser(id: string) {
    this.users.delete(id);
  }

  getDetails(): IWorkspaceBackendDetails {
    return {
      id: this.id,
      name: this.name,
      shortDescription: this.shortDescription,
      description: this.description,
      users: this.getUsers(),
    };
  }

  getContent(): IWorkspaceBackendCommon {
    return {
      id: this.id,
      name: this.name,
    };
  }

  toObj(): { [id: string]: IWorkspaceBackend } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        shortDescription: this.shortDescription,
        description: this.description,
        users: this.getUsersIds(),
      },
    };
  }

  getUsersIds() {
    return Array.from(this.users.keys());
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getUsersBackend() {
    return BackendUser.getAll()
      .filter(user => this.getUsersIds().includes(user.id))
      .map(userWks => {
        return { id: userWks.id, name: userWks.name, isAdmin: userWks.isAdmin };
      });
  }

  getInterfacesIds() {
    return this.interfaces.map(itf => itf.id);
  }

  getInterfaces() {
    return this.interfaces;
  }

  getServicesIds() {
    return this.services.map(svc => svc.id);
  }

  getServices() {
    return this.services;
  }

  getEndpointsIds() {
    return this.endpoints.map(edp => edp.id);
  }

  getEndpoints() {
    return this.endpoints;
  }

  // create 3 endpoints, 2 services, 2 interfaces
  getMoreServicesEndpoints() {
    const lastEndpointId = Math.max(
      ...this.endpoints.map(edp => parseInt(edp.id, 10))
    );
    const endpointId = lastEndpointId ? lastEndpointId + 1 : 1;

    const lastServiceId = Math.max(
      ...this.services.map(sv => parseInt(sv.id, 10))
    );
    const serviceId = lastServiceId ? lastServiceId + 1 : 1;

    const lastinterfaceId = Math.max(
      ...this.interfaces.map(itf => parseInt(itf.id, 10))
    );
    const interfaceId = lastinterfaceId ? lastinterfaceId + 1 : 1;

    const lastComponentId = Component.cpt - 6;

    const relationCouple3Endpoints = [
      {
        endpointId: endpointId,
        interfaces: [interfaceId],
        serviceId: serviceId,
      },
      {
        endpointId: endpointId + 1,
        interfaces: [interfaceId + 1],
        serviceId: serviceId + 1,
      },
      {
        endpointId: endpointId + 2,
        interfaces: [interfaceId + 1],
        serviceId: serviceId + 1,
      },
    ];

    relationCouple3Endpoints.forEach(edp => {
      edp.interfaces.forEach(idInt => {
        this.interfaces.push(
          interfacesService.create(
            idInt.toString(),
            ['idComp' + lastComponentId],
            '{http://namespace-example.fr/service/technique/version/5.0}moreInterface' +
              idInt
          )
        );
      });
    });

    const service1 = servicesService.create(
      serviceId.toString(),
      ['idComp' + lastComponentId],
      '{http://namespace-example.fr/service/metiers/version/7.0}moreService' +
        serviceId
    );

    const service2 = servicesService.create(
      (serviceId + 1).toString(),
      ['idComp' + lastComponentId],
      '{http://namespace-example.fr/service/metiers/version/8.0}moreService' +
        serviceId +
        1
    );

    this.services.push(service1);
    this.services.push(service2);

    relationCouple3Endpoints.forEach(edp => {
      const endpointI = endpointsService.create(
        edp.endpointId.toString(),
        edp.interfaces.map(id => id.toString()),
        edp.serviceId.toString(),
        'idComp' + lastComponentId,
        'moreEndpoint' + edp.endpointId
      );
      this.endpoints.push(endpointI);
    });
  }

  addUserWithPermissions(
    user: BackendUser,
    permissions: IWorkspaceUserPermissionsBackend
  ) {
    const userWks = {
      id: user.id,
      name: user.name,
      ...permissions,
      isSavingUserPermissions: false,
    };
    this.users.set(user.id, userWks);
  }

  updateUserPermissions(user: IWorkspaceUserRow) {
    const userWks = {
      id: user.id,
      name: user.name,
      adminWorkspace: user.adminWorkspace,
      deployArtifact: user.deployArtifact,
      lifecycleArtifact: user.lifecycleArtifact,
      isSavingUserPermissions: user.isSavingUserPermissions,
    };

    this.users.set(user.id, userWks);
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  getBuses() {
    return Array.from(this.buses.values());
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

    if (this.buses.size > 1) {
      this.getMoreServicesEndpoints();
    }
    const sharedLibraries = flatMap(containers, c => c.getSharedLibraries());

    const eventData = {
      buses: bus.toObj(),
      containers: toObj(containers),
      components: toObj(components),
      endpoints: toObj(this.endpoints),
      interfaces: toObj(this.interfaces),
      serviceAssemblies: toObj(serviceAssemblies),
      serviceUnits: toObj(serviceUnits),
      services: toObj(this.services),
      sharedLibraries: toObj(sharedLibraries),
    };

    return { id: bus.id, eventData };
  }

  makeServices(servicesList: {
    endpoints: {
      id: string;
      name: string;
      interfacesIds: string[];
      serviceId: string;
      componentId: string;
    }[];
    interfaces: IInterfaceBackendSSECommon[];
    services: IServiceBackendSSECommon[];
  }) {
    const interfaces = new Map<string, Interface>();
    const services = new Map<string, Service>();
    const endpoints = new Map<string, Endpoint>();

    if (!servicesList) {
      return this.makeEventData(interfaces, services, endpoints);
    }

    servicesList.interfaces.forEach(itf => {
      const newInterface = interfacesService.create(
        itf.id,
        itf.components,
        itf.name
      );
      interfaces.set(newInterface.id, newInterface);
    });

    servicesList.services.forEach(serv => {
      const newService = servicesService.create(
        serv.id,
        serv.components,
        serv.name
      );
      services.set(newService.id, newService);
    });

    servicesList.endpoints.forEach(edp => {
      const newEndpoint = endpointsService.create(
        edp.id,
        edp.interfacesIds,
        edp.serviceId,
        edp.componentId,
        edp.name
      );
      endpoints.set(newEndpoint.id, newEndpoint);
    });

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

  addEndpointsServices(servicesList: {
    endpoints: {
      id: string;
      name: string;
      interfacesIds: string[];
      serviceId: string;
      componentId: string;
    }[];
    interfaces: IInterfaceBackendSSECommon[];
    services: IServiceBackendSSECommon[];
  }) {
    servicesList.interfaces.forEach(itf => {
      const newInterface = interfacesService.create(
        itf.id,
        itf.components,
        itf.name
      );
      this.interfaces.push(newInterface);
    });

    servicesList.services.forEach(serv => {
      const newService = servicesService.create(
        serv.id,
        serv.components,
        serv.name
      );
      this.services.push(newService);
    });

    servicesList.endpoints.forEach(edp => {
      const newEndpoint = endpointsService.create(
        edp.id,
        edp.interfacesIds,
        edp.serviceId,
        edp.componentId,
        edp.name
      );
      this.endpoints.push(newEndpoint);
    });
  }

  refreshServices() {
    this.interfaces = [];
    this.services = [];
    this.endpoints = [];

    Object.values(refreshedServices.interfaces).forEach(int => {
      const refreshedInterface = interfacesService.create(
        int.id,
        int.components,
        int.name
      );
      this.interfaces.push(refreshedInterface);
    });

    Object.values(refreshedServices.services).forEach(serv => {
      const refreshedService = servicesService.create(
        serv.id,
        serv.components,
        serv.name
      );
      this.services.push(refreshedService);
    });

    Object.values(refreshedServices.endpoints).forEach(edp => {
      const refreshedEndpoint = endpointsService.create(
        edp.id,
        edp.interfacesIds,
        edp.serviceId,
        edp.componentId,
        edp.name
      );
      this.endpoints.push(refreshedEndpoint);
    });
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
      workspace: this.getContent(),
      users: this.getUsersBackend(),
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
      users: toObj(
        flatMap(workspaces, w =>
          w.getUsers().map(userWkss => BackendUser.get(userWkss.id))
        )
      ),
    };
  }

  create(
    users?: IWorkspaceUserRow[],
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
    ws.getUsers().forEach(user => {
      if (BackendUser.get(user.id).lastWorkspace === id) {
        BackendUser.get(user.id).lastWorkspace = null;
      }
    });
    this.workspaces.delete(id);
  }

  getRefreshedServices(workspaceId: string) {
    this.workspaces.get(workspaceId).refreshServices();
    return refreshedServices;
  }
}

export const workspacesService = new Workspaces();

const ws0 = workspacesService.create();
ws0.shortDescription = 'This is short description for the Workspace 0.';
ws0.description =
  'You can import a bus from the container **192.168.0.1:7700** to get a mock bus.';

// add 4 interfaces, 5 services and 6 endpoints
export const initializedServicesForWks0 = {
  endpoints: [
    {
      id: '1',
      name: 'edpt-89p82661-test-31o4-l391-00',
      interfacesIds: ['1', '2'],
      serviceId: '1',
      componentId: 'idComp0',
    },
    {
      id: '2',
      name: 'edpt-89p82661-test-31o4-l391-01',
      interfacesIds: ['1'],
      serviceId: '2',
      componentId: 'idComp0',
    },
    {
      id: '3',
      name: 'edpt-89p82661-test-31o4-l391-02',
      interfacesIds: ['2'],
      serviceId: '3',
      componentId: 'idComp0',
    },
    {
      id: '4',
      name: 'edpt-89p82661-test-31o4-l391-03',
      interfacesIds: ['3'],
      serviceId: '4',
      componentId: 'idComp0',
    },
    {
      id: '5',
      name: 'edpt-89p82661-test-31o4-l391-04',
      interfacesIds: ['3'],
      serviceId: '4',
      componentId: 'idComp0',
    },
    {
      id: '6',
      name: 'edpt-89p82661-test-31o4-l391-05',
      interfacesIds: ['4'],
      serviceId: '5',
      componentId: 'idComp0',
    },
  ],
  interfaces: [
    {
      id: '1',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart0',
      components: ['idComp0'],
    },
    {
      id: '2',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart1',
      components: ['idComp0'],
    },
    {
      id: '3',
      name:
        '{http://namespace-example.fr/interface/technique/version/2.0}Interface-Localpart2',
      components: ['idComp0'],
    },
    {
      id: '4',
      name:
        '{http://namespace-example.fr/interface/technique/version/3.0}Interface-Localpart3',
      components: ['idComp0'],
    },
  ],
  services: [
    {
      id: '1',
      name:
        '{http://namespace-example.fr/service/technique/version/1.0}Localpart0',
      components: ['idComp0'],
    },
    {
      id: '2',
      name:
        '{http://namespace-example.fr/service/technique/version/1.0}Localpart1',
      components: ['idComp0'],
    },
    {
      id: '3',
      name:
        '{http://namespace-example.fr/service/technique/version/2.0}Localpart2',
      components: ['idComp0'],
    },
    {
      id: '4',
      name:
        '{http://namespace-example.fr/service/technique/version/3.0}Localpart3',
      components: ['idComp0'],
    },
    {
      id: '5',
      name:
        '{http://namespace-example.fr/service/technique/version/3.0}Localpart4',
      components: ['idComp0'],
    },
  ],
};

ws0.addEndpointsServices(initializedServicesForWks0);

const ws1 = workspacesService.create([
  {
    id: BackendUser.get('admin').id,
    name: BackendUser.get('admin').name,
    adminWorkspace: true,
    deployArtifact: true,
    lifecycleArtifact: true,
    isSavingUserPermissions: false,
  },
  {
    id: BackendUser.get('adminldap').id,
    name: BackendUser.get('adminldap').name,
    adminWorkspace: true,
    deployArtifact: true,
    lifecycleArtifact: true,
    isSavingUserPermissions: false,
  },
  {
    id: BackendUser.get('bescudie').id,
    name: BackendUser.get('bescudie').name,
    adminWorkspace: false,
    deployArtifact: false,
    lifecycleArtifact: false,
    isSavingUserPermissions: false,
  },
  {
    id: BackendUser.get('mrobert').id,
    name: BackendUser.get('mrobert').name,
    adminWorkspace: false,
    deployArtifact: true,
    lifecycleArtifact: true,
    isSavingUserPermissions: false,
  },
  {
    id: BackendUser.get('cchevalier').id,
    name: BackendUser.get('cchevalier').name,
    adminWorkspace: false,
    deployArtifact: true,
    lifecycleArtifact: false,
    isSavingUserPermissions: false,
  },
  {
    id: BackendUser.get('vnoel').id,
    name: BackendUser.get('vnoel').name,
    adminWorkspace: false,
    deployArtifact: false,
    lifecycleArtifact: true,
    isSavingUserPermissions: false,
  },
]);

// add 2 interfaces, 2 services and 3 endpoints
const initializedServicesForWks1 = {
  endpoints: [
    {
      id: '7',
      name: 'edpt-89p82661-test-31o4-l391-05',
      interfacesIds: ['5'],
      serviceId: '6',
      componentId: 'idComp6',
    },
    {
      id: '8',
      name: 'edpt-89p82661-test-31o4-l391-06',
      interfacesIds: ['6'],
      serviceId: '7',
      componentId: 'idComp6',
    },
  ],
  interfaces: [
    {
      id: '5',
      name:
        '{http://namespace-example.fr/interface/metiers/version/1.0}Interface-Localpart0',
      components: ['idComp6'],
    },
    {
      id: '6',
      name:
        '{http://namespace-example.fr/interface/metiers/version/1.0}Interface-Localpart1',
      components: ['idComp6'],
    },
  ],
  services: [
    {
      id: '6',
      name:
        '{http://namespace-example.fr/service/metiers/version/1.0}Localpart0',
      components: ['idComp6'],
    },
    {
      id: '7',
      name:
        '{http://namespace-example.fr/service/metiers/version/1.0}Localpart1',
      components: ['idComp6'],
    },
  ],
};
ws1.addEndpointsServices(initializedServicesForWks1);

// add 2 endpoints, 2 interfaces, 2 services
const refreshedServices = {
  endpoints: {
    '2': {
      id: '2',
      name: 'edpt-89p82661-test-31o4-l391-00',
      interfacesIds: ['1'],
      serviceId: '2',
      componentId: 'idComp0',
    },
    '10': {
      id: '10',
      interfacesIds: ['7'],
      serviceId: '8',
      name: 'edpt-89p82661-refr-31o4-l391-10',
      componentId: 'idComp0',
    },
    '11': {
      id: '11',
      interfacesIds: ['8'],
      serviceId: '9',
      name: 'edpt-89p82661-refr-31o4-l391-01',
      componentId: 'idComp0',
    },
  },
  interfaces: {
    '1': {
      id: '1',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart0',
      components: ['idComp0'],
    },
    '7': {
      id: '7',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-LocalpartRefreshed0',
      components: ['idComp0'],
    },
    '8': {
      id: '8',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-LocalpartRefreshed1',
      components: ['idComp0'],
    },
  },
  services: {
    '2': {
      id: '2',
      name:
        '{http://namespace-example.fr/service/technique/version/1.0}Localpart1',
      components: ['idComp0'],
    },
    '8': {
      id: '8',
      name:
        '{http://namespace-example.fr/service/metiers/version/1.0}Localpart1',
      components: ['idComp0'],
    },
    '9': {
      id: '9',
      name:
        '{http://namespace-example.fr/service/technique/version/1.0}LocalpartRefreshed0',
      components: ['idComp0'],
    },
  },
};

export const servicesForComp0 = {
  endpoints: [
    {
      id: '12',
      name: 'edpt-13f82663-test-91i4-a147-3',
      interfacesIds: ['9'],
      serviceId: '11',
      componentId: 'idComp0',
    },
    {
      id: '13',
      name: 'edpt-13f82663-test-91i4-a147-3',
      interfacesIds: ['10'],
      serviceId: '12',
      componentId: 'idComp0',
    },
    {
      id: '14',
      name: 'edpt-13f82663-test-91i4-a111-2',
      interfacesIds: ['10'],
      serviceId: '13',
      componentId: 'idComp0',
    },
  ],
  interfaces: [
    {
      id: '9',
      name:
        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart97',
      components: ['idComp0'],
    },
    {
      id: '10',
      name:
        '{http://namespace-example.fr/interface/technique/version/2.0}Interface-Localpart97',
      components: ['idComp0'],
    },
  ],
  services: [
    {
      id: '11',
      name:
        '{http://namespace-example.fr/service/technique/version/1.0}Localpart97',
      components: ['idComp0'],
    },
    {
      id: '12',
      name:
        '{http://namespace-example.fr/service/technique/version/2.0}Localpart97',
      components: ['idComp0'],
    },
    {
      id: '13',
      name:
        '{http://namespace-example.fr/service/technique/version/3.0}Localpart97',
      components: ['idComp0'],
    },
  ],
};

export const servicesForComp1 = {
  endpoints: [
    {
      id: '15',
      name: 'edpt-13f82663-test-91i4-a147-2',
      interfacesIds: ['11'],
      serviceId: '14',
      componentId: 'idComp1',
    },
    {
      id: '16',
      name: 'edpt-13f82663-test-91i4-a147-3',
      interfacesIds: ['12'],
      serviceId: '15',
      componentId: 'idComp1',
    },
    {
      id: '17',
      name: 'edpt-13f82663-test-91i4-a112-2',
      interfacesIds: ['13'],
      serviceId: '16',
      componentId: 'idComp1',
    },
  ],
  interfaces: [
    {
      id: '11',
      name:
        '{http://namespace-example.fr/interface/technique/environmental/international/version/1.0}Interface-Localpart98',
      components: ['idComp1'],
    },
    {
      id: '12',
      name:
        '{http://namespace-example.fr/interface/technique/environmental/international/version/1.0}Interface-Localpart99',
      components: ['idComp1'],
    },
    {
      id: '13',
      name:
        '{http://namespace-example.fr/interface/technique/environmental/region/pays/international/version/1.0}Interface-Localpart96',
      components: ['idComp1'],
    },
    {
      id: '14',
      name:
        '{http://namespace-example.fr/interface/technique/global/region/pays/international/version/1.0}Interface-Localpart97',
      components: ['idComp1'],
    },
  ],
  services: [
    {
      id: '14',
      name:
        '{http://namespace-example.fr/service/technique/environmental/international/version/1.0}Localpart98',
      components: ['idComp1'],
    },
    {
      id: '15',
      name:
        '{http://namespace-example.fr/service/technique/environmental/international/version/1.0}Localpart99',
      components: ['idComp1'],
    },
    {
      id: '16',
      name:
        '{http://namespace-example.fr/service/technique/environmental/region/pays/international/version/1.0}Localpart96',
      components: ['idComp1'],
    },
  ],
};
