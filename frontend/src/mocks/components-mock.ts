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

import { serviceUnitsService, ServiceUnit } from './service-units-mock';

export class Components {
  private components = new Map<string, Component>();

  constructor() { }

  create(name?: string) {
    const component = new Component(name);
    this.components.set(component.getId(), component);
    return component;
  }

  get(id: string) {
    return this.components.get(id);
  }
}

export const componentsService = new Components();

export class Component {
  private static cpt = 0;
  private id: string;
  private serviceUnits = new Map<string, ServiceUnit>();
  private state = 'Started';
  private name: string;

  constructor(name?: string) {
    const i = Component.cpt++;
    this.id = `idComp${i}`;
    this.name = name ? name : `Comp ${i}`;

    // by default add 2 service units
    this.addServiceUnit();
    this.addServiceUnit();
  }

  setState(newState: string) {
    this.state = newState;
  }

  public getId() {
    return this.id;
  }

  getServiceUnits() {
    return Array.from(this.serviceUnits.values());
  }

  addServiceUnit(name?: string) {
    const serviceUnit = serviceUnitsService.create(name);
    this.serviceUnits.set(serviceUnit.getId(), serviceUnit);

    return serviceUnit;
  }

  toObj() {
    return {
      [this.id]: {
        name: this.name,
        serviceUnits: Array.from(this.serviceUnits.keys())
      }
    };
  }

  getDetails() {
    return {
      name: this.name,
      state: this.state,
      type: 'BC'
    };
  }
}
