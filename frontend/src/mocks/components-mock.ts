import { serviceUnitsService, ServiceUnit } from './service-units-mock';

export class Components {
  private components = new Map<string, Component>();

  constructor() { }

  create(name?: string) {
    const component = new Component(name);
    this.components.set(component.getId(), component);
    return component;
  }

  get(id: string) {
    return this.components.get(id);
  }
}

export const componentsService = new Components();

export class Component {
  private static cpt = 0;
  private id: string;
  private serviceUnits = new Map<string, ServiceUnit>();
  private state = 'Started';
  private name: string;

  constructor(name?: string) {
    const i = Component.cpt++;
    this.id = `idComp${i}`;
    this.name = name ? name : `Comp ${i}`;

    // by default add 2 service units
    this.addServiceUnit();
    this.addServiceUnit();
  }

  setState(newState: string) {
    this.state = newState;
  }

  public getId() {
    return this.id;
  }

  getServiceUnits() {
    return Array.from(this.serviceUnits.values());
  }

  addServiceUnit(name?: string) {
    const serviceUnit = serviceUnitsService.create(name);
    this.serviceUnits.set(serviceUnit.getId(), serviceUnit);

    return serviceUnit;
  }

  toObj() {
    return {
      [this.id]: {
        name: this.name,
        serviceUnits: Array.from(this.serviceUnits.keys())
      }
    };
  }

  getDetails() {
    return {
      state: this.state,
      type: 'BC'
    };
  }
}
