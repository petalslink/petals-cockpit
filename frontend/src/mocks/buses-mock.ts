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

import { IBusImport } from './../app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { containersService, Container } from './containers-mock';

export class Buses {
  private buses = new Map<string, Bus>();

  constructor() { }

  create() {
    const bus = new Bus();
    this.buses.set(bus.getId(), bus);
    return bus;
  }

  read(id: string) {
    return this.buses.get(id);
  }
}

export const busesService = new Buses();

export class BusesInProgress {
  private busesInProgress = new Map<string, BusInProgress>();

  constructor() { }

  create(bus?: IBusImport) {
    const busInProgress = new BusInProgress(bus);
    this.busesInProgress.set(busInProgress.getId(), busInProgress);
    return busInProgress;
  }
}

export const busesInProgressService = new BusesInProgress();

export class BusBase {
  protected static cpt = 0;
  protected id: string;
  protected name: string;

  constructor() {
    const i = BusBase.cpt++;
    this.id = `idBus${i}`;
    this.name = `Bus ${i}`;
  }

  public getId() {
    return this.id;
  }
}

export class Bus extends BusBase {
  private containers = new Map<string, Container>();

  constructor() {
    super();

    // by default add 2 containers
    this.addContainer();
    this.addContainer();
  }

  getContainers() {
    return Array.from(this.containers.values());
  }

  addContainer(name?: string) {
    const container = containersService.create(this, name);
    this.containers.set(container.getId(), container);
  }

  toObj() {
    return {
      [this.id]: {
        isImporting: false,
        name: this.name,
        state: `UNDEPLOYED`,
        containers: Array.from(this.containers.keys())
      }
    };
  }

  getDetails() {
    return {};
  }
}

export class BusInProgress extends BusBase {

  private ip: string;
  private port: number;
  private username: string;

  constructor(bus?: IBusImport) {
    super();
    if (bus) {
      this.ip = bus.ip;
      this.port = bus.port;
      this.username = bus.username;
    } else {
      this.ip = `192.168.0.${BusBase.cpt - 1}`;
      this.port = 7700;
      this.username = `petals`;
    }
  }

  toObj() {
    return {
      [this.id]: {
        ip: this.ip,
        port: this.port,
        username: this.username
      }
    };
  }
}
