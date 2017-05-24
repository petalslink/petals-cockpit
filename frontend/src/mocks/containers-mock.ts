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

import { componentsService, Component } from './components-mock';
import { Bus } from './buses-mock';
import { ServiceAssembly, serviceAssembliesService } from './service-assemblies-mock';
import { IContainerBackendSSE, IContainerBackendDetails } from './../app/features/cockpit/workspaces/state/containers/container.interface';
import { ComponentState } from './../app/features/cockpit/workspaces/state/components/component.interface';
import { ServiceAssemblyState } from './../app/features/cockpit/workspaces/state/service-assemblies/service-assembly.interface';

export class Containers {
  private readonly containers = new Map<string, Container>();

  constructor() { }

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
  }

  getComponents() {
    return Array.from(this.components.values());
  }

  getServiceAssemblies() {
    return Array.from(this.serviceAssemblies.values());
  }

  addComponent(state?: ComponentState, name?: string) {
    const component = componentsService.create(this, name, state);
    this.components.set(component.id, component);

    return component;
  }

  addServiceAssembly(state?: ServiceAssemblyState, name?: string) {
    const serviceAssembly = serviceAssembliesService.create(this, name, state);

    const it = this.components.values();
    const c1 = it.next().value;
    const c2 = it.next().value;

    const su1 = serviceAssembly.addServiceUnit(c1, name ? `su1-${name}` : undefined);
    const su2 = serviceAssembly.addServiceUnit(c2, name ? `su2-${name}` : undefined);

    c1.addServiceUnit(su1);
    c2.addServiceUnit(su2);
    this.serviceAssemblies.set(serviceAssembly.id, serviceAssembly);

    return [serviceAssembly.toObj(), { ...su1.toObj(), ...su2.toObj() }];
  }

  addServiceUnit(component: Component, state?: ServiceAssemblyState, name?: string) {
    const serviceAssembly = serviceAssembliesService.create(this, name ? `sa-${name}` : undefined, state);
    const serviceUnit = serviceAssembly.addServiceUnit(component, name);

    component.addServiceUnit(serviceUnit);
    this.serviceAssemblies.set(serviceAssembly.id, serviceAssembly);

    return [serviceAssembly, serviceUnit];
  }

  toObj(): { [id: string]: IContainerBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        busId: this.bus.id,
        components: Array.from(this.components.keys()),
        serviceAssemblies: Array.from(this.serviceAssemblies.keys())
      }
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
        'Linux 3.16.0-4-amd64 amd64'
      ].join('\n')
    };
  }
}
