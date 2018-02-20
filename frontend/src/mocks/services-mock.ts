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
  IServiceBackendDetails,
  IServiceBackendSSE,
} from 'app/shared/services/services.service';

export class Service {
  public readonly id: string;
  public readonly name: string;

  constructor(
    public cpt: number,
    private containerId: string,
    private componentId: string,
    name?: string
  ) {
    const i = cpt;
    this.id = `idService${i}`;
    this.name =
      name ||
      `{http://namespace-example.fr/service/technique/version/${i}.0}Localpart${i}`;
  }

  toObj(): { [id: string]: IServiceBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        containerId: this.containerId,
        componentId: this.componentId,
      },
    };
  }

  getDetails(): { service: IServiceBackendDetails } {
    return {
      service: {
        id: this.id,
        name: this.name,
        containerId: this.containerId,
        componentId: this.componentId,
      },
    };
  }
}

export class Services {
  private readonly services = new Map<string, Service>();
  protected cpt = 0;
  constructor() {}

  create(containerId: string, componentId: string, name?: string) {
    const service = new Service(this.cpt++, containerId, componentId, name);
    this.services.set(service.id, service);
    return service;
  }

  get(id: string) {
    return this.services.get(id);
  }
}

export const servicesService = new Services();
