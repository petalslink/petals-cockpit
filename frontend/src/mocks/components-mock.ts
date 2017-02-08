import { serviceUnitsService, ServiceUnit } from './service-units-mock';

export class Components {
  private _components = new Map<string, Component>();

  constructor() { }

  create() {
    const component = new Component();
    this._components.set(component.getIdFormatted(), component);
    return component;
  }

  read(idComponent: string) {
    return this._components.get(idComponent);
  }
}

export const componentsService = new Components();

export class Component {
  private static _cpt = 0;
  protected _id: number;
  private _serviceUnits: ServiceUnit[] = []

  constructor() {
    this._id = Component._cpt++;

    // by default add 2 service units
    this._serviceUnits.push(serviceUnitsService.create());
    this._serviceUnits.push(serviceUnitsService.create());
  }

  public getIdFormatted() {
    return `idComp${this._id}`;
  }

  getServiceUnits() {
    return this._serviceUnits;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `Comp ${this._id}`,
        serviceUnits: this._serviceUnits.map(serviceUnit => serviceUnit.getIdFormatted())
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
