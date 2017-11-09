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

import { ComponentState } from 'app/shared/services/components.service';
import {
  IContainerBackendDetails,
  IContainerBackendSSE,
} from 'app/shared/services/containers.service';
import {
  IServiceAssemblyBackendSSE,
  ServiceAssemblyState,
} from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { ServiceUnit } from 'mocks/service-units-mock';
import { Bus } from './buses-mock';
import { Component, componentsService } from './components-mock';
import {
  serviceAssembliesService,
  ServiceAssembly,
} from './service-assemblies-mock';
import { sharedLibrariesService, SharedLibrary } from './shared-libraries-mock';

export class Containers {
  private readonly containers = new Map<string, Container>();

  constructor() {}

  create(bus: Bus, name?: string) {
    const container = new Container(bus, name);
    this.containers.set(container.id, container);
    return container;
  }

  get(id: string) {
    return this.containers.get(id);
  }
}

export const containersService = new Containers();

export class Container {
  private static cpt = 0;
  public readonly bus: Bus;
  public readonly id: string;
  public readonly name: string;
  private readonly components = new Map<string, Component>();
  private readonly serviceAssemblies = new Map<string, ServiceAssembly>();
  private readonly sharedLibraries = new Map<string, SharedLibrary>();
  public readonly ip: string;

  constructor(bus: Bus, name?: string) {
    const i = Container.cpt++;
    this.id = `idCont${i}`;
    this.name = name ? name : `Cont ${i}`;
    this.ip = `192.168.0.${i}`;
    this.bus = bus;

    // by default add 2 components each with an SU
    const c1 = this.addComponent('Started');
    this.addServiceUnit(c1, 'Started');
    const c2 = this.addComponent('Started');
    this.addServiceUnit(c2, 'Started');

    // and also a default service assembly
    this.addServiceAssembly('Started');

    const sl = this.addSharedLibrary();
    const c3 = this.addComponent('Started', undefined, sl);
    sl.registerComponent(c3);
  }

  getComponents() {
    return Array.from(this.components.values());
  }

  getServiceAssemblies() {
    return Array.from(this.serviceAssemblies.values());
  }

  getSharedLibraries() {
    return Array.from(this.sharedLibraries.values());
  }

  addComponent(state?: ComponentState, name?: string, ...sls: SharedLibrary[]) {
    const component = componentsService.create(this, name, state, ...sls);
    this.components.set(component.id, component);

    return component;
  }

  removeComponent(id: string) {
    const component = this.components.get(id);
    this.components.delete(id);
    component.getSharedLibraries().forEach(sl => sl.unregisterComponent(id));
  }

  addServiceAssembly(
    state?: ServiceAssemblyState,
    name?: string
  ): [
    { [id: string]: IServiceAssemblyBackendSSE },
    { [id: string]: IServiceUnitBackendSSE }
  ] {
    const serviceAssembly = serviceAssembliesService.create(this, name, state);

    const it = this.components.values();
    const c1 = it.next().value;
    const c2 = it.next().value;

    const su1 = serviceAssembly.addServiceUnit(
      c1,
      name ? `su1-${name}` : undefined
    );
    const su2 = serviceAssembly.addServiceUnit(
      c2,
      name ? `su2-${name}` : undefined
    );

    c1.registerServiceUnit(su1);
    c2.registerServiceUnit(su2);
    this.serviceAssemblies.set(serviceAssembly.id, serviceAssembly);

    return [serviceAssembly.toObj(), { ...su1.toObj(), ...su2.toObj() }];
  }

  removeServiceAssembly(id: string) {
    const sa = this.serviceAssemblies.get(id);
    this.serviceAssemblies.delete(id);
    sa
      .getServiceUnits()
      .forEach(su => su.component.unregisterServiceUnit(su.id));
  }

  addServiceUnit(
    component: Component,
    state?: ServiceAssemblyState,
    name?: string
  ): [ServiceAssembly, ServiceUnit] {
    const serviceAssembly = serviceAssembliesService.create(
      this,
      name ? `sa-${name}` : undefined,
      state
    );
    const serviceUnit = serviceAssembly.addServiceUnit(component, name);

    component.registerServiceUnit(serviceUnit);
    this.serviceAssemblies.set(serviceAssembly.id, serviceAssembly);

    return [serviceAssembly, serviceUnit];
  }

  addSharedLibrary(name?: string, version?: string) {
    const sl = sharedLibrariesService.create(this, name, version);
    this.sharedLibraries.set(sl.id, sl);
    return sl;
  }

  removeSharedLibrary(id: string) {
    this.sharedLibraries.delete(id);
  }

  toObj(): { [id: string]: IContainerBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        busId: this.bus.id,
        components: Array.from(this.components.keys()),
        serviceAssemblies: Array.from(this.serviceAssemblies.keys()),
        sharedLibraries: Array.from(this.sharedLibraries.keys()),
      },
    };
  }

  getDetails(): IContainerBackendDetails {
    return {
      ip: this.ip,
      port: 7700,
      reachabilities: this.bus
        .getContainers()
        .map(container => container.id)
        .filter(id => id !== this.id),
      systemInfo: [
        'Petals ESB µKernel 4.0.2',
        'Petals Standalone Shared Memory 4.0.2',
        'OpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation',
        'Linux 3.16.0-4-amd64 amd64',
      ].join('\n'),
    };
  }
}
