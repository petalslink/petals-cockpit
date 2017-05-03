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

import { ServiceUnit } from './service-units-mock';
import { Container } from './containers-mock';
import {
  IComponentBackendSSE,
  IComponentBackendDetails,
  ComponentState,
  EComponentType
} from './../app/features/cockpit/workspaces/state/components/component.interface';

export class Components {
  private readonly components = new Map<string, Component>();

  constructor() { }

  create(container: Container, name?: string, state?: ComponentState) {
    const component = new Component(container, name, state);

    this.components.set(component.id, component);
    return component;
  }

  get(id: string) {
    return this.components.get(id);
  }
}

export const componentsService = new Components();

export class Component {
  private static cpt = 0;
  public readonly id: string;
  public readonly container: Container;
  private readonly serviceUnits = new Map<string, ServiceUnit>();
  public readonly name: string;
  public state: ComponentState;
  public parameters: { [key: string]: string };

  constructor(container: Container, name?: string, state: ComponentState = 'Started') {
    const i = Component.cpt++;
    this.container = container;
    this.id = `idComp${i}`;
    this.name = name ? name : `Comp ${i}`;
    this.state = state;
    this.parameters = {
      'http-port': '8080',
      'enable-https': 'false'
    };
  }

  getServiceUnits() {
    return Array.from(this.serviceUnits.values());
  }

  addServiceUnit(serviceUnit: ServiceUnit) {
    this.serviceUnits.set(serviceUnit.id, serviceUnit);
  }

  toObj(): { [id: string]: IComponentBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        type: EComponentType.BC,
        state: this.state,
        containerId: this.container.id,
        serviceUnits: Array.from(this.serviceUnits.keys())
      }
    };
  }

  getDetails(): IComponentBackendDetails {
    if (this.state === 'Loaded') {
      return {
        parameters: this.parameters
      };
    }

    return {
      parameters: {}
    };
  }
}
