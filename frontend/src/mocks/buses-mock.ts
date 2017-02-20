import { IBusInProgress } from './../app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { containersService, Container } from './containers-mock';

export class Buses {
  private _buses = new Map<string, Bus>();

  constructor() { }

  create() {
    const bus = new Bus();
    this._buses.set(bus.getIdFormatted(), bus);
    return bus;
  }

  read(idBus: string) {
    return this._buses.get(idBus);
  }
}

export const busesService = new Buses();

export class BusesInProgress {
  private _busesInProgress = new Map<string, BusInProgress>();

  constructor() { }

  create(bus?: IBusInProgress) {
    const busInProgress = new BusInProgress(bus);
    this._busesInProgress.set(busInProgress.getIdFormatted(), busInProgress);
    return busInProgress;
  }
}

export const busesInProgressService = new BusesInProgress();

export class BusBase {
  private static _cpt = 0;
  protected _id: number;

  constructor() {
    this._id = BusBase._cpt++;
  }

  public getIdFormatted() {
    return `idBus${this._id}`;
  }
}

export class Bus extends BusBase {
  private _containers: Container[] = [];

  constructor() {
    super();

    // by default add 2 containers
    this._containers.push(containersService.create(this));
    this._containers.push(containersService.create(this));
  }

  getContainers() {
    return this._containers;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        isImporting: false,
        name: `Bus ${this._id}`,
        state: `UNDEPLOYED`,
        containers: this._containers.map(container => container.getIdFormatted())
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

  constructor(bus?: IBusInProgress) {
    super();
    if (bus) {
      this.ip = bus.ip;
      this.port = bus.port;
      this.username = bus.username;
    } else {
      this.ip = `192.168.0.${this._id}`;
      this.port = 7700;
      this.username = `petals`;
    }
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        id: this.getIdFormatted(),
        ip: this.ip,
        port: this.port,
        username: this.username
      }
    };
  }
}
