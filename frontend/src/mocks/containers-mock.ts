import { componentsService, Component } from './components-mock';
import { Bus } from './buses-mock';

export class Containers {
  private containers = new Map<string, Container>();

  constructor() { }

  create(bus: Bus) {
    const container = new Container(bus);
    this.containers.set(container.getIdFormatted(), container);
    return container;
  }

  read(idContainer: string) {
    return this.containers.get(idContainer);
  }
}

export const containersService = new Containers();

export class Container {
  private static cpt = 0;
  private bus: Bus;
  protected id: number;
  private components: Component[] = [];

  constructor(bus: Bus) {
    this.id = Container.cpt++;
    this.bus = bus;

    // by default add 2 containers
    this.components.push(componentsService.create());
    this.components.push(componentsService.create());
  }

  getComponents() {
    return this.components;
  }

  public getIdFormatted() {
    return `idCont${this.id}`;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `Cont ${this.id}`,
        components: this.components.map(component => component.getIdFormatted())
      }
    };
  }

  getDetails() {
    const id = this.getIdFormatted();

    return {
      ip: `192.168.0.${this.id}`,
      port: 7700 + this.id,
      reachabilities: this.bus
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
