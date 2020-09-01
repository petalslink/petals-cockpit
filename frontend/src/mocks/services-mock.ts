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
import { Interface } from '@mocks/interfaces-mock';
import {
  IServiceBackendDetails,
  IServiceBackendSSE,
} from '@shared/services/services.service';

export class Service {
  public readonly id: string;
  public readonly name: string;
  private readonly interfaces = new Map<string, Interface>();
  private readonly endpoints = new Map<string, Endpoint>();
  public componentsIds: string[];

  constructor(id: string, private components: string[], name?: string) {
    this.id = id;
    this.name =
      name ||
      `{http://namespace-example.fr/service/technique/version/${id}.0}Localpart${id}`;
    this.componentsIds = components;
  }

  toObj(): { [id: string]: IServiceBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        components: Array.from(this.components),
      },
    };
  }

  getDetails(): IServiceBackendDetails {
    return {
      interfaces: Array.from(this.interfaces.keys()),
      endpoints: Array.from(this.endpoints.keys()),
    };
  }
}

export class Services {
  private readonly services = new Map<string, Service>();
  constructor() {}

  create(id: string, components: string[], name?: string) {
    const service = new Service(id, components, name);
    this.services.set(service.id, service);
    return service;
  }

  get(id: string) {
    return this.services.get(id);
  }
}

export const servicesService = new Services();
