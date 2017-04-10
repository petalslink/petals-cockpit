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
