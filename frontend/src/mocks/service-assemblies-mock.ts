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

import { Container } from './containers-mock';
import { ServiceUnit, serviceUnitsService } from './service-units-mock';
import { Component } from './components-mock';
import {
  ServiceAssemblyState, IServiceAssemblyBackendSSE, IServiceAssemblyBackendDetails
} from 'app/shared/services/service-assemblies.service';

class ServiceAssemblies {
  private readonly serviceAssemblies = new Map<string, ServiceAssembly>();

  constructor() { }

  create(container: Container, name?: string, state?: ServiceAssemblyState) {
    const sa = new ServiceAssembly(container, name, state);
    this.serviceAssemblies.set(sa.id, sa);
    return sa;
  }

  get(id: string) {
    return this.serviceAssemblies.get(id);
  }
}

export const serviceAssembliesService = new ServiceAssemblies();

export class ServiceAssembly {
  private static cpt = 0;
  public readonly id: string;
  public state: ServiceAssemblyState;
  public readonly name: string;
  public readonly container: Container;
  private readonly serviceUnits = new Map<string, ServiceUnit>();

  constructor(container: Container, name?: string, state: ServiceAssemblyState = 'Shutdown') {
    const i = ServiceAssembly.cpt++;
    this.id = `idSa${i}`;
    this.name = name ? name : `SA ${i}`;
    this.container = container;
    this.state = state;
  }

  getServiceUnits() {
    return Array.from(this.serviceUnits.values());
  }

  addServiceUnit(component: Component, name?: string) {
    const serviceUnit = serviceUnitsService.create(component, this, name);

    this.serviceUnits.set(serviceUnit.id, serviceUnit);

    return serviceUnit;
  }

  toObj(): { [id: string]: IServiceAssemblyBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        state: this.state,
        containerId: this.container.id,
        serviceUnits: Array.from(this.serviceUnits.keys())
      }
    };
  }

  getDetails(): IServiceAssemblyBackendDetails {
    return {};
  }

  setState(newState: ServiceAssemblyState) {
    this.state = newState;
  }
}
