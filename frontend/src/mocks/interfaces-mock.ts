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
  IInterfaceBackendDetails,
  IInterfaceBackendSSE,
} from 'app/shared/services/interfaces.service';

export class Interface {
  public readonly id: string;
  public readonly name: string;

  constructor(
    public cpt: number,
    private containerId: string,
    private componentId: string,
    name?: string
  ) {
    const i = cpt;
    this.id = `idInterface${i}`;
    this.name =
      name ||
      `{http://namespace-example.fr/interface/technique/version/${i}.0}Interface-Localpart${i}`;
  }

  toObj(): { [id: string]: IInterfaceBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        containerId: this.containerId,
        componentId: this.componentId,
      },
    };
  }

  getDetails(): { interface: IInterfaceBackendDetails } {
    return {
      interface: {
        id: this.id,
        name: this.name,
        containerId: this.containerId,
        componentId: this.componentId,
      },
    };
  }
}

export class Interfaces {
  private readonly interfaces = new Map<string, Interface>();
  protected cpt = 0;
  constructor() {}

  create(containerId: string, componentId: string, name?: string) {
    const itf = new Interface(this.cpt++, containerId, componentId, name);
    this.interfaces.set(itf.id, itf);
    return itf;
  }

  get(id: string) {
    return this.interfaces.get(id);
  }
}

export const interfacesService = new Interfaces();
