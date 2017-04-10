import { componentsService, Component } from './components-mock';
import { Bus } from './buses-mock';

export class Containers {
  private containers = new Map<string, Container>();

  constructor() { }

  create(bus: Bus, name?: string) {
    const container = new Container(bus, name);
    this.containers.set(container.getId(), container);
    return container;
  }

  get(id: string) {
    return this.containers.get(id);
  }
}

export const containersService = new Containers();

export class Container {
  private static cpt = 0;
  private bus: Bus;
  private id: string;
  private name: string;
  private components = new Map<string, Component>();
  private ip: string;

  constructor(bus: Bus, name?: string) {
    const i = Container.cpt++;
    this.id = `idCont${i}`;
    this.name = name ? name : `Cont ${i}`;
    this.ip = `192.168.0.${i}`;
    this.bus = bus;

    // by default add 2 components
    this.addComponent();
    this.addComponent();
  }

  getComponents() {
    return Array.from(this.components.values());
  }

  getId() {
    return this.id;
  }

  addComponent(name?: string) {
    const component = componentsService.create(name);
    this.components.set(component.getId(), component);

    return component;
  }

  toObj() {
    return {
      [this.id]: {
        name: this.name,
        components: Array.from(this.components.keys())
      }
    };
  }

  getDetails() {
    return {
      ip: this.ip,
      port: 7700,
      reachabilities: this.bus
        .getContainers()
        .map(container => container.getId())
        .filter(id => id !== this.id),
      systemInfo: [
        'Petals ESB µKernel 4.0.2',
        'Petals Standalone Shared Memory 4.0.2',
        'OpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation',
        'Linux 3.16.0-4-amd64 amd64'
      ].join('\n')
    };
  }
}
