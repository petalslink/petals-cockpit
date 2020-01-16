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

import {
  IBusBackendDetails,
  IBusBackendSSE,
  IBusImport,
  IBusInProgressBackend,
} from '@shared/services/buses.service';
import { Container, containersService } from './containers-mock';
import { Workspace } from './workspaces-mock';

export class Buses {
  private readonly buses = new Map<string, Bus>();

  constructor() {}

  create(workspace: Workspace) {
    const bus = new Bus(workspace);
    this.buses.set(bus.id, bus);
    return bus;
  }

  read(id: string) {
    return this.buses.get(id);
  }
}

export const busesService = new Buses();

export class BusesInProgress {
  private readonly busesInProgress = new Map<string, BusInProgress>();

  constructor() {}

  create(workspace: Workspace, bus?: IBusImport) {
    const busInProgress = new BusInProgress(workspace, bus);
    this.busesInProgress.set(busInProgress.id, busInProgress);
    return busInProgress;
  }
}

export const busesInProgressService = new BusesInProgress();

export class BusBase {
  protected static cpt = 0;
  public readonly id: string;
  public readonly name: string;
  public readonly workspace: Workspace;

  constructor(workspace: Workspace) {
    const i = BusBase.cpt++;
    this.id = `idBus${i}`;
    this.name = `Bus ${i}`;
    this.workspace = workspace;
  }
}

export class Bus extends BusBase {
  private readonly containers = new Map<string, Container>();

  constructor(workspace: Workspace) {
    super(workspace);

    // workspace called 'Min Workspace' should contain only 1 bus and 1 container
    if (workspace.name === 'Min Workspace') {
      this.addContainer();
    } else {
      // by default add 2 containers
      this.addContainer();
      this.addContainer();
    }
  }

  getContainers() {
    return Array.from(this.containers.values());
  }

  addContainer(name?: string) {
    const container = containersService.create(this, name);
    this.containers.set(container.id, container);
  }

  toObj(): { [id: string]: IBusBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        workspaceId: this.workspace.id,
        containers: Array.from(this.containers.keys()),
      },
    };
  }

  getDetails(): IBusBackendDetails {
    return {};
  }
}

export class BusInProgress extends BusBase {
  public readonly ip: string;
  public readonly port: number;
  public readonly username: string;

  constructor(workspace: Workspace, bus?: IBusImport) {
    super(workspace);
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

  toObj(): { [id: string]: IBusInProgressBackend } {
    return {
      [this.id]: {
        id: this.id,
        ip: this.ip,
        port: this.port,
        username: this.username,
        importError: undefined,
      },
    };
  }
}
