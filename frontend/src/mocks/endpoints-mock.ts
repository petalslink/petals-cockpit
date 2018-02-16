/**
 * Copyright (C) 2017-2018 Linagora
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
  IEndpointBackendDetails,
  IEndpointBackendSSE,
} from 'app/shared/services/endpoints.service';

export class Endpoint {
  public readonly id: string;
  public readonly name: string;

  constructor(
    public cpt: number,
    private containerId: string,
    private componentId: string,
    name?: string
  ) {
    const i = cpt;
    this.id = `idEndpoint${i}`;
    this.name = name || `edpt-69f52660-test-19e9-a769-${i}`;
  }

  toObj(): { [id: string]: IEndpointBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        containerId: this.containerId,
        componentId: this.componentId,
      },
    };
  }

  getDetails(): { endpoint: IEndpointBackendDetails } {
    return {
      endpoint: {
        id: this.id,
        name: this.name,
        containerId: this.containerId,
        componentId: this.componentId,
      },
    };
  }
}

export class Endpoints {
  private readonly endpoints = new Map<string, Endpoint>();
  protected cpt = 0;
  constructor() {}

  create(containerId: string, componentId: string, name?: string) {
    const endpoint = new Endpoint(this.cpt++, containerId, componentId, name);
    this.endpoints.set(endpoint.id, endpoint);
    return endpoint;
  }

  get(id: string) {
    return this.endpoints.get(id);
  }
}

export const endpointsService = new Endpoints();
