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

import { Endpoint } from '@mocks/endpoints-mock';
import { Service } from '@mocks/services-mock';
import {
  IInterfaceBackendDetails,
  IInterfaceBackendSSE,
} from '@shared/services/interfaces.service';

export class Interface {
  public readonly id: string;
  public readonly name: string;
  private readonly services = new Map<string, Service>();
  private readonly endpoints = new Map<string, Endpoint>();
  public componentsIds: string[];

  constructor(id: string, private components: string[], name?: string) {
    this.id = id;
    this.name =
      name ||
      `{http://namespace-example.fr/interface/technique/version/${id}.0}Interface-Localpart${id}`;
    this.componentsIds = components;
  }

  toObj(): { [id: string]: IInterfaceBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        components: this.components,
      },
    };
  }

  getDetails(): IInterfaceBackendDetails {
    return {
      services: Array.from(this.services.keys()),
      endpoints: Array.from(this.endpoints.keys()),
    };
  }
}

export class Interfaces {
  private readonly interfaces = new Map<string, Interface>();
  constructor() {}

  create(id: string, components: string[], name?: string) {
    const itf = new Interface(id, components, name);
    this.interfaces.set(itf.id, itf);
    return itf;
  }

  get(id: string) {
    return this.interfaces.get(id);
  }
}

export const interfacesService = new Interfaces();
