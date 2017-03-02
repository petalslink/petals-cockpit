import { serviceUnitsService, ServiceUnit } from './service-units-mock';

export class Components {
  private components = new Map<string, Component>();

  constructor() { }

  create() {
    const component = new Component();
    this.components.set(component.getIdFormatted(), component);
    return component;
  }

  read(idComponent: string) {
    return this.components.get(idComponent);
  }
}

export const componentsService = new Components();

export class Component {
  private static cpt = 0;
  protected id: number;
  private serviceUnits: ServiceUnit[] = [];

  constructor() {
    this.id = Component.cpt++;

    // by default add 2 service units
    this.serviceUnits.push(serviceUnitsService.create());
    this.serviceUnits.push(serviceUnitsService.create());
  }

  public getIdFormatted() {
    return `idComp${this.id}`;
  }

  getServiceUnits() {
    return this.serviceUnits;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `Comp ${this.id}`,
        serviceUnits: this.serviceUnits.map(serviceUnit => serviceUnit.getIdFormatted())
      }
    };
  }

  getDetails() {
    return {
      state: 'Started',
      type: 'BC'
    };
  }
}
