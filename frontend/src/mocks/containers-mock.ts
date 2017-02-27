import { componentsService, Component } from './components-mock';
import { Bus } from './buses-mock';

export class Containers {
  private _containers = new Map<string, Container>();

  constructor() { }

  create(bus: Bus) {
    const container = new Container(bus);
    this._containers.set(container.getIdFormatted(), container);
    return container;
  }

  read(idContainer: string) {
    return this._containers.get(idContainer);
  }
}

export const containersService = new Containers();

export class Container {
  private static _cpt = 0;
  private _bus: Bus;
  protected _id: number;
  private _components: Component[] = [];

  constructor(bus: Bus) {
    this._id = Container._cpt++;
    this._bus = bus;

    // by default add 2 containers
    this._components.push(componentsService.create());
    this._components.push(componentsService.create());
  }

  getComponents() {
    return this._components;
  }

  public getIdFormatted() {
    return `idCont${this._id}`;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `Cont ${this._id}`,
        components: this._components.map(component => component.getIdFormatted())
      }
    };
  }

  getDetails() {
    const id = this.getIdFormatted();

    return {
      ip: `192.168.0.${this._id}`,
      port: 7700 + this._id,
      reachabilities: this._bus
        .getContainers()
        .map(container => container.getIdFormatted())
        .filter(containerId => containerId !== id),
      systemInfo: [
        'Petals ESB µKernel 4.0.2',
        'Petals Standalone Shared Memory 4.0.2',
        'OpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation',
        'Linux 3.16.0-4-amd64 amd64'
      ].join('\n')
    };
  }
}
