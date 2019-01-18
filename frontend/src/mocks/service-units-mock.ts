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

import {
  IServiceUnitBackendDetails,
  IServiceUnitBackendSSE,
} from '@shared/services/service-units.service';
import { Component } from './components-mock';
import { ServiceAssembly } from './service-assemblies-mock';

class ServiceUnits {
  private readonly serviceUnits = new Map<string, ServiceUnit>();

  constructor() {}

  create(
    component: Component,
    serviceAssembly: ServiceAssembly,
    name?: string
  ) {
    const serviceUnit = new ServiceUnit(component, serviceAssembly, name);
    this.serviceUnits.set(serviceUnit.id, serviceUnit);
    return serviceUnit;
  }

  get(id: string) {
    return this.serviceUnits.get(id);
  }
}

export const serviceUnitsService = new ServiceUnits();

export class ServiceUnit {
  private static cpt = 0;

  public readonly id: string;
  public readonly name: string;
  public readonly component: Component;
  public readonly serviceAssembly: ServiceAssembly;

  constructor(
    component: Component,
    serviceAssembly: ServiceAssembly,
    name?: string
  ) {
    const i = ServiceUnit.cpt++;
    this.id = `idSu${i}`;
    this.name = name ? name : `SU ${i}`;
    this.component = component;
    this.serviceAssembly = serviceAssembly;
  }

  toObj(): { [id: string]: IServiceUnitBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        containerId: this.component.container.id,
        componentId: this.component.id,
        serviceAssemblyId: this.serviceAssembly.id,
      },
    };
  }

  getDetails(): IServiceUnitBackendDetails {
    return {};
  }
}
