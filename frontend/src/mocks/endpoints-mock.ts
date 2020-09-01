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

import { IEndpointBackendSSE } from '@shared/services/endpoints.service';

export class Endpoint {
  public readonly id: string;
  public readonly name: string;
  public interfaces: string[];
  public serviceId: string;
  public componentId: string;

  constructor(
    id: string,
    interfacesIds: string[],
    serviceId: string,
    componentId: string,
    name?: string
  ) {
    this.id = id;
    this.name = name || `edpt-69f52660-test-19e9-a769-${id}`;
    this.interfaces = interfacesIds;
    this.serviceId = serviceId;
    this.componentId = componentId;
  }

  toObj(): { [id: string]: IEndpointBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        interfacesIds: this.interfaces,
        serviceId: this.serviceId,
        componentId: this.componentId,
      },
    };
  }
}

export class Endpoints {
  private readonly endpoints = new Map<string, Endpoint>();
  constructor() {}

  create(
    id: string,
    interfacesIds: string[],
    serviceId: string,
    componentId: string,
    name?: string
  ) {
    const endpoint = new Endpoint(
      id,
      interfacesIds,
      serviceId,
      componentId,
      name
    );
    this.endpoints.set(endpoint.id, endpoint);
    return endpoint;
  }

  get(id: string) {
    return this.endpoints.get(id);
  }
}

export const endpointsService = new Endpoints();
